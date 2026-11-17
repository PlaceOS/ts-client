/**
 * Goal: the auth session gets credentials as v1 does, and refuses credentials that it did not ask
 * for. Method: run the session against a fake environment and a fake PlaceOS server, then check
 * the requests, the navigations, the storage and the result.
 */
import { describe, expect, test } from 'bun:test';
import { memoryStore, type AuthEnvironment } from '../src/auth/environment.ts';
import {
    AUTHORITY_ATTEMPTS_MAX,
    createAuthSession,
    type AuthSessionConfig,
} from '../src/auth/session.ts';
import { base64Url, sha256 } from '../src/auth/hash.ts';
import { call, createClient, operation } from '../src/core/client.ts';
import { object, parameters, string } from '../src/core/schema.ts';
import type { Result } from '../src/core/result.ts';

const REDIRECT_URI = 'http://localhost:4200/oauth-resp.html';
/** `md5(REDIRECT_URI)`, as v1 computes it with `ts-md5`. */
const CLIENT_ID = '0de3afb200b5eb82c9bb317c870665ab';
const NOW_MS = 1_700_000_000_000;

interface Sent {
    readonly url: string;
    readonly method: string;
    readonly headers: Headers;
    readonly form: URLSearchParams;
}

interface FakeOptions {
    readonly url?: string;
    readonly session?: boolean;
    /** Answers the token endpoint. The default gives a new token for each grant. */
    readonly token?: (form: URLSearchParams) => Response | 'network_error';
    readonly authority?: () => Response;
    readonly api?: (sent: Sent) => Response;
    readonly frame?: (url: string) => Result<unknown, 'timeout' | 'frame_error'>;
}

/** A fake browser and server. The returned object records what the session did. */
function fake(options: FakeOptions = {}) {
    let currentUrl = options.url ?? 'http://localhost:4200/rooms?level=2#/map';
    let tokenCount = 0;
    let foreground: (() => void) | null = null;
    const sent: Sent[] = [];
    const navigations: string[] = [];
    const storage = memoryStore();
    const sessionStorage = memoryStore();
    const authority = {
        id: 'authority-1',
        name: 'PlaceOS',
        description: null,
        domain: 'placeos.test',
        login_url: '/login?continue={{url}}',
        logout_url: '/logout',
        session: options.session ?? true,
        production: false,
        config: {},
        version: '2.0.0',
    };
    const environment: AuthEnvironment = {
        fetch: async (url, init) => {
            const form = new URLSearchParams(typeof init.body === 'string' ? init.body : '');
            const record = {
                url,
                method: init.method ?? 'GET',
                headers: new Headers(init.headers),
                form,
            };
            sent.push(record);
            const path = new URL(url, 'http://localhost:4200').pathname;
            if (path === '/auth/authority') {
                return options.authority?.() ?? Response.json(authority);
            }
            if (path === '/auth/token') {
                const answer = options.token?.(form);
                if (answer === 'network_error') throw new TypeError('Failed to fetch');
                if (answer !== undefined) return answer;
                tokenCount += 1;
                return Response.json({
                    access_token: `token-${tokenCount}`,
                    refresh_token: `refresh-${tokenCount}`,
                    expires_in: 3600,
                });
            }
            if (path === '/logout') return new Response(null, { status: 200 });
            return options.api?.(record) ?? new Response('{}');
        },
        storage,
        sessionStorage,
        currentUrl: () => currentUrl,
        replaceUrl: (url) => {
            currentUrl = url;
        },
        navigate: (url) => {
            navigations.push(url);
        },
        now: () => NOW_MS,
        randomValues: (bytes) => {
            crypto.getRandomValues(bytes);
        },
        wait: async () => {},
        authorizeInFrame: async (url) => options.frame?.(url) ?? { ok: false, error: 'timeout' },
        onForeground: (listener) => {
            foreground = listener;
            return () => {
                foreground = null;
            };
        },
    };
    return {
        environment,
        sent,
        navigations,
        storage,
        sessionStorage,
        authority,
        url: () => currentUrl,
        setUrl: (url: string) => {
            currentUrl = url;
        },
        foreground: () => foreground?.(),
        tokenRequests: () => sent.filter((request) => request.url.endsWith('/auth/token')),
    };
}

function session(world: ReturnType<typeof fake>, config: Partial<AuthSessionConfig> = {}) {
    return createAuthSession({
        baseUrl: '',
        redirectUri: REDIRECT_URI,
        scope: 'public',
        grant: { kind: 'code' },
        environment: world.environment,
        ...config,
    });
}

