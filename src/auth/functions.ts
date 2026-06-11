import * as base64 from 'byte-base64';
import * as sha256 from 'fast-sha256';
import { Md5 } from 'ts-md5';

import { addHours, addSeconds, addYears, isBefore } from 'date-fns';
import { AbortControllerStub } from '../utilities/abort-controller';
import { toQueryString } from '../utilities/api';
import {
    clearAsyncTimeout,
    destroyWaitingAsync,
    timeout,
} from '../utilities/async';
import {
    convertPairStringToMap,
    generateNonce,
    getFragments,
    isNestedFrame,
    removeFragment,
    scoped_log,
} from '../utilities/general';
import { Signal, createSignal, sleep } from '../utilities/signal';
import { HashMap } from '../utilities/types';
import {
    AuthorizeDetails,
    MOCK_AUTHORITY,
    PlaceAuthOptions,
    PlaceAuthority,
    PlaceTokenResponse,
} from './interfaces';

const log = scoped_log('Auth');

/**
 * @private
 */
let _options: PlaceAuthOptions = {} as any;
/**
 * @private
 * Browser key store to use for authentication credentials. Defaults to `localStorage`
 */
let _storage: Storage = localStorage;
/**
 * @private
 * Authentication authority of for the current domain
 */
let _authority: PlaceAuthority | undefined;
/**
 * @private
 * Map of promises
 */
const _promises: HashMap<Promise<any> | undefined> = {};
/**
 * @private
 * OAuth 2 client ID for the application
 */
let _client_id: string = '';
/**
 * @private
 * OAuth 2 token generation code
 */
let _code: string = '';
/**
 * @private
 * In memory store for access token
 */
const _access_token = createSignal('');
/**
 * @private
 * In memory store for refresh token
 */
const _refresh_token = createSignal('');
/**
 * @private
 * Current API route
 */
let _route: string = `/api/engine/v2`;
/**
 * @private
 * Whether PlaceOS is online
 */
const _online = createSignal(false);
const _token_state = createSignal(false);

/**
 * @private
 */

let _failed_count = 0;

function hasCurrentToken(): boolean {
    if (_options.mock) return true;
    if (!_storage) return false;
    if (apiKey() && !_options.ignore_api_key) return true;
    const expires_at = _storage.getItem(`${_client_id}_expires_at`) || '';
    if (isBefore(+expires_at, new Date())) return false;
    return !!(
        _access_token.value || _storage.getItem(`${_client_id}_access_token`)
    );
}

function updateTokenState(): void {
    _token_state.set(hasCurrentToken());
}

/**
 * @private
 * Resolve a URL against the authority's domain if it is a relative path.
 * If the URL is already absolute (starts with http:// or https://), return as-is.
 * If the URL is relative (starts with /), prepend the protocol and authority domain.
 */
