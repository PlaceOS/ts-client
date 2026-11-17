/**
 * The OAuth login of PlaceOS, as a session object that gives the client its credential.
 *
 * ```ts
 * const session = createAuthSession({
 *     baseUrl: '',
 *     redirectUri: `${location.origin}/oauth-resp.html`,
 *     scope: 'public',
 *     grant: { kind: 'code' },
 * });
 * configure({ baseUrl: '', auth: session.clientAuth, headers: { 'X-App-Id': session.clientId } });
 * const result = await session.start();
 * ```
 *
 * `authorize` gets a credential in this order, and stops at the first that works:
 *
 * 1. An API key from the URL or the storage (a fixed device), or an access token that is valid.
 * 2. A code or a token in the redirect parameters, if the state is the nonce of this client.
 * 3. The refresh token.
 * 4. The password grant or the Entra token exchange, if the grant is one of these.
 * 5. If the user has a session on the server: the authorize page, with a redirect or in a frame.
 * 6. Else the login page of the authority.
 *
 * The session is compatible with the storage keys of v1, so a user stays logged in after an
 * application changes to v2.
 */
import { assert, unreachable } from '../core/assert.ts';
import {
    decodeJson,
    fetchBody,
    type Auth,
    type Credential,
    type FetchError,
} from '../core/client.ts';
import type { Result } from '../core/result.ts';
import {
    array,
    boolean,
    integer,
    isRecord,
    json,
    literal,
    nullable,
    object,
    parseResponse,
    record,
    string,
    union,
    type Input,
    type Output,
    type Schema,
} from '../core/schema.ts';
import { browserEnvironment, FRAME_MESSAGE_TYPE, type AuthEnvironment } from './environment.ts';
import { base64Url, md5Hex, sha256 } from './hash.ts';

export const AUTHORIZE_PATH_DEFAULT = '/auth/oauth/authorize';
/** The Doorkeeper path. PlaceOS auth.cr also serves it, but the Ruby auth has no `/auth/token`. */
export const TOKEN_PATH_DEFAULT = '/auth/oauth/token';
export const AUTHORITY_PATH = '/auth/authority';
export const LOGOUT_PATH_DEFAULT = '/logout';
/** The authority is the first request. Retry a few times, for a server that starts slowly. */
export const AUTHORITY_ATTEMPTS_MAX = 5;
/** The wait before attempt `n` is `n * AUTHORITY_RETRY_MS`. */
export const AUTHORITY_RETRY_MS = 300;
export const AUTH_TIMEOUT_MS = 15_000;
export const AUTH_RESPONSE_BYTES_MAX = 1024 * 1024;
export const FRAME_TIMEOUT_MS = 15_000;
/** Renew a token this many seconds before the server says that it expires. */
export const TOKEN_EXPIRY_MARGIN_SECONDS = 300;
export const TOKEN_LIFETIME_MIN_SECONDS = 60;
/** The lifetime of a token without `expires_in`, such as one from `useToken`. */
export const TOKEN_LIFETIME_DEFAULT_SECONDS = 2 * 60 * 60;
export const NONCE_LENGTH = 40;
/** RFC 7636 needs a PKCE verifier of 43 to 128 characters. */
export const VERIFIER_LENGTH = 64;
export const LISTENERS_MAX = 64;
/** A longer URL is not a redirect of this login. The parser ignores its parameters. */
export const URL_LENGTH_MAX = 16 * 1024;

/** The key in `sessionStorage` for the parameters of a deep link. v1 uses the same key. */
const DEEP_LINK_KEY = 'ENGINE.auth.params';
/** The parameters of a login redirect. The session reads them, then removes them from the URL. */
const LOGIN_PARAMS: ReadonlySet<string> = new Set([
    'access_token',
    'code',
    'error',
    'error_description',
    'expires_in',
    'refresh_token',
    'scope',
    'state',
    'token_type',
    'x-api-key',
]);
/** Settings of a device that can come in the URL. The session keeps them in the storage. */
const DEVICE_PARAMS = ['x-api-key', 'trust', 'trusted', 'fixed_device'] as const;
const NONCE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
/** The random fill gives enough accepted bytes in one round, nearly always. */
const RANDOM_ROUNDS_MAX = 16;

/** How the application gets its first token. */
export type Grant =
    /** Authorization code with PKCE. */
    | { readonly kind: 'code' }
    /**
     * The token in the redirect (`response_type=token`), as in v1. A trusted application uses the
     * code instead, because it keeps a refresh token.
     */
    | { readonly kind: 'implicit' }
    /**
     * The resource owner password grant of v1. PlaceOS auth.cr refuses it with
     * `unsupported_grant_type`. Only older auth services accept it.
     */
    | {
          readonly kind: 'password';
          readonly username: string;
          readonly password: string;
          readonly clientSecret?: string;
      }
    /**
     * Exchanges a Microsoft Entra access token for PlaceOS tokens (RFC 8693), for applications
     * that are already logged in to Microsoft, such as Outlook add-ins.
     */
    | {
          readonly kind: 'entra';
          readonly entraToken: () => Promise<string | null>;
          readonly clientSecret?: string;
      };