/** Starts a login, so the storage has a nonce, then gives the state that the server sends back. */
async function startLogin(world: ReturnType<typeof fake>, config: Partial<AuthSessionConfig> = {}) {
    await session(world, config).start();
    const target = new URL(world.navigations.at(-1) ?? '', 'http://localhost:4200');
    return target.searchParams;
}

describe('authorization code with PKCE', () => {
    test('the client ID is the MD5 of the redirect URI, as in v1', () => {
        expect(session(fake()).clientId).toBe(CLIENT_ID);
    });

    test('sends a user with a session to authorize, with a nonce and a challenge', async () => {
        const world = fake();
        const result = await session(world).start();
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.kind).toBe('redirecting');
        const target = new URL(world.navigations[0] ?? '', 'http://localhost:4200');
        expect(target.pathname).toBe('/auth/oauth/authorize');
        expect(target.searchParams.get('response_type')).toBe('code');
        expect(target.searchParams.get('client_id')).toBe(CLIENT_ID);
        expect(target.searchParams.get('state')).toBe(world.storage.get(`${CLIENT_ID}_nonce`));
        const verifier = world.sessionStorage.get(`${CLIENT_ID}_code_verifier`) ?? '';
        const challenge = base64Url(sha256(new TextEncoder().encode(verifier)));
        expect(target.searchParams.get('code_challenge')).toBe(challenge);
        expect(target.searchParams.get('code_challenge_method')).toBe('S256');
    });

    test('exchanges the code of the redirect, then removes it from the URL', async () => {
        const world = fake();
        const state = (await startLogin(world)).get('state') ?? '';
        const verifier = world.sessionStorage.get(`${CLIENT_ID}_code_verifier`);
        world.setUrl(`http://localhost:4200/rooms?level=2&code=abc&state=${state}#/map`);
        const result = await session(world).start();
        expect(result).toEqual({ ok: true, value: { kind: 'bearer', token: 'token-1' } });
        const form = world.tokenRequests()[0]?.form;
        expect(form?.get('grant_type')).toBe('authorization_code');
        expect(form?.get('code')).toBe('abc');
        expect(form?.get('code_verifier')).toBe(verifier);
        expect(world.url()).toBe('http://localhost:4200/rooms?level=2#/map');
        // An application that is not trusted keeps its tokens in memory only.
        expect(world.storage.get(`${CLIENT_ID}_access_token`)).toBeNull();
    });

    test('refuses a code with a state that this client did not send', async () => {
        const world = fake();
        await startLogin(world);
        world.setUrl('http://localhost:4200/?code=stolen&state=other');
        const result = await session(world).start();
        expect(world.tokenRequests()).toHaveLength(0);
        expect(result.ok).toBe(false);
        expect(world.url()).toBe('http://localhost:4200/');
    });

    test('a nonce gives credentials one time only', async () => {
        const world = fake();
        const state = (await startLogin(world)).get('state') ?? '';
        world.setUrl(`http://localhost:4200/?code=abc&state=${state}`);
        await session(world).start();
        world.setUrl(`http://localhost:4200/?code=again&state=${state}`);
        await session(world).start();
        expect(world.tokenRequests().map((request) => request.form.get('code'))).toEqual(['abc']);
    });
});

describe('login page', () => {
    test('sends a user without a session to the login page of the authority domain', async () => {
        const world = fake({ session: false });
        await session(world).start();
        const back = encodeURIComponent('http://localhost:4200/rooms?level=2#/map');
        expect(world.navigations).toEqual([`http://placeos.test/login?continue=${back}`]);
    });

    test('gives login_required and does not navigate when handleLogin is false', async () => {
        const world = fake({ session: false });
        const auth = session(world, { handleLogin: false });
        expect(await auth.start()).toEqual({ ok: false, error: { kind: 'login_required' } });
        expect(world.navigations).toEqual([]);
        expect(auth.status()).toEqual({ kind: 'signed_out', error: { kind: 'login_required' } });
    });

    test('stops after AUTHORITY_ATTEMPTS_MAX failed loads of the authority', async () => {
        const world = fake({ authority: () => new Response('down', { status: 503 }) });
        const auth = session(world);
        const result = await auth.start();
        expect(result).toEqual({
            ok: false,
            error: { kind: 'authority_unavailable', reason: 'status 503' },
        });
        expect(world.sent).toHaveLength(AUTHORITY_ATTEMPTS_MAX);
        expect(auth.status().kind).toBe('signed_out');
    });
});