function resolveAuthorityUrl(url: string): string {
    if (!url || url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    const domain = _authority?.domain;
    if (domain) {
        const secure =
            _options.secure || window.location?.protocol.indexOf('https') >= 0;
        return `${secure ? 'https:' : 'http:'}//${domain}${url}`;
    }
    return url;
}

/** API Endpoint for the retrieved version of PlaceOS */
export function apiEndpoint(): string {
    const secure =
        _options.secure || window.location?.protocol.indexOf('https') >= 0;
    const api_host = `${secure ? 'https:' : 'http:'}//${
        _options.host || window.location?.host
    }`;
    return `${api_host}${httpRoute()}`;
}

/** Path of the API endpoint */
export function httpRoute() {
    return _options.version === 'ACA Engine' ? '/control/api' : _route;
}

/**
 * @hidden
 * Whether requests need token in the request URL or as a header
 */
export function needsTokenHeader(): boolean {
    return !!_options.token_header;
}

/** OAuth 2 client ID for the application */
export function clientId(): string {
    return _client_id;
}

/** Redirect URI for the OAuth flow */
export function redirectUri(): string {
    return _options.redirect_uri;
}

/** Manually set an X API key */
export function setAPI_Key(api_key: string, trusted: boolean = true) {
    _storage.setItem(`${_client_id}_x-api-key`, `${api_key}`);
    _storage.setItem('trusted', `${trusted}`);
    setToken('x-api-key', addYears(new Date(), 5).valueOf());
}

/** Get X API Key for application */
export function apiKey() {
    return checkStoreForAuthParam('x-api-key', false) || '';
}

/** Manually set an access token */
export function setToken(
    new_token: string,
    expires_at: number = addHours(new Date(), 2).valueOf(),
) {
    if (_options.ignore_api_key && new_token === 'x-api-key') return;
    _storage.setItem(`${_client_id}_expires_at`, `${expires_at}`);
    _storage.setItem(`${_client_id}_access_token`, new_token);
    _access_token.set(new_token);
    updateTokenState();
}

/** Bearer token for authenticating requests to PlaceOS */
export function token(return_expired: boolean = true): string {
    if (_options.mock) return 'mock-token';
    if (!_storage) return '';
    if (apiKey() && !_options.ignore_api_key) return 'x-api-key';
    const expires_at = _storage.getItem(`${_client_id}_expires_at`) || '';
    const access_token = _access_token.value;
    if (isBefore(+expires_at, new Date())) {
        log('Token expired. Requesting new token...');
        invalidateToken();
        if (!_promises.load_authority) {
            _failed_count += 1;
            timeout(
                're-authorise',
                async () => {
                    delete _promises.authorise;
                    await authorise().catch((e) =>
                        log.error(`Failed to get token:`, e),
                    );
                },
                200 * Math.min(20, _failed_count),
            );
        }
        if (!return_expired) {
            return '';
        }
    }
    return access_token || _storage.getItem(`${_client_id}_access_token`) || '';
}

/** Refresh token for renewing the access token */
export function refreshToken(): string {
    return (
        _refresh_token.value ||
        _storage.getItem(`${_client_id}_refresh_token`) ||
        ''
    );
}

/** Host domain of the PlaceOS server */
export function host(): string {
    return _options.host || window.location?.host;
}

/** Whether the application has an authentication token */
export function hasToken(): boolean {
    return !!token();
}

/** Signal for token state */
export function listenForToken(): Signal<boolean> {
    updateTokenState();
    return _token_state.asReadonly();
}

/** Place Authority details */
export function authority(): PlaceAuthority | undefined {
    return _authority;
}

/** Whether PlaceOS is online */
export function isOnline(): boolean {
    return _online.value;
}

/** Whether requests should use mock handlers */
export function isMock(): boolean {
    return !!_options.mock;
}

/** Whether PlaceOS connection is secure */
export function isSecure(): boolean {
    return !!_options.secure;
}

/** Signal for the online state of PlaceOS */
export function onlineState(): Signal<boolean> {
    return _online.asReadonly();
}

/** Whether this application is trusted */
export function isTrusted(): boolean {
    return (
        checkStoreForAuthParam('trust') === 'true' ||
        checkStoreForAuthParam('trusted') === 'true'
    );
}

/** Whether this application is on a fixed location device */
export function isFixedDevice(): boolean {
    return (
        (!!apiKey() && !_options.ignore_api_key) ||
        checkStoreForAuthParam('fixed_device') === 'true'
    );
}

/**
 * @hidden
 * Check for an auth related param in the URL or storage
 * @param name Name of the paramater to look for
 */
export function checkStoreForAuthParam(
    name: string,
    store: boolean = true,
): string {
    const fragments = getFragments();
    let param = fragments[name];
    /* istanbul ignore else */
    if (_storage) {
        const key = `${clientId()}_${name}`;
        param = param || _storage.getItem(key) || _storage.getItem(name) || '';
        if (store) _storage.setItem(key, `${param}`);
    }
    return param;
}

/** Initialise authentication for the http and realtime APIs */
export async function setup(options: PlaceAuthOptions): Promise<void> {
    _options = options || _options;
    _options.token_header = _options.token_header ?? isNestedFrame();
    if (!window.AbortController) {
        (window as any).AbortController = AbortControllerStub;
    }
    // Intialise storage
    _storage = _options.storage === 'session' ? sessionStorage : localStorage;
    _client_id = Md5.hashStr(_options.redirect_uri, false);
    listenForAppFocus();
    if (_options.delay && _options.delay > 0) {
        await sleep(_options.delay!);
    }
    return loadAuthority();
}

/**
 * @private
 */
let _listening_for_focus = false;

/**
 * @private
 * Watch for the application returning to the foreground. The user may have
 * logged in from another tab, browser or application while this one was in
 * the background, leaving the cached authority's `session` state stale.
 */
function listenForAppFocus(): void {
    if (_listening_for_focus) return;
    _listening_for_focus = true;
    window.addEventListener('focus', onAppFocus);
    document.addEventListener('visibilitychange', onAppFocus);
}

/**
 * @private
 */
function stopListeningForAppFocus(): void {
    if (!_listening_for_focus) return;
    _listening_for_focus = false;
    window.removeEventListener('focus', onAppFocus);
    document.removeEventListener('visibilitychange', onAppFocus);
}

/**
 * @private
 * Handle the application returning to the foreground. The user may have
 * authenticated from another context while this one was in the background.
 * Credentials delivered while backgrounded (e.g. a native wrapper storing
 * deep link parameters) are used to complete the auth flow, otherwise the
 * authority is reloaded in case a session now exists for this context.
 */
async function onAppFocus(): Promise<void> {
    if (document.visibilityState === 'hidden') return;
    if (_options.mock || !_authority) return;
    if (_authority.session || hasCurrentToken()) return;
    // Force a fresh check, ignoring any cached result from before backgrounding
    delete _promises.check_params;
    const found = await checkForAuthParameters().catch(() => false);
    if (found || _code || refreshToken()) {
        log('Application focused with new credentials. Authorising...');
        _redirecting = false;
        delete _promises.authorise;
        await authorise().catch((e) =>
            log.error('Failed to authorise on focus:', e),
        );
        return;
    }
    log('Application focused without a session. Reloading authority...');
    _redirecting = false;
    refreshAuthority().catch((e) =>
        log.error('Failed to refresh authority:', e),
    );
}

/**
 * Complete authentication with a redirect URL received outside the normal
 * browser navigation flow. Use this from native wrapper applications that
 * perform login in an external browser and receive the OAuth redirect as a
 * deep link, where this context's location never changes.
 * @param url Redirect/deep link URL containing the auth parameters
 * @returns Promise resolving to the new access token
 */
export async function handleAuthRedirect(url: string): Promise<string> {
    const params: HashMap<string> = {};
    const match = url.match(/[?#](.*)/);
    if (match) {
        for (const part of match[1].split(/[?#]/)) {
            Object.assign(params, convertPairStringToMap(part));
        }
    }
    if (!params.code && !params.access_token && !params.refresh_token) {
        throw new Error('No auth parameters found in redirect URL');
    }
    log('Received auth redirect. Storing parameters...');
    sessionStorage.setItem('ENGINE.auth.params', JSON.stringify(params));
    // Wait for any in-flight authority load before authorising
    if (!_authority && _promises.load_authority) {
        await _promises.load_authority;
    }
    _redirecting = false;
    delete _promises.check_params;
    delete _promises.authorise;
    return authorise();
}

export function setStorage(type: 'session' | 'local'): void {
    _storage = type === 'session' ? sessionStorage : localStorage;
}

/**
 * @private
 */
export function cleanupAuth() {
    _options = {} as any;
    _authority = undefined;
    _access_token.set('');
    _refresh_token.set('');
    _token_state.set(false);
    _online.set(false);
    _client_id = '';
    _code = '';
    _route = `/api/engine/v2`;
    _redirecting = false;
    stopListeningForAppFocus();
    // Clear local subscriptions
    for (const key in _promises) {
        /* istanbul ignore else */
        if (key in _promises) {
            delete _promises[key];
        }
    }
    destroyWaitingAsync();
}

/**
 * Refresh authentication
 */
export function refreshAuthority(): Promise<void> {
    log('Refreshing authorty.');
    _authority = undefined;
    return loadAuthority();
}

/**
 * Invalidate the current access token
 */
export function invalidateToken(): void {
    log('Invalidating tokens.');
    _storage.removeItem(`${_client_id}_access_token`);
    _storage.removeItem(`${_client_id}_expires_at`);
    if (_access_token.value) _access_token.set('');
    updateTokenState();
}

/* istanbul ignore else */
/**
 * Check the users authentication credentials and perform actions
 * required for the user to authenticate
 * @param state Additional state information for auth requests
 */
export function authorise(
    state?: string,
    api_authority: PlaceAuthority = _authority as PlaceAuthority,
): Promise<string> {
    /* istanbul ignore else */
    if (!_promises.authorise) {
        _promises.authorise = new Promise<string>((resolve, reject) => {
            if (!api_authority) {
                delete _promises.authorise;
                return reject('Authority is not loaded');
            }
            log('Authorising user...');
            const after_check = () => {
                if (token(false)) {
                    log('Valid token found.');
                    delete _promises.authorise;
                    resolve(token());
                } else {
                    const token_handlers = [
                        () => {
                            log('Successfully generated token.');
                            resolve(token());
                            delete _promises.authorise;
                        },
                        () => {
                            log.error('Failed to generate token.');
                            reject('Failed to generate token');
                            setTimeout(() => delete _promises.authorise, 200);
                        },
                    ];
                    if (_options && _options.auth_type === 'password') {
                        log('Logging in with credentials.');
                        generateTokenWithCredentials(_options).then(
                            ...token_handlers,
                        );
                        _failed_count = 0;
                    } else if (_code || refreshToken()) {
                        log(
                            `Generating token with ${
                                _code ? 'code' : 'refresh token'
                            }`,
                        );
                        generateToken().then(...token_handlers);
                        _failed_count = 0;
                    } else {
                        if (api_authority!.session) {
                            log(
                                'Users has session. Authorising application...',
                            );
                            sendToAuthorize(state).then(...token_handlers);
                        } else {
                            log('No user session');
                            // Settle the promise before redirecting as
                            // `sendToLogin` throws when it redirects
                            reject('No user session');
                            setTimeout(() => delete _promises.authorise, 200);
                            try {
                                sendToLogin(api_authority);
                            } catch {
                                /* redirecting to login */
                            }
                        }
                    }
                }
            };
            checkToken().then(after_check, after_check);
        });
    }
    return _promises.authorise as Promise<string>;
}

/**
 * Logout and clear user credentials for the application
 */
export function logout(): void {
    const url = resolveAuthorityUrl(
        _authority ? _authority.logout_url : '/logout',
    );
    fetch(url, {
        method: 'GET',
        redirect: 'manual',
        headers: {
            Authorization: 'Bearer ' + token(),
        },
    }).then(
        (response) => {
            const location = response.headers.get('Location') || url;
            clearCredentials();
            window.location?.assign(location);
        },
        (err) => {
            log.error('Error logging out:', err);
            clearCredentials();
            window.location?.assign(url);
        },
    );
}

/**
 * @private
 * Remove stored credentials for the application
 */
function clearCredentials(): void {
    const keys: string[] = [];
    for (let i = 0; i < _storage.length; i++) {
        const key = _storage.key(i);
        if (key && key.indexOf(_client_id) >= 0) keys.push(key);
    }
    for (const key of keys) {
        _storage.removeItem(key);
    }
    _access_token.set('');
    _refresh_token.set('');
    updateTokenState();
}

/**
 * @private
 * Load authority details from engine
 */
export function loadAuthority(tries: number = 0): Promise<void> {
    if (!_promises.load_authority) {
        _promises.load_authority = new Promise<void>((resolve) => {
            _online.set(false);
            if (_options.mock) {
                // Setup mock authority
                _authority = MOCK_AUTHORITY;
                log(`System in mock mode`);
                _online.set(true);
                resolve();
                return;
            }
            log(`Fixed: ${isFixedDevice()} | Trusted: ${isTrusted()}`);
            log(`Loading authority...`);
            const secure =
                _options.secure ||
                window.location?.protocol.indexOf('https') >= 0;
            const on_error = (err: any) => {
                log.error(`Failed to load authority(${err})`);
                _online.set(false);
                // Retry if authority fails to load
                timeout(
                    'load_authority',
                    () => {
                        delete _promises.load_authority;
                        loadAuthority(tries).then((_) => resolve());
                    },
                    300 * Math.min(20, ++tries),
                );
            };
            fetch(`${secure ? 'https:' : 'http:'}//${host()}/auth/authority`, {
                credentials: 'same-origin',
            }).then(async (resp) => {
                if (!resp.ok) {
                    return on_error(await resp.text().catch((_) => _));
                }
                _authority = (await resp.json()) as PlaceAuthority;
                _route = !/[2-9]\.[0-9]+\.[0-9]+/g.test(
                    _authority.version || '',
                )
                    ? `/control/api`
                    : `/api/engine/v2`;

                log.group(`Loaded authority.`);
                if (_authority) {
                    log(`Name: ${_authority.name}`);
                    log(`Version: ${_authority.version}`);
                    log(`Domain: ${_authority.domain}`);
                    log(`Session: ${_authority.session}`);
                    log(`Production: ${_authority.production}`);
                    log(
                        `Config Keys: ${
                            Object.keys(_authority.config || {}).length
                        }`,
                    );
                }
                log.groupEnd(``);

                const response = () => {
                    _online.set(true);
                    log('Application set online.');
                    resolve();
                };
                delete _promises.load_authority;
                authorise('').then(response, response);
            }, on_error);
        });
    }
    return _promises.load_authority;
}

/**
 * @private
 * @param state
 */
export async function sendToAuthorize(state?: string): Promise<void> {
    const auth_url = createLoginURL(state);
    if (_options.use_iframe) {
        return authorizeWithIFrame(auth_url);
    }
    window.location?.assign(auth_url);
}

/* istanbul ignore next */
/**
 * @private
 * @param url Authorization URL
 */
export function authorizeWithIFrame(url: string): Promise<void> {
    if (!_promises.iframe_auth) {
        _promises.iframe_auth = new Promise<void>((resolve, reject) => {
            log('Authorizing in an iFrame...');
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.height = '1px';
            iframe.style.width = '1px';
            iframe.style.zIndex = '-1';
            iframe.id = 'place-authorize';
            iframe.src = `${url}`;
            const callback = (event: MessageEvent) => {
                if (
                    event.origin === window.location?.origin &&
                    event.data.type === 'place-os'
                ) {
                    const data: AuthorizeDetails = event.data;
                    log('Received credentials from iFrame...');
                    document.body.removeChild(iframe);
                    clearAsyncTimeout('iframe_auth');
                    window.removeEventListener('message', callback);
                    delete _promises.iframe_auth;
                    if (data.token) {
                        resolve();
                        return _storeTokenDetails({
                            access_token: data.token,
                            ...data,
                        } as any);
                    }
                    _code = data.code || '';
                    generateToken().then(
                        (_) => resolve(_),
                        (_) => reject(_),
                    );
                }
            };
            const cleanup = () => {
                window.removeEventListener('message', callback);
                if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
                delete _promises.iframe_auth;
            };
            timeout(
                'iframe_auth',
                () => {
                    log.error('Unable to resolve iFrame after 15 seconds...');
                    cleanup();
                    reject();
                },
                15 * 1000,
            );
            window.addEventListener('message', callback);
            iframe.onerror = (_) => {
                log.error('iFrame error.', _);
                clearAsyncTimeout('iframe_auth');
                cleanup();
                reject();
            };
            document.body.appendChild(iframe);
        });
    }
    return _promises.iframe_auth;
}

let _redirecting = false;

/**
 * @private
 * @param api_authority
 */
export function sendToLogin(api_authority: PlaceAuthority): void {
    /* istanbul ignore else */
    if (_options.handle_login !== false && !_redirecting) {
        log('Redirecting to login page...');
        // Redirect to login form, resolving relative URLs against the authority domain
        const url = resolveAuthorityUrl(
            api_authority!.login_url?.replace(
                '{{url}}',
                encodeURIComponent(window.location?.href),
            ),
        );
        setTimeout(() => window.location?.assign(url), 300);
        _redirecting = true;
        throw new Error('Redirecting to login page...');
    } else {
        log('Login being handled locally.');
    }
    delete _promises.authorise;
}

/**
 * @private
 * Check authentication token
 */
export function checkToken(): Promise<boolean> {
    /* istanbul ignore else */
    if (!_promises.check_token) {
        _promises.check_token = new Promise(async (resolve, reject) => {
            if (token()) {
                log('Valid token found.');
                resolve(token());
            } else {
                log('No token. Checking URL for auth credentials...');
                const success = await checkForAuthParameters();
                success ? resolve(true) : reject();
            }
            delete _promises.check_token;
        });
    }
    return _promises.check_token as Promise<boolean>;
}

/**
 * @private
 * Check URL for auth parameters
 */
export function checkForAuthParameters(): Promise<boolean> {
    /* istanbul ignore else */
    if (!_promises.check_params) {
        _promises.check_params = new Promise((resolve) => {
            log('Checking for auth parameters...');
            let fragments = getFragments();
            if (
                (!fragments || Object.keys(fragments).length <= 0) &&
                sessionStorage
            ) {
                fragments = JSON.parse(
                    sessionStorage.getItem('ENGINE.auth.params') || '{}',
                );
                // Consume stored parameters so stale credentials aren't retried
                sessionStorage.removeItem('ENGINE.auth.params');
            }
            if (
                fragments &&
                (fragments.code ||
                    fragments.access_token ||
                    fragments.refresh_token)
            ) {
                const saved_nonce =
                    _storage.getItem(`${_client_id}_nonce`) || '';
                const state_parts = (fragments.state || '').split(';');
                removeFragment('state');
                removeFragment('token_type');
                const nonce = state_parts[0];
                /* istanbul ignore else */
                if (saved_nonce === nonce) {
                    // Only accept credentials once the state nonce is validated
                    if (fragments.code) {
                        _code = fragments.code;
                        removeFragment('code');
                    }
                    if (fragments.refresh_token) {
                        _storage.setItem(
                            `${_client_id}_refresh_token`,
                            fragments.refresh_token,
                        );
                        removeFragment('refresh_token');
                    }
                    _storeTokenDetails(fragments as any);
                    resolve(!!fragments.access_token);
                } else {
                    removeFragment('code');
                    removeFragment('access_token');
                    removeFragment('refresh_token');
                    resolve(false);
                }
            } else {
                resolve(false);
            }
            timeout(
                'check_params_promise',
                () => delete _promises.check_params,
                50,
            );
        });
    }
    return _promises.check_params as Promise<boolean>;
}

/**
 * @private
 * Generate login URL for the user to authenticate
 * @param state State information to send to the server
 */
export function createLoginURL(state?: string): string {
    const nonce = createAndSaveNonce();
    state = state ? `${nonce};${state}` : nonce;
    const has_query = _options
        ? (_options.auth_uri || '').indexOf('?') >= 0
        : false;
    const login_url =
        (_options ? _options.auth_uri : null) || '/auth/oauth/authorize';
    const response_type =
        isTrusted() || _options.auth_type === 'auth_code' ? 'code' : 'token';
    let url =
        `${login_url}${has_query ? '&' : '?'}` +
        `response_type=${encodeURIComponent(response_type)}` +
        `&client_id=${encodeURIComponent(_client_id)}` +
        `&state=${encodeURIComponent(state)}` +
        `&redirect_uri=${encodeURIComponent(_options.redirect_uri)}` +
        `&scope=${encodeURIComponent(_options.scope)}`;
    if (_options.auth_type === 'auth_code') {
        const { challenge, verify } = generateChallenge();
        sessionStorage.setItem(`${_client_id}_challenge`, challenge);
        url += `&code_challenge_method=S256`;
        url += `&code_challenge=${verify}`;
    }
    return url;
}

/**
 * @private
 * @param length Length of the challenge string
 */
export function generateChallenge(length: number = 43) {
    const challenge = generateNonce(length);
    const uint8array = base64.base64ToBytes(base64.base64encode(challenge));
    const verify = base64
        .bytesToBase64(sha256.hash(uint8array))
        .split('=')[0]
        .replace(/\//g, '_')
        .replace(/\+/g, '-');
    return { challenge, verify };
}

/**
 * @private
 * Generate token generation URL
 */
export function createRefreshURL(): [string, string] {
    const refresh_uri = _options.token_uri || '/auth/token';
    let url = refresh_uri + `?client_id=${encodeURIComponent(_client_id)}`;
    let body = '';
    url += `&redirect_uri=${encodeURIComponent(_options.redirect_uri)}`;
    if (refreshToken()) {
        url += `&refresh_token=${encodeURIComponent(refreshToken())}`;
        url += `&grant_type=refresh_token`;
        const query_index = url.indexOf('?');
        body = url.slice(query_index + 1);
        url = url.slice(0, query_index);
    } else {
        url += `&code=${encodeURIComponent(_code)}`;
        url += `&grant_type=authorization_code`;
        const challenge = sessionStorage.getItem(`${_client_id}_challenge`);
        if (challenge) {
            url += `&code_verifier=${challenge}`;
            sessionStorage.removeItem(`${_client_id}_challenge`);
        }
        _code = '';
    }
    return [url, body];
}

/**
 * @private
 * Geneate a token URL for basic auth with the given credentials
 * @param options Credentials to add to the token
 */
export function createCredentialsURL(options: PlaceAuthOptions) {
    const refresh_uri = options.token_uri || '/auth/token';
    const url = toQueryString({
        grant_type: 'password',
        client_id: _client_id,
        client_secret: options.client_secret,
        redirect_uri: options.redirect_uri,
        authority: _authority?.id,
        scope: options.scope,
        username: options.username,
        password: options.password,
    });
    return `${refresh_uri}?${url}`;
}

/**
 * @private
 * Revoke the current access token
 */
export function revokeToken(): Promise<void> {
    /* istanbul ignore else */
    if (!_promises.revoke_token) {
        _promises.revoke_token = new Promise<void>((resolve, reject) => {
            log('Revoking token...');
            const token_uri = _options.token_uri || '/auth/token';
            const on_error = (err: any) => {
                log.error('Error revoking token.', err);
                reject(err);
                delete _promises.revoke_token;
            };
            fetch(`${token_uri}?token=${token()}`, {
                method: 'POST',
            }).then((r: Response) => {
                if (!r.ok) return on_error(r);
                log('Successfully revoked token.');
                _access_token.set('');
                _refresh_token.set('');
                _token_state.set(false);
                _storage.removeItem(`${_client_id}_access_token`);
                _storage.removeItem(`${_client_id}_refresh_token`);
                resolve();
                delete _promises.revoke_token;
            }, on_error);
        });
    }
    return _promises.revoke_token;
}

/**
 * @private
 * Generate new tokens from a auth code or refresh token
 */
export function generateToken() {
    return generateTokenWithUrl(...createRefreshURL());
}

/**
 * @private
 * Generate new tokens from a username and password
 */
export function generateTokenWithCredentials(options: PlaceAuthOptions) {
    return generateTokenWithUrl(createCredentialsURL(options));
}

/**
 * @private
 * Make a request to the tokens endpoint with the given URL
 */
export function generateTokenWithUrl(
    url: string,
    body: string = '',
): Promise<void> {
    /* istanbul ignore else */
    if (!_promises.generate_tokens) {
        _promises.generate_tokens = new Promise<void>((resolve, reject) => {
            log('Generating new token...');
            const on_error = (err: any) => {
                log.error('Error generating new tokens:', err);
                // Only discard the refresh token when the server explicitly
                // rejects it, not on network or server errors
                if (err && err.status >= 400 && err.status < 500) {
                    _storage.removeItem(`${_client_id}_refresh_token`);
                    _refresh_token.set('');
                }
                updateTokenState();
                reject();
                delete _promises.generate_tokens;
            };
            fetch(url, {
                method: 'POST',
                body,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }).then(async (r: Response) => {
                if (!r.ok) return on_error(r);
                const tokens = await r.json();
                _storeTokenDetails(tokens);
                resolve();
                delete _promises.generate_tokens;
            }, on_error);
        });
    }
    return _promises.generate_tokens as Promise<void>;
}

/* istanbul ignore next */
/**
 * @private
 * @param details
 */
export function _storeTokenDetails(details: PlaceTokenResponse) {
    const expires_at = addSeconds(
        new Date(),
        Math.max(60, parseInt(details.expires_in, 10) - 300),
    );
    log('Tokens generated storing...');
    if (isTrusted()) {
        // Store access token
        if (details.access_token) {
            _storage.setItem(
                `${_client_id}_access_token`,
                details.access_token,
            );
            removeFragment('access_token');
        }
        // Store refresh token
        if (details.refresh_token) {
            _storage.setItem(
                `${_client_id}_refresh_token`,
                details.refresh_token,
            );
            removeFragment('refresh_token');
        }
    }
    // Store token expiry time
    if (details.expires_in) {
        _storage.setItem(`${_client_id}_expires_at`, `${expires_at.valueOf()}`);
        removeFragment('expires_in');
    }
    _online.set(true);
    _access_token.set(details.access_token || '');
    _refresh_token.set(details.refresh_token || '');
    updateTokenState();
}

/**
 * @private
 * Create nonce and save it to the set key store
 */
export function createAndSaveNonce(): string {
    const nonce = generateNonce();
    _storage.setItem(`${_client_id}_nonce`, nonce);
    return nonce;
}
