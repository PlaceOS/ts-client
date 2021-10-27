import * as base64 from 'byte-base64';
import { addHours, addSeconds, addYears, isBefore } from 'date-fns';
import * as sha256 from 'fast-sha256';
import { BehaviorSubject, Observable } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { map } from 'rxjs/operators';
import { Md5 } from 'ts-md5/dist/md5';
import { AbortControllerStub } from '../utilities/abort-controller';
import { toQueryString } from '../utilities/api';
import {
    clearAsyncTimeout,
    destroyWaitingAsync,
    timeout,
} from '../utilities/async';
import {
    generateNonce,
    getFragments,
    log,
    removeFragment,
} from '../utilities/general';
import { HashMap } from '../utilities/types';
import {
    AuthorizeDetails,
    MOCK_AUTHORITY,
    PlaceAuthOptions,
    PlaceAuthority,
    PlaceTokenResponse,
} from './interfaces';

/**
 * @private
 */
let _options: PlaceAuthOptions = {} as any;
/**
 * @private
 * Browser key store to use for authentication credentials. Defaults to `localStorage`
 */
let _storage: Storage;
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
const _access_token = new BehaviorSubject('');
/**
 * @private
 * In memory store for refresh token
 */
const _refresh_token = new BehaviorSubject('');
/**
 * @private
 * Current API route
 */
let _route: string = `/api/engine/v2`;
/**
 * @private
 * Whether PlaceOS is online
 */
const _online = new BehaviorSubject(false);
/**
 * @private
 * Observer for the online state of PlaceOS
 */
const _online_observer = _online.asObservable();

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
    return _route;
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
export function setAPI_Key(api_key: string) {
    _storage.setItem('x-api-key', `${api_key}`);
    _storage.setItem('trusted', `true`);
    setToken('x-api-key', addYears(new Date(), 5).valueOf());
}

/** Get X API Key for application */
export function apiKey() {
    return checkStoreForAuthParam('x-api-key') || '';
}

/** Manually set an access token */
export function setToken(
    new_token: string,
    expires_at: number = addHours(new Date(), 2).valueOf()
) {
    _storage.setItem(`${_client_id}_expires_at`, `${expires_at}`);
    _storage.setItem(`${_client_id}_access_token`, new_token);
}