describe('trusted applications and refresh tokens', () => {
    test('a trusted application keeps its tokens in the v1 storage keys', async () => {
        const world = fake({ url: 'http://localhost:4200/?trust=true' });
        const state = (await startLogin(world)).get('state') ?? '';
        world.setUrl(`http://localhost:4200/?code=abc&state=${state}`);
        await session(world).start();
        expect(world.storage.get(`${CLIENT_ID}_access_token`)).toBe('token-1');
        expect(world.storage.get(`${CLIENT_ID}_refresh_token`)).toBe('refresh-1');
        const lifetimeMs = (3600 - 300) * 1000;
        expect(world.storage.get(`${CLIENT_ID}_expires_at`)).toBe(String(NOW_MS + lifetimeMs));
        // A new page load uses the stored token without a token request.
        world.setUrl('http://localhost:4200/');
        expect(await session(world).start()).toEqual({
            ok: true,
            value: { kind: 'bearer', token: 'token-1' },
        });
        expect(world.tokenRequests()).toHaveLength(1);
    });

    test('a refused refresh token is removed, and the login continues', async () => {
        const world = fake({
            token: (form) =>
                form.get('grant_type') === 'refresh_token'
                    ? Response.json({ error: 'invalid_grant' }, { status: 400 })
                    : Response.json({ access_token: 'unused' }),
        });
        world.storage.set('trusted', 'true');
        world.storage.set(`${CLIENT_ID}_refresh_token`, 'old');
        const result = await session(world).start();
        expect(world.storage.get(`${CLIENT_ID}_refresh_token`)).toBeNull();
        if (!result.ok) expect(result.error.kind).toBe('redirecting');
        expect(world.navigations).toHaveLength(1);
    });

    test('a network error keeps the refresh token for the next attempt', async () => {
        const world = fake({ token: () => 'network_error' });
        world.storage.set('trusted', 'true');
        world.storage.set(`${CLIENT_ID}_refresh_token`, 'old');
        const result = await session(world).start();
        expect(result).toEqual({
            ok: false,
            error: {
                kind: 'token_unavailable',
                error: { kind: 'network', message: 'Failed to fetch' },
            },
        });
        expect(world.storage.get(`${CLIENT_ID}_refresh_token`)).toBe('old');
        expect(world.navigations).toHaveLength(0);
    });
});

describe('other grants', () => {
    test('the implicit grant asks for a token and reads it from the hash', async () => {
        const world = fake();
        const query = await startLogin(world, { grant: { kind: 'implicit' } });
        expect(query.get('response_type')).toBe('token');
        expect(query.get('code_challenge')).toBeNull();
        const state = query.get('state') ?? '';
        world.setUrl(`http://localhost:4200/#access_token=abc&expires_in=600&state=${state}`);
        const auth = session(world, { grant: { kind: 'implicit' } });
        expect(await auth.start()).toEqual({ ok: true, value: { kind: 'bearer', token: 'abc' } });
        expect(world.url()).toBe('http://localhost:4200/');
    });

    test('the password grant sends the credentials in the body, not in the URL', async () => {
        const world = fake();
        const grant = { kind: 'password', username: 'ann', password: 'secret' } as const;
        await session(world, { grant }).start();
        const request = world.tokenRequests()[0];
        expect(request?.url).toBe('/auth/token');
        expect(request?.form.get('grant_type')).toBe('password');
        expect(request?.form.get('password')).toBe('secret');
        expect(request?.form.get('authority')).toBe('authority-1');
    });

    test('the Entra grant exchanges the Microsoft token', async () => {
        const world = fake();
        const grant = { kind: 'entra', entraToken: async () => 'entra-1' } as const;
        await session(world, { grant }).start();
        const form = world.tokenRequests()[0]?.form;
        expect(form?.get('grant_type')).toBe('urn:ietf:params:oauth:grant-type:token-exchange');
        expect(form?.get('subject_token')).toBe('entra-1');
    });
});