export interface AuthSessionConfig {
    /** The origin of the server, such as `https://placeos.example.com`. `''` is this origin. */
    readonly baseUrl: string;
    /** The redirect page, such as `https://app.example.com/oauth-resp.html`. */
    readonly redirectUri: string;
    readonly scope: string;
    readonly grant: Grant;
    /** A path on the server, or a full URL. */
    readonly authorizePath?: string;
    /** A path on the server, or a full URL. */
    readonly tokenPath?: string;
    /** Opens the authorize page in a hidden frame, not with a redirect. */
    readonly useFrame?: boolean;
    /**
     * `true` (the default) sends a user without a session to the login page. With `false`, the
     * result is a `login_required` error, and the application shows its own login.
     */
    readonly handleLogin?: boolean;
    /** Ignores an API key in the URL or the storage. */
    readonly ignoreApiKey?: boolean;
    /** Headers for each request of the session. The session adds `X-App-Id`. */
    readonly headers?: Readonly<Record<string, string>>;
    readonly environment?: AuthEnvironment;
}

const DomainAuthoritySchema = object(
    {
        id: nullable(string()),
        name: string(),
        description: nullable(string()),
        /** The domain of the authority, without a port. */
        domain: string(),
        /** The login page. `{{url}}` is the URL to come back to. */
        login_url: string(),
        logout_url: string(),
        /** `true` when the user has a session on the server. */
        session: boolean(),
        production: nullable(boolean()),
        config: nullable(record(json())),
        version: nullable(string()),
        metrics: nullable(string()),
        sentry_dsn: nullable(string()),
        email_domains: nullable(array(string())),
    },
    ['id', 'name', 'domain', 'login_url', 'logout_url', 'session'],
);
/**
 * The PlaceOS authority of this domain, from `/auth/authority`: the login pages and the session
 * state. It is not the `Authority` model of the REST API.
 */
export interface DomainAuthority extends Output<typeof DomainAuthoritySchema> {}
export interface DomainAuthorityInput extends Input<typeof DomainAuthoritySchema> {}
export const DomainAuthority: Schema<DomainAuthority, DomainAuthorityInput> = DomainAuthoritySchema;

const TokenResponse = object(
    {
        access_token: string(),
        refresh_token: nullable(string()),
        expires_in: nullable(union([integer(), string()])),
    },
    ['access_token'],
);

/** The message of `oauth-resp.html` in a frame. */
const FrameMessage = object({ type: literal([FRAME_MESSAGE_TYPE]), params: record(string()) }, [
    'type',
    'params',
]);

/** The state of the session, for the user interface. */
export type AuthStatus =
    | { readonly kind: 'stopped' }
    | { readonly kind: 'loading' }
    | { readonly kind: 'signed_in'; readonly credential: 'bearer' | 'api_key' }
    /** The page goes to `url` now. Wait for the navigation. */
    | { readonly kind: 'redirecting'; readonly url: string }
    | { readonly kind: 'signed_out'; readonly error: AuthError | null };

/** Why the session has no credential. */
export type AuthError =
    /** `/auth/authority` failed `AUTHORITY_ATTEMPTS_MAX` times. */
    | { readonly kind: 'authority_unavailable'; readonly reason: string }
    | { readonly kind: 'authority_invalid'; readonly path: string; readonly expected: string }
    /** The page goes to the login or the authorize page. The application waits. */
    | { readonly kind: 'redirecting'; readonly url: string }
    /** No session, and `handleLogin` is `false`. Show the login of the application. */
    | { readonly kind: 'login_required' }
    /** The token endpoint refused the grant, for example a wrong password. */
    | { readonly kind: 'token_rejected'; readonly status: number; readonly message: string | null }
    | { readonly kind: 'token_unavailable'; readonly error: FetchError }
    | { readonly kind: 'token_invalid'; readonly path: string; readonly expected: string }
    | { readonly kind: 'entra_token_missing' }
    | {
          readonly kind: 'frame_failed';
          readonly reason: 'timeout' | 'frame_error' | 'message_invalid' | 'state_mismatch';
      }
    /** `handleRedirect` got a URL without a code or a token. */
    | { readonly kind: 'redirect_invalid' }
    /** The user or the server refused the login, for example on the consent page. */
    /** A logout ran while this attempt waited. The session drops the tokens of the attempt. */
    | { readonly kind: 'logged_out' }
    | {
          readonly kind: 'authorization_denied';
          readonly error: string;
          readonly description: string | null;
      };

export interface AuthSession {
    /** The OAuth client ID: the MD5 of the redirect URI, as PlaceOS registers it. */
    readonly clientId: string;
    /** Give this to `configure` or `createClient`. */
    readonly clientAuth: Auth;
    /** Loads the authority, gets a credential, and watches for the foreground. */
    start(): Promise<Result<Credential, AuthError>>;
    /** Stops the watch for the foreground. */
    stop(): void;
    /** Gets a credential. Many calls at the same time share one attempt. */
    authorize(): Promise<Result<Credential, AuthError>>;
    /** The credential now, if it is valid. This does not make requests. */
    credential(): Credential | null;
    status(): AuthStatus;
    /** Calls `listener` on each change of the status. Returns the remover. */
    subscribe(listener: (status: AuthStatus) => void): () => void;
    authority(): DomainAuthority | null;
    reloadAuthority(): Promise<Result<DomainAuthority, AuthError>>;
    /**
     * Completes a login with a redirect URL that the page did not load, such as a deep link in a
     * native wrapper that logs in with an external browser.
     */
    handleRedirect(url: string): Promise<Result<Credential, AuthError>>;
    /** Uses a token from a different source. */
    useToken(token: string, expiresAtMs?: number): void;
    /** Uses an API key, for a fixed device. */
    useApiKey(key: string, options?: { readonly trusted?: boolean }): void;
    /** Removes the access token, so the next request gets a new one. */
    invalidateToken(): void;
    /** Ends the session on the server, removes the credentials and goes to the logout page. */
    logout(): Promise<void>;
    /** A trusted application keeps its tokens in the storage. Else they are in memory only. */
    isTrusted(): boolean;
    /** A device in a fixed location, such as a room panel. */
    isFixedDevice(): boolean;
}