/** Bearer token for authenticating requests to PlaceOS */
export function token(return_expired: boolean = true): string {
    if (_options.mock) return 'mock-token';
    if (!_storage) return '';
    if (apiKey()) return 'x-api-key';
    const expires_at = _storage.getItem(`${_client_id}_expires_at`) || '';
    const access_token = _access_token.getValue();
    if (isBefore(+expires_at, new Date())) {
        log('Auth', 'Token expired. Requesting new token...');
        invalidateToken();
        if (!_promises.load_authority) {
            setTimeout(() => authorise(), 200);
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
        _refresh_token.getValue() ||
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

/** Observable for token state */
export function listenForToken(): Observable<boolean> {
    return _access_token.pipe(map((_) => !!hasToken()));
}

/** Place Authority details */
export function authority(): PlaceAuthority | undefined {
    return _authority;
}

/** Whether PlaceOS is online */
export function isOnline(): boolean {
    return _online.getValue();
}

/** Whether requests should use mock handlers */
export function isMock(): boolean {
    return !!_options.mock;
}

/** Whether PlaceOS connection is secure */
export function isSecure(): boolean {
    return !!_options.secure;
}

/** Observable for the online state of PlaceOS */
export function onlineState(): Observable<boolean> {
    return _online_observer;
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
    return checkStoreForAuthParam('fixed_device') === 'true';
}

/**
 * @hidden
 * Check for an auth related param in the URL or storage
 * @param name Name of the paramater to look for
 */
export function checkStoreForAuthParam(name: string): string {
    const fragments = getFragments();
    let param = fragments[name];
    /* istanbul ignore else */
    if (_storage) {
        const key = `${clientId()}_${name}`;
        param = param || _storage.getItem(key) || _storage.getItem(name) || '';
        _storage.setItem(key, `${param}`);
    }
    return param;
}

/** Initialise authentication for the http and realtime APIs */
export function setup(options: PlaceAuthOptions): Promise<void> {
    _options = options || _options;
    if (!window.AbortController) {
        (window as any).AbortController = AbortControllerStub;
    }
    // Intialise storage
    _storage = _options.storage === 'session' ? sessionStorage : localStorage;
    _client_id = Md5.hashStr(_options.redirect_uri, false);
    return loadAuthority();
}

/**
 * @private
 */
export function cleanupAuth() {
    _options = {} as any;
    _authority = undefined;
    _access_token.next('');
    _refresh_token.next('');
    _online.next(false);
    _client_id = '';
    _code = '';
    _route = `/api/engine/v2`;
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
    log('Auth', 'Refreshing authorty.');
    _authority = undefined;
    return loadAuthority();
}

/**
 * Invalidate the current access token
 */
export function invalidateToken(): void {
    log('Auth', 'Invalidating tokens.');
    _storage.removeItem(`${_client_id}_access_token`);
    _storage.removeItem(`${_client_id}_expires_at`);
    if (_access_token.getValue()) _access_token.next('');
}

/* istanbul ignore else */
/**
 * Check the users authentication credentials and perform actions
 * required for the user to authenticate
 * @param state Additional state information for auth requests
 */
export function authorise(
    state?: string,
    api_authority: PlaceAuthority = _authority as PlaceAuthority
): Promise<string> {
    /* istanbul ignore else */
    if (!_promises.authorise) {
        _promises.authorise = new Promise<string>((resolve, reject) => {
            if (!api_authority) {
                delete _promises.authorise;
                return reject('Authority is not loaded');
            }
            log('Auth', 'Authorising user...');
            const after_check = () => {
                if (token(false)) {
                    log('Auth', 'Valid token found.');
                    delete _promises.authorise;
                    resolve(token());
                } else {
                    const token_handlers = [
                        () => {
                            log('Auth', 'Successfully generated token.');
                            resolve(token());
                            delete _promises.authorise;
                        },
                        () => {
                            log('Auth', 'Failed to generate token.');
                            reject('Failed to generate token');
                            setTimeout(() => delete _promises.authorise, 200);
                        },
                    ];
                    if (_options && _options.auth_type === 'password') {
                        log('Auth', 'Logging in with credentials.');
                        generateTokenWithCredentials(_options).then(
                            ...token_handlers
                        );
                    } else if (_code || refreshToken()) {
                        log(
                            'Auth',
                            `Generating token with ${
                                _code ? 'code' : 'refresh token'
                            }`
                        );
                        generateToken().then(...token_handlers);
                    } else {
                        if (api_authority!.session) {
                            log(
                                'Auth',
                                'Users has session. Authorising application...'
                            );
                            sendToAuthorize(state).then(...token_handlers);
                        } else {
                            log('Auth', 'No user session');
                            sendToLogin(api_authority);
                            reject('No user session');
                            setTimeout(() => delete _promises.authorise, 200);
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
    const done = () => {
        // Remove user credentials
        for (let i = 0; i < _storage.length; i++) {
            const key = _storage.key(i);
            if (key && key.indexOf(_client_id) >= 0) {
                _storage.removeItem(key);
            }
        }
        // Redirect user to logout URL
        const url = _authority ? _authority.logout_url : '/logout';
        setTimeout(() => window.location?.assign(url), 300);
        _online.next(false);
    };
    revokeToken().then(done, done);
}

/**
 * @private
 * Load authority details from engine
 */
export function loadAuthority(tries: number = 0): Promise<void> {
    if (!_promises.load_authority) {
        _promises.load_authority = new Promise<void>((resolve) => {
            _online.next(false);
            if (_options.mock) {
                // Setup mock authority
                _authority = MOCK_AUTHORITY;
                log('Auth', `System in mock mode`);
                _online.next(true);
                resolve();
                return;
            }
            log('Auth', `Fixed: ${isFixedDevice()} | Trusted: ${isTrusted()}`);
            log('Auth', `Loading authority...`);
            const secure =
                _options.secure ||
                window.location?.protocol.indexOf('https') >= 0;
            const on_error = (err: any) => {
                log('Auth', `Failed to load authority(${err})`);
                _online.next(false);
                // Retry if authority fails to load
                timeout(
                    'load_authority',
                    () => {
                        delete _promises.load_authority;
                        loadAuthority(tries).then((_) => resolve());
                    },
                    300 * Math.min(20, ++tries)
                );
            };
            fromFetch(
                `${secure ? 'https:' : 'http:'}//${host()}/auth/authority`,
                {
                    credentials: 'same-origin',
                }
            ).subscribe(async (resp) => {
                if (!resp.ok)
                    return on_error(await resp.text().catch((_) => _));
                _authority = (await resp.json()) as PlaceAuthority;
                _route = !/[2-9]\.[0-9]+\.[0-9]+/g.test(
                    _authority.version || ''
                )
                    ? `/control/api`
                    : `/api/engine/v2`;

                log('Auth', `Loaded authority.`, _authority);
                const response = () => {
                    _online.next(true);
                    log('Auth', 'Application set online.');
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
            log('Auth', 'Authorizing in an iFrame...');
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
                    log('Auth', 'Received credentials from iFrame...');
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
                        (_) => reject(_)
                    );
                }
            };
            timeout(
                'iframe_auth',
                () => {
                    log('Auth', 'Unable to resolve iFrame after 15 seconds...');
                    reject();
                },
                15 * 1000
            );
            window.addEventListener('message', callback);
            iframe.onerror = (_) => {
                log('Auth', 'iFrame error.', _);
                delete _promises.iframe_auth;
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
        log('Auth', 'Redirecting to login page...');
        // Redirect to login form
        const url = api_authority!.login_url?.replace(
            '{{url}}',
            encodeURIComponent(window.location?.href)
        );
        setTimeout(() => window.location?.assign(url), 300);
        _redirecting = true;
        throw new Error('Redirecting to login page...');
    } else {
        log('Auth', 'Login being handled locally.');
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
                log('Auth', 'Valid token found.');
                resolve(token());
            } else {
                log('Auth', 'No token. Checking URL for auth credentials...');
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
            log('Auth', 'Checking for auth parameters...');
            let fragments = getFragments();
            if (
                (!fragments || Object.keys(fragments).length <= 0) &&
                sessionStorage
            ) {
                fragments = JSON.parse(
                    sessionStorage.getItem('ENGINE.auth.params') || '{}'
                );
            }
            if (
                fragments &&
                (fragments.code ||
                    fragments.access_token ||
                    fragments.refresh_token)
            ) {
                // Store authorisation code
                if (fragments.code) {
                    _code = fragments.code;
                    removeFragment('code');
                }
                // Store refresh token
                if (fragments.refresh_token) {
                    _storage.setItem(
                        `${_client_id}_refresh_token`,
                        fragments.refresh_token
                    );
                    removeFragment('refresh_token');
                }
                const saved_nonce =
                    _storage.getItem(`${_client_id}_nonce`) || '';
                const state_parts = (fragments.state || '').split(';');
                removeFragment('state');
                removeFragment('token_type');
                const nonce = state_parts[0];
                /* istanbul ignore else */
                if (saved_nonce === nonce) {
                    _storeTokenDetails(fragments as any);
                    resolve(!!fragments.access_token);
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
            timeout(
                'check_params_promise',
                () => delete _promises.check_params,
                50
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
 */
const AVAILABLE_CHARS =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
/**
 * @private
 * @param length Length of the challenge string
 */
export function generateChallenge(length: number = 43) {
    const challenge = new Array(length)
        .fill(0)
        .map(
            () =>
                AVAILABLE_CHARS[
                    Math.floor(Math.random() * AVAILABLE_CHARS.length)
                ]
        )
        .join('');
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
export function createRefreshURL(): string {
    const refresh_uri = _options.token_uri || '/auth/token';
    let url = refresh_uri + `?client_id=${encodeURIComponent(_client_id)}`;
    url += `&redirect_uri=${encodeURIComponent(_options.redirect_uri)}`;
    if (refreshToken()) {
        url += `&refresh_token=${encodeURIComponent(refreshToken())}`;
        url += `&grant_type=refresh_token`;
    } else {
        url += `&code=${encodeURIComponent(_code)}`;
        url += `&grant_type=authorization_code`;
    }
    const challenge = sessionStorage.getItem(`${_client_id}_challenge`);
    if (challenge) {
        url += `&code_verifier=${challenge}`;
        sessionStorage.removeItem(`${_client_id}_challenge`);
    }
    _code = '';
    return url;
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
            log('Auth', 'Revoking token...');
            const token_uri = _options.token_uri || '/auth/token';
            const on_error = (err: any) => {
                log('Auth', 'Error revoking token.', err);
                reject(err);
                delete _promises.revoke_token;
            };
            fromFetch(`${token_uri}?token=${token()}`, {
                method: 'POST',
            }).subscribe((r: Response) => {
                if (!r.ok) return on_error(r);
                log('Auth', 'Successfully revoked token.');
                _access_token.next('');
                _refresh_token.next('');
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
    return generateTokenWithUrl(createRefreshURL());
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
export function generateTokenWithUrl(url: string): Promise<void> {
    /* istanbul ignore else */
    if (!_promises.generate_tokens) {
        _promises.generate_tokens = new Promise<void>((resolve, reject) => {
            log('Auth', 'Generating new token...');
            const on_error = (err: any) => {
                log('Auth', 'Error generating new tokens.', err);
                _storage.removeItem(`${_client_id}_refresh_token`);
                _refresh_token.next('');
                reject();
                delete _promises.generate_tokens;
            };
            fromFetch(url, { method: 'POST' }).subscribe(
                async (r: Response) => {
                    if (!r.ok) return on_error(r);
                    const tokens = await r.json();
                    _storeTokenDetails(tokens);
                    resolve();
                    delete _promises.generate_tokens;
                },
                on_error
            );
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
        Math.max(60, parseInt(details.expires_in, 10) - 300)
    );
    log('Auth', 'Tokens generated storing...');
    if (isTrusted()) {
        // Store access token
        if (details.access_token) {
            _storage.setItem(
                `${_client_id}_access_token`,
                details.access_token
            );
            removeFragment('access_token');
        }
        // Store refresh token
        if (details.refresh_token) {
            _storage.setItem(
                `${_client_id}_refresh_token`,
                details.refresh_token
            );
            removeFragment('refresh_token');
        }
    }
    // Store token expiry time
    if (details.expires_in) {
        _storage.setItem(`${_client_id}_expires_at`, `${expires_at.valueOf()}`);
        removeFragment('expires_in');
    }
    _online.next(true);
    _access_token.next(details.access_token || '');
    _refresh_token.next(details.refresh_token || '');
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