describe('frames, deep links and fixed devices', () => {
    test('a frame login exchanges the code that the frame sends back', async () => {
        let nonce = '';
        const world = fake({
            frame: (url) => {
                nonce = new URL(url, 'http://localhost:4200').searchParams.get('state') ?? '';
                return {
                    ok: true,
                    value: { type: 'place-os', params: { code: 'abc', state: nonce } },
                };
            },
        });
        const result = await session(world, { useFrame: true }).start();
        expect(result).toEqual({ ok: true, value: { kind: 'bearer', token: 'token-1' } });
        expect(world.navigations).toHaveLength(0);
    });

    test('a frame message with a different state is refused', async () => {
        const world = fake({
            frame: () => ({
                ok: true,
                value: { type: 'place-os', params: { code: 'abc', state: 'x' } },
            }),
        });
        const result = await session(world, { useFrame: true }).start();
        expect(result).toEqual({
            ok: false,
            error: { kind: 'frame_failed', reason: 'state_mismatch' },
        });
        expect(world.tokenRequests()).toHaveLength(0);
    });

    test('handleRedirect completes the login of a deep link', async () => {
        const world = fake();
        const state = (await startLogin(world)).get('state') ?? '';
        const auth = session(world);
        expect(await auth.handleRedirect('placeos://callback')).toEqual({
            ok: false,
            error: { kind: 'redirect_invalid' },
        });
        const result = await auth.handleRedirect(`placeos://callback?code=abc&state=${state}`);
        expect(result).toEqual({ ok: true, value: { kind: 'bearer', token: 'token-1' } });
    });

    test('an API key in the URL is the credential of a fixed device', async () => {
        const world = fake({ url: 'http://localhost:4200/?x-api-key=key-1&fixed_device=true' });
        const auth = session(world);
        expect(await auth.start()).toEqual({ ok: true, value: { kind: 'api_key', key: 'key-1' } });
        expect(auth.isFixedDevice()).toBe(true);
        expect(world.url()).toBe('http://localhost:4200/?fixed_device=true');
        const ignoring = session(world, { ignoreApiKey: true });
        expect(ignoring.credential()).toBeNull();
    });

    test('the foreground loads the authority again when there was no session', async () => {
        let hasSession = false;
        const world = fake({
            authority: () =>
                Response.json({
                    id: 'authority-1',
                    name: 'PlaceOS',
                    domain: 'placeos.test',
                    login_url: '/login',
                    logout_url: '/logout',
                    session: hasSession,
                }),
        });
        const auth = session(world);
        await auth.start();
        expect(world.navigations).toEqual(['http://placeos.test/login']);
        // The user logs in with a different tab, then this one comes back.
        hasSession = true;
        world.foreground();
        await Bun.sleep(0);
        expect(world.navigations.at(-1)).toStartWith('/auth/oauth/authorize?');
        auth.stop();
    });
});

describe('the session with the client', () => {
    const SHOW = operation({
        method: 'GET',
        path: '/api/engine/v2/zones/{id}',
        pathKeys: ['id'],
        params: parameters({ id: string() }, ['id']),
        body: null,
        response: object({ id: string() }, ['id']),
    });

    test('a 401 renews the token one time, and parallel requests share the renewal', async () => {
        const world = fake({
            api: (sent) =>
                sent.headers.get('authorization') === 'Bearer stale'
                    ? new Response('{}', { status: 401 })
                    : Response.json({ id: 'zone-1' }),
        });
        world.storage.set('trusted', 'true');
        world.storage.set(`${CLIENT_ID}_access_token`, 'stale');
        world.storage.set(`${CLIENT_ID}_refresh_token`, 'refresh-0');
        world.storage.set(`${CLIENT_ID}_expires_at`, String(NOW_MS + 60_000));
        const auth = session(world);
        const client = createClient({
            baseUrl: '',
            auth: auth.clientAuth,
            fetch: world.environment.fetch,
        });
        const results = await Promise.all([
            call(SHOW, { id: 'zone-1' }, { client }),
            call(SHOW, { id: 'zone-1' }, { client }),
        ]);
        expect(results.map((result) => result.ok)).toEqual([true, true]);
        expect(world.tokenRequests()).toHaveLength(1);
        expect(world.tokenRequests()[0]?.form.get('refresh_token')).toBe('refresh-0');
    });

    test('logout removes the credentials of this client and goes to the logout page', async () => {
        const world = fake();
        world.storage.set('trusted', 'true');
        world.storage.set(`${CLIENT_ID}_access_token`, 'token');
        world.storage.set(`${CLIENT_ID}_expires_at`, String(NOW_MS + 60_000));
        world.storage.set('other_app_token', 'keep');
        const auth = session(world);
        await auth.start();
        await auth.logout();
        expect(world.storage.get(`${CLIENT_ID}_access_token`)).toBeNull();
        expect(world.storage.get('other_app_token')).toBe('keep');
        expect(world.navigations).toEqual(['http://placeos.test/logout']);
        expect(world.sent.at(-1)?.headers.get('authorization')).toBe('Bearer token');
    });
});