interface Tokens {
    readonly accessToken: string | null;
    readonly refreshToken: string | null;
    readonly expiresAtMs: number;
}

const NO_TOKENS: Tokens = { accessToken: null, refreshToken: null, expiresAtMs: 0 };

/** Makes a login session. It does no work until `start`, `authorize` or a request. */
export function createAuthSession(config: AuthSessionConfig): AuthSession {
    assert(!config.baseUrl.endsWith('/'), 'the baseUrl has no trailing slash');
    assert(config.redirectUri.length > 0, 'the redirectUri is not empty');
    const environment = config.environment ?? browserEnvironment();
    const storage = environment.storage;
    const clientId = md5Hex(config.redirectUri);
    const handleLogin = config.handleLogin ?? true;
    const headers: Readonly<Record<string, string>> = { ...config.headers, 'X-App-Id': clientId };
    const limits = { timeoutMs: AUTH_TIMEOUT_MS, bytesMax: AUTH_RESPONSE_BYTES_MAX };
    const storageKey = (name: string) => `${clientId}_${name}`;

    let authority: DomainAuthority | null = null;
    let status: AuthStatus = { kind: 'stopped' };
    /** The tokens of an application that is not trusted. A trusted one keeps them in storage. */
    let memoryTokens: Tokens = NO_TOKENS;
    /** A code from a redirect. The next `authorize` exchanges it. */
    let pendingCode: string | null = null;
    let authorizing: Promise<Result<Credential, AuthError>> | null = null;
    let loadingAuthority: Promise<Result<DomainAuthority, AuthError>> | null = null;
    let renewing: Promise<boolean> | null = null;
    let foregroundCheck: Promise<void> | null = null;
    let removeForegroundListener: (() => void) | null = null;
    /**
     * A login that the user or the server refused: a consent denial or a refused code. Then
     * `authorize` does not send the user to the server again, so a request cannot start a loop.
     * `start`, `handleRedirect`, `useToken` and `useApiKey` clear it.
     */
    let halted: AuthError | null = null;
    /** `logout` adds one. A token request from an earlier epoch drops its tokens. */
    let epoch = 0;
    const listeners = new Set<(status: AuthStatus) => void>();

    const session: AuthSession = {
        clientId,
        clientAuth: {
            kind: 'credential',
            credential: credentialForRequest,
            rejected,
        },
        start,
        stop,
        authorize,
        credential: currentCredential,
        status: () => status,
        subscribe,
        authority: () => authority,
        reloadAuthority: loadAuthority,
        handleRedirect,
        useToken,
        useApiKey,
        invalidateToken,
        logout,
        isTrusted,
        isFixedDevice,
    };
    return session;

    async function start(): Promise<Result<Credential, AuthError>> {
        if (removeForegroundListener === null) {
            removeForegroundListener = environment.onForeground(onForeground);
        }
        if (status.kind === 'stopped') setStatus({ kind: 'loading' });
        // `start` is the explicit retry of a login that was refused.
        halted = null;
        return authorize();
    }

    function stop(): void {
        removeForegroundListener?.();
        removeForegroundListener = null;
        setStatus({ kind: 'stopped' });
    }

    function authorize(): Promise<Result<Credential, AuthError>> {
        // Check and set in one synchronous step, so that callers share one attempt.
        if (authorizing !== null) return authorizing;
        const attempt = runAuthorize().finally(() => {
            authorizing = null;
        });
        authorizing = attempt;
        return attempt;
    }

    async function runAuthorize(): Promise<Result<Credential, AuthError>> {
        // A logout during this attempt ends it. Each step checks the epoch after it waits.
        const attemptEpoch = epoch;
        // Read the redirect first, before any wait, so its tokens leave the URL also when the
        // authority does not load.
        const redirectOutcome = readRedirectParams();
        if (redirectOutcome.kind === 'denied') {
            halted = redirectOutcome.error;
            return failed(redirectOutcome.error);
        }
        if (authority === null) {
            const loaded = await loadAuthority();
            if (epoch !== attemptEpoch) return failed({ kind: 'logged_out' });
            if (!loaded.ok) return failed(loaded.error);
        }

        const known = await tokenFromKnownCredentials(attemptEpoch);
        // Check the epoch first: a logout during the wait makes even a known credential old.
        if (epoch !== attemptEpoch) return failed({ kind: 'logged_out' });
        if (known !== null) return known;

        const grant = config.grant;
        switch (grant.kind) {
            case 'password': {
                const result = await requestTokens(attemptEpoch, {
                    grant_type: 'password',
                    client_id: clientId,
                    redirect_uri: config.redirectUri,
                    scope: config.scope,
                    username: grant.username,
                    password: grant.password,
                    authority: authority?.id ?? '',
                    ...(grant.clientSecret === undefined
                        ? {}
                        : { client_secret: grant.clientSecret }),
                });
                return result.ok ? signedIn(result.value) : failed(result.error);
            }
            case 'entra': {
                const subjectToken = await grant.entraToken();
                if (epoch !== attemptEpoch) return failed({ kind: 'logged_out' });
                if (subjectToken === null) return failed({ kind: 'entra_token_missing' });
                const result = await requestTokens(attemptEpoch, {
                    grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
                    client_id: clientId,
                    subject_token: subjectToken,
                    subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
                    scope: config.scope,
                    ...(grant.clientSecret === undefined
                        ? {}
                        : { client_secret: grant.clientSecret }),
                });
                return result.ok ? signedIn(result.value) : failed(result.error);
            }
            case 'code':
            case 'implicit':
                break;
            default:
                return unreachable(grant);
        }

        // A deep link can come while this attempt waits. Use it before the user goes anywhere.
        const late = applyLoginParams(readDeepLink());
        if (late.kind === 'denied') {
            halted = late.error;
            return failed(late.error);
        }
        if (late.kind === 'applied') {
            const fromLink = await tokenFromKnownCredentials(attemptEpoch);
            if (epoch !== attemptEpoch) return failed({ kind: 'logged_out' });
            if (fromLink !== null) return fromLink;
        }

        // The user must act. Go to the server one time only, until a redirect comes back.
        if (halted !== null) return failed(halted);
        if (status.kind === 'redirecting') return { ok: false, error: status };
        const current = authority;
        assert(current !== null, 'the authority is loaded');
        if (current.session) {
            const url = createAuthorizeUrl();
            if (config.useFrame !== true) return redirect(url);
            const framed = await environment.authorizeInFrame(url, FRAME_TIMEOUT_MS);
            if (epoch !== attemptEpoch) return failed({ kind: 'logged_out' });
            if (!framed.ok) return failed({ kind: 'frame_failed', reason: framed.error });
            const message = parseResponse(FrameMessage, framed.value);
            if (!message.ok) return failed({ kind: 'frame_failed', reason: 'message_invalid' });
            const applied = applyLoginParams(new Map(Object.entries(message.value.params)));
            switch (applied.kind) {
                case 'none':
                    return failed({ kind: 'frame_failed', reason: 'message_invalid' });
                case 'state_mismatch':
                    return failed({ kind: 'frame_failed', reason: 'state_mismatch' });
                case 'denied':
                    halted = applied.error;
                    return failed(applied.error);
                case 'applied':
                    break;
                default:
                    return unreachable(applied);
            }
            const fromFrame = await tokenFromKnownCredentials(attemptEpoch);
            if (epoch !== attemptEpoch) return failed({ kind: 'logged_out' });
            if (fromFrame !== null) return fromFrame;
            return failed({ kind: 'frame_failed', reason: 'message_invalid' });
        }
        if (!handleLogin) return failed({ kind: 'login_required' });
        return redirect(loginUrl(current));
    }

    /**
     * Tries the credentials that need no action of the user: the current credential, a code from
     * a redirect, and the refresh token. Returns `null` if none gives a credential.
     */
    async function tokenFromKnownCredentials(
        attemptEpoch: number,
    ): Promise<Result<Credential, AuthError> | null> {
        const current = currentCredential();
        if (current !== null) return signedIn(current);

        if (pendingCode !== null) {
            const code = pendingCode;
            pendingCode = null;
            const verifier = environment.sessionStorage.get(storageKey('code_verifier'));
            environment.sessionStorage.remove(storageKey('code_verifier'));
            const result = await requestTokens(attemptEpoch, {
                grant_type: 'authorization_code',
                client_id: clientId,
                redirect_uri: config.redirectUri,
                code,
                ...(verifier === null ? {} : { code_verifier: verifier }),
            });
            if (result.ok) return signedIn(result.value);
            // A refused code stops the login. A new redirect could get the same refusal, in a loop.
            halted = result.error;
            return failed(result.error);
        }

        const refreshToken = readTokens().refreshToken;
        if (refreshToken !== null) {
            const result = await requestTokens(attemptEpoch, {
                grant_type: 'refresh_token',
                client_id: clientId,
                redirect_uri: config.redirectUri,
                refresh_token: refreshToken,
            });
            if (result.ok) return signedIn(result.value);
            if (!isRefusal(result.error)) return failed(result.error);
            // Keep a refresh token after a network error, but not after the server refused it.
            writeTokens({ ...readTokens(), refreshToken: null });
        }
        return null;
    }

    /** Sends a grant to the token endpoint and keeps the tokens of the response. */
    async function requestTokens(
        attemptEpoch: number,
        params: Readonly<Record<string, string>>,
    ): Promise<Result<Credential, AuthError>> {
        const fetched = await fetchBody(
            environment.fetch,
            serverUrl(config.tokenPath ?? TOKEN_PATH_DEFAULT),
            {
                method: 'POST',
                headers: {
                    ...headers,
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(params).toString(),
            },
            limits,
        );
        // A logout ran while the request waited. Its tokens must not log the user in again.
        if (epoch !== attemptEpoch) return { ok: false, error: { kind: 'logged_out' } };
        if (!fetched.ok) {
            return { ok: false, error: { kind: 'token_unavailable', error: fetched.error } };
        }
        const decoded = decodeJson(fetched.value.bytes);
        if (!fetched.value.ok) {
            const message = decoded.ok ? errorMessage(decoded.value) : null;
            const error = {
                kind: 'token_rejected',
                status: fetched.value.status,
                message,
            } as const;
            return { ok: false, error };
        }
        if (!decoded.ok) {
            return { ok: false, error: { kind: 'token_invalid', path: '$', expected: 'JSON' } };
        }
        const parsed = parseResponse(TokenResponse, decoded.value);
        if (!parsed.ok) return { ok: false, error: { kind: 'token_invalid', ...parsed.error } };
        const tokens = parsed.value;
        const expiresIn =
            tokens.expires_in === null ? null : parseSeconds(String(tokens.expires_in));
        storeTokens(tokens.access_token, tokens.refresh_token, expiresIn);
        return { ok: true, value: { kind: 'bearer', token: tokens.access_token } };
    }

    function storeTokens(
        accessToken: string,
        refreshToken: string | null,
        expiresInSeconds: number | null,
    ): void {
        const lifetimeSeconds =
            expiresInSeconds === null
                ? TOKEN_LIFETIME_DEFAULT_SECONDS
                : Math.max(
                      TOKEN_LIFETIME_MIN_SECONDS,
                      expiresInSeconds - TOKEN_EXPIRY_MARGIN_SECONDS,
                  );
        writeTokens({
            accessToken,
            // A refresh grant can answer without a new refresh token. Keep the one we have.
            refreshToken: refreshToken ?? readTokens().refreshToken,
            expiresAtMs: environment.now() + lifetimeSeconds * 1000,
        });
    }

    /** The credential now, from the API key or a valid access token. It makes no requests. */
    function currentCredential(): Credential | null {
        const apiKey = config.ignoreApiKey === true ? null : deviceValue('x-api-key');
        if (apiKey !== null && apiKey.length > 0) return { kind: 'api_key', key: apiKey };
        const tokens = readTokens();
        if (tokens.accessToken === null) return null;
        if (environment.now() >= tokens.expiresAtMs) return null;
        return { kind: 'bearer', token: tokens.accessToken };
    }

    async function credentialForRequest(): Promise<Credential | null> {
        const current = currentCredential();
        if (current !== null) return current;
        const result = await authorize();
        return result.ok ? result.value : null;
    }

    /**
     * The client calls this after a 401 or a 511. Returns `true` if a new credential is ready, so
     * the client sends the request again.
     */
    function rejected(status: 401 | 511, used: Credential): Promise<boolean> {
        // A different request renewed the credential while this one waited for its response.
        const current = currentCredential();
        if (current !== null && !sameCredential(current, used)) return Promise.resolve(true);
        if (renewing !== null) return renewing;
        const attempt = renew(status, used).finally(() => {
            renewing = null;
        });
        renewing = attempt;
        return attempt;
    }

    async function renew(status: 401 | 511, used: Credential): Promise<boolean> {
        // The server does not accept an API key, and a new attempt cannot change that.
        if (used.kind === 'api_key') return false;
        invalidateToken();
        if (status === 511) {
            // 511: the session on the server ended. The user must log in again.
            if (handleLogin && authority !== null) redirect(loginUrl(authority));
            return false;
        }
        // 401: the session can have changed, so load the authority again before the new attempt.
        const renewEpoch = epoch;
        const reloaded = await loadAuthority();
        if (!reloaded.ok) return false;
        // A logout while the authority loaded ends the renewal. A new attempt would log in again.
        if (epoch !== renewEpoch) return false;
        const result = await authorize();
        return result.ok;
    }

    function loadAuthority(): Promise<Result<DomainAuthority, AuthError>> {
        if (loadingAuthority !== null) return loadingAuthority;
        const attempt = runLoadAuthority().finally(() => {
            loadingAuthority = null;
        });
        loadingAuthority = attempt;
        return attempt;
    }

    async function runLoadAuthority(): Promise<Result<DomainAuthority, AuthError>> {
        if (authority === null && status.kind !== 'redirecting') setStatus({ kind: 'loading' });
        let reason = '';
        for (let attempt = 0; attempt < AUTHORITY_ATTEMPTS_MAX; attempt += 1) {
            if (attempt > 0) await environment.wait(AUTHORITY_RETRY_MS * attempt);
            const fetched = await fetchBody(
                environment.fetch,
                serverUrl(AUTHORITY_PATH),
                {
                    method: 'GET',
                    headers: { ...headers, Accept: 'application/json' },
                    credentials: 'same-origin',
                },
                limits,
            );
            if (!fetched.ok) {
                reason = fetched.error.kind;
                continue;
            }
            if (!fetched.value.ok) {
                reason = `status ${fetched.value.status}`;
                continue;
            }
            const decoded = decodeJson(fetched.value.bytes);
            if (!decoded.ok) {
                reason = 'the body is not JSON';
                continue;
            }
            const parsed = parseResponse(DomainAuthority, decoded.value);
            if (!parsed.ok) return failed({ kind: 'authority_invalid', ...parsed.error });
            authority = parsed.value;
            return { ok: true, value: parsed.value };
        }
        return failed({ kind: 'authority_unavailable', reason });
    }

    /**
     * Reads the parameters of a login redirect: from the URL of the page or, if it has none, from
     * a deep link that `handleRedirect` kept. It also keeps the device settings of the URL.
     */
    function readRedirectParams(): LoginParamsOutcome {
        const url = environment.currentUrl();
        const params = urlParams(url);
        for (const name of DEVICE_PARAMS) {
            const value = params.get(name);
            if (value !== undefined) storage.set(storageKey(name), value);
        }
        // Remove the parameters from the URL, so a reload or a bookmark does not have them. Only
        // rewrite the URL of a login response, because the rewrite can change other encodings.
        if (hasLoginParams(params) || params.has('x-api-key')) {
            environment.replaceUrl(withoutParams(url, LOGIN_PARAMS));
        }
        return applyLoginParams(hasLoginParams(params) ? params : readDeepLink());
    }

    /** Reads and removes the parameters that `handleRedirect` kept. */
    function readDeepLink(): ReadonlyMap<string, string> {
        const text = environment.sessionStorage.get(DEEP_LINK_KEY);
        environment.sessionStorage.remove(DEEP_LINK_KEY);
        if (text === null) return new Map();
        const decoded = decodeJson(new TextEncoder().encode(text));
        if (!decoded.ok) return new Map();
        const parsed = parseResponse(record(string()), decoded.value);
        if (!parsed.ok) return new Map();
        return new Map(Object.entries(parsed.value));
    }

    /** Uses the code or the tokens of a redirect, if its state is the nonce of this client. */
    function applyLoginParams(params: ReadonlyMap<string, string>): LoginParamsOutcome {
        if (!hasLoginParams(params)) return { kind: 'none' };
        // The state is `<nonce>` or `<nonce>;<application state>`.
        const nonce = (params.get('state') ?? '').split(';')[0] ?? '';
        const saved = storage.get(storageKey('nonce'));
        if (saved === null || saved !== nonce) return { kind: 'state_mismatch' };
        // Only a login that this client started gives credentials, and only one time.
        storage.remove(storageKey('nonce'));
        const denial = params.get('error');
        if (denial !== undefined) {
            // RFC 6749 §4.1.2.1: the server refused. A new redirect shows the same refusal.
            const description = params.get('error_description') ?? null;
            return {
                kind: 'denied',
                error: { kind: 'authorization_denied', error: denial, description },
            };
        }
        const code = params.get('code');
        if (code !== undefined) pendingCode = code;
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token') ?? null;
        if (accessToken !== undefined) {
            storeTokens(accessToken, refreshToken, parseSeconds(params.get('expires_in') ?? null));
        } else if (refreshToken !== null) {
            writeTokens({ ...readTokens(), refreshToken });
        }
        // The redirect came back, so the page is not on its way to the server now.
        if (status.kind === 'redirecting') setStatus({ kind: 'loading' });
        return { kind: 'applied' };
    }

    /** The URL of the authorize page. It keeps a new nonce, and the PKCE verifier for a code. */
    function createAuthorizeUrl(): string {
        const nonce = randomString(NONCE_LENGTH);
        storage.set(storageKey('nonce'), nonce);
        const responseType = isTrusted() || config.grant.kind === 'code' ? 'code' : 'token';
        const params = new URLSearchParams({
            response_type: responseType,
            client_id: clientId,
            state: nonce,
            redirect_uri: config.redirectUri,
            scope: config.scope,
        });
        if (responseType === 'code') {
            const verifier = randomString(VERIFIER_LENGTH);
            environment.sessionStorage.set(storageKey('code_verifier'), verifier);
            const challenge = base64Url(sha256(new TextEncoder().encode(verifier)));
            params.set('code_challenge_method', 'S256');
            params.set('code_challenge', challenge);
        }
        const base = serverUrl(config.authorizePath ?? AUTHORIZE_PATH_DEFAULT);
        return `${base}${base.includes('?') ? '&' : '?'}${params.toString()}`;
    }

    function loginUrl(current: DomainAuthority): string {
        const back = encodeURIComponent(environment.currentUrl());
        return serverUrl(current.login_url.replace('{{url}}', back));
    }

    /**
     * A path on the server, or a full URL as it is. A relative login or logout URL of the authority
     * is also on the server. v1 used the `domain` of the authority, which has no port.
     */
    function serverUrl(path: string): string {
        if (/^https?:\/\//.test(path)) return path;
        return `${config.baseUrl}${path}`;
    }

    function redirect(url: string): Result<Credential, AuthError> {
        setStatus({ kind: 'redirecting', url });
        environment.navigate(url);
        return { ok: false, error: { kind: 'redirecting', url } };
    }

    function signedIn(credential: Credential): Result<Credential, AuthError> {
        assert(credential.kind !== 'none', 'a session credential is a token or a key');
        setStatus({ kind: 'signed_in', credential: credential.kind });
        return { ok: true, value: credential };
    }

    function failed<T>(error: AuthError): Result<T, AuthError> {
        if (status.kind !== 'redirecting') setStatus({ kind: 'signed_out', error });
        return { ok: false, error };
    }

    async function handleRedirect(url: string): Promise<Result<Credential, AuthError>> {
        const params = urlParams(url);
        if (!hasLoginParams(params)) return { ok: false, error: { kind: 'redirect_invalid' } };
        environment.sessionStorage.set(DEEP_LINK_KEY, JSON.stringify(Object.fromEntries(params)));
        // An attempt that runs now reads the deep link before it redirects. Then its result is the
        // result of the link, and a second attempt would redirect after a denial.
        if (authorizing !== null) {
            const linkEpoch = epoch;
            const running = await authorizing;
            // A logout while the link waited ends it. A new attempt would log in again.
            if (epoch !== linkEpoch) {
                environment.sessionStorage.remove(DEEP_LINK_KEY);
                return { ok: false, error: { kind: 'logged_out' } };
            }
            if (environment.sessionStorage.get(DEEP_LINK_KEY) === null) return running;
        }
        if (status.kind === 'redirecting') setStatus({ kind: 'loading' });
        halted = null;
        return authorize();
    }

    function onForeground(): void {
        // The handler only starts the check. Many events while a check runs give one check. A
        // rejection here is a bug, and the browser reports it as an unhandled rejection.
        if (foregroundCheck !== null) return;
        foregroundCheck = checkAfterForeground().finally(() => {
            foregroundCheck = null;
        });
    }

    /**
     * The user can log in from a different tab, browser or app while this one is in the
     * background. Then the session flag of the authority is old, or a deep link came.
     */
    async function checkAfterForeground(): Promise<void> {
        if (authority === null) return;
        if (authority.session) return;
        if (currentCredential() !== null) return;
        if (status.kind === 'redirecting') setStatus({ kind: 'loading' });
        const hasNewCredentials =
            environment.sessionStorage.get(DEEP_LINK_KEY) !== null ||
            pendingCode !== null ||
            readTokens().refreshToken !== null;
        if (!hasNewCredentials) {
            const checkEpoch = epoch;
            const reloaded = await loadAuthority();
            if (!reloaded.ok) return;
            // A logout while the authority loaded ends the check.
            if (epoch !== checkEpoch) return;
        }
        await authorize();
    }

    function useToken(token: string, expiresAtMs?: number): void {
        assert(token.length > 0, 'the token is not empty');
        const expiresAt = expiresAtMs ?? environment.now() + TOKEN_LIFETIME_DEFAULT_SECONDS * 1000;
        writeTokens({ ...readTokens(), accessToken: token, expiresAtMs: expiresAt });
        halted = null;
        setStatus({ kind: 'signed_in', credential: 'bearer' });
    }

    function useApiKey(key: string, options: { readonly trusted?: boolean } = {}): void {
        assert(key.length > 0, 'the API key is not empty');
        storage.set(storageKey('x-api-key'), key);
        storage.set(storageKey('trusted'), String(options.trusted ?? true));
        halted = null;
        setStatus({ kind: 'signed_in', credential: 'api_key' });
    }

    function invalidateToken(): void {
        writeTokens({ ...readTokens(), accessToken: null, expiresAtMs: 0 });
    }

    async function logout(): Promise<void> {
        const url =
            authority === null ? serverUrl(LOGOUT_PATH_DEFAULT) : serverUrl(authority.logout_url);
        epoch += 1;
        const requestHeaders: Record<string, string> = { ...headers };
        // Send the token also after its local expiry. That has a margin, so the server can still
        // accept the token, and the logout revokes it.
        const accessToken = readTokens().accessToken;
        if (accessToken !== null) requestHeaders['Authorization'] = `Bearer ${accessToken}`;
        const fetched = await fetchBody(
            environment.fetch,
            url,
            { method: 'GET', headers: requestHeaders, redirect: 'manual' },
            limits,
        );
        // Remove the credentials also when the request fails. The navigation ends the session.
        const location = fetched.ok ? fetched.value.headers.get('location') : null;
        clearCredentials();
        setStatus({ kind: 'signed_out', error: null });
        environment.navigate(location ?? url);
    }

    /** Removes each stored value of this client: each key that has the client ID, and the link. */
    function clearCredentials(): void {
        for (const store of [storage, environment.sessionStorage]) {
            for (const key of store.keys()) {
                if (key.includes(clientId)) store.remove(key);
            }
        }
        // The deep link key has no client ID, so v1 can read it. A logout also ends a waiting link.
        environment.sessionStorage.remove(DEEP_LINK_KEY);
        memoryTokens = NO_TOKENS;
        pendingCode = null;
    }

    function isTrusted(): boolean {
        return deviceValue('trust') === 'true' || deviceValue('trusted') === 'true';
    }

    function isFixedDevice(): boolean {
        const apiKey = deviceValue('x-api-key');
        if (config.ignoreApiKey !== true && apiKey !== null && apiKey.length > 0) return true;
        return deviceValue('fixed_device') === 'true';
    }

    /** A device setting: the key of this client first, then the key without the client ID. */
    function deviceValue(name: string): string | null {
        return storage.get(storageKey(name)) ?? storage.get(name);
    }

    /** The one place that reads the tokens: the storage if trusted, else memory. */
    function readTokens(): Tokens {
        if (!isTrusted()) return memoryTokens;
        return {
            accessToken: storage.get(storageKey('access_token')),
            refreshToken: storage.get(storageKey('refresh_token')),
            expiresAtMs: parseStoredMs(storage.get(storageKey('expires_at'))),
        };
    }

    function writeTokens(tokens: Tokens): void {
        if (!isTrusted()) {
            memoryTokens = tokens;
            return;
        }
        writeStored(storageKey('access_token'), tokens.accessToken);
        writeStored(storageKey('refresh_token'), tokens.refreshToken);
        writeStored(storageKey('expires_at'), String(tokens.expiresAtMs));
    }

    function writeStored(key: string, value: string | null): void {
        if (value === null) {
            storage.remove(key);
        } else {
            storage.set(key, value);
        }
    }

    function setStatus(next: AuthStatus): void {
        status = next;
        for (const listener of [...listeners]) listener(next);
    }

    function subscribe(listener: (status: AuthStatus) => void): () => void {
        assert(listeners.size < LISTENERS_MAX, 'the session has less than LISTENERS_MAX listeners');
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }

    /** Letters and digits from strong random bytes, without the bias of a modulo. */
    function randomString(length: number): string {
        const limit = 256 - (256 % NONCE_ALPHABET.length);
        const bytes = new Uint8Array(length * 2);
        let text = '';
        for (let round = 0; round < RANDOM_ROUNDS_MAX && text.length < length; round += 1) {
            environment.randomValues(bytes);
            for (const byte of bytes) {
                if (byte < limit && text.length < length) {
                    text += NONCE_ALPHABET.charAt(byte % NONCE_ALPHABET.length);
                }
            }
        }
        assert(text.length === length, 'the random source gives enough values');
        return text;
    }
}

/** The login parameters of a URL: the query, and the hash, which can have its own query. */
export function urlParams(url: string): ReadonlyMap<string, string> {
    const params = new Map<string, string>();
    if (url.length > URL_LENGTH_MAX) return params;
    if (!URL.canParse(url)) return params;
    const parsed = new URL(url);
    const hash = parsed.hash.slice(1);
    const queryStart = hash.indexOf('?');
    const hashMain = queryStart >= 0 ? hash.slice(0, queryStart) : hash;
    const hashQuery = queryStart >= 0 ? hash.slice(queryStart + 1) : '';
    // The query of the page wins over the hash, as in v1.
    for (const part of [hashMain, hashQuery, parsed.search.slice(1)]) {
        if (!part.includes('=')) continue;
        for (const [key, value] of new URLSearchParams(part)) {
            if (value.length > 0) params.set(key, value);
        }
    }
    return params;
}

/** `url` without the parameters in `names`, in the query and in the hash. */
export function withoutParams(url: string, names: ReadonlySet<string>): string {
    if (!URL.canParse(url)) return url;
    const parsed = new URL(url);
    parsed.search = removeNames(parsed.search.slice(1), names);
    const hash = parsed.hash.slice(1);
    const queryStart = hash.indexOf('?');
    let hashMain = queryStart >= 0 ? hash.slice(0, queryStart) : hash;
    const hashQuery = removeNames(queryStart >= 0 ? hash.slice(queryStart + 1) : '', names);
    // A hash such as `#/rooms` is a route, not parameters.
    if (hashMain.includes('=')) hashMain = removeNames(hashMain, names);
    parsed.hash = hashQuery.length > 0 ? `${hashMain}?${hashQuery}` : hashMain;
    return parsed.toString();
}

function removeNames(text: string, names: ReadonlySet<string>): string {
    if (text.length === 0) return '';
    const params = new URLSearchParams(text);
    for (const name of names) params.delete(name);
    return params.toString();
}

/** What the parameters of a redirect gave. */
type LoginParamsOutcome =
    | { readonly kind: 'none' }
    | { readonly kind: 'state_mismatch' }
    | { readonly kind: 'applied' }
    | { readonly kind: 'denied'; readonly error: AuthError };

/** A login response has a code, a token or, with a state, an OAuth error. */
function hasLoginParams(params: ReadonlyMap<string, string>): boolean {
    if (params.has('code') || params.has('access_token') || params.has('refresh_token')) {
        return true;
    }
    return params.has('error') && params.has('state');
}

/** A 4xx from the token endpoint refuses the grant. Other errors can pass with a new attempt. */
function isRefusal(error: AuthError): boolean {
    if (error.kind !== 'token_rejected') return false;
    return error.status >= 400 && error.status < 500;
}

function sameCredential(a: Credential, b: Credential): boolean {
    if (a.kind === 'bearer' && b.kind === 'bearer') return a.token === b.token;
    if (a.kind === 'api_key' && b.kind === 'api_key') return a.key === b.key;
    return a.kind === b.kind;
}

/** The `error_description` or `error` of an OAuth error body. */
function errorMessage(body: unknown): string | null {
    if (!isRecord(body)) return null;
    const description = body['error_description'];
    if (typeof description === 'string') return description;
    const error = body['error'];
    return typeof error === 'string' ? error : null;
}

function parseSeconds(text: string | null): number | null {
    if (text === null) return null;
    const seconds = Number(text);
    if (!Number.isSafeInteger(seconds)) return null;
    if (seconds < 0) return null;
    return seconds;
}

/** The expiry in the storage. A value that is not a time means that the token is expired. */
function parseStoredMs(text: string | null): number {
    if (text === null) return 0;
    const milliseconds = Number(text);
    return Number.isSafeInteger(milliseconds) ? milliseconds : 0;
}
