/**
 * Goal: the auth session gets credentials as v1 does, and refuses credentials that it did not ask
 * for. Method: run the session against a fake environment and a fake PlaceOS server, then check
 * the requests, the navigations, the storage and the result.
 */
import { describe, expect, test } from 'bun:test';
import { memoryStore, webStorageStore, type AuthEnvironment } from '../src/auth/environment.ts';
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
    readonly token?: (form: URLSearchParams) => Response | Promise<Response> | 'network_error';
    readonly authority?: () => Response | Promise<Response>;
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
                return (await options.authority?.()) ?? Response.json(authority);
            }
            if (path === '/auth/oauth/token') {
                const answer = await options.token?.(form);
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
        tokenRequests: () => sent.filter((request) => request.url.endsWith('/auth/oauth/token')),
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

    test('a refusal on the consent page stops the login, so it does not loop', async () => {
        // auth.cr sends `error=access_denied` and the state to the redirect URI (RFC 6749 §4.1.2.1).
        const world = fake();
        const state = (await startLogin(world)).get('state') ?? '';
        const navigations = world.navigations.length;
        const description = encodeURIComponent('The resource owner denied the request.');
        world.setUrl(
            `http://localhost:4200/rooms?error=access_denied&error_description=${description}` +
                `&state=${state}`,
        );
        const result = await session(world).start();
        expect(result).toEqual({
            ok: false,
            error: {
                kind: 'authorization_denied',
                error: 'access_denied',
                description: 'The resource owner denied the request.',
            },
        });
        expect(world.navigations).toHaveLength(navigations);
        expect(world.url()).toBe('http://localhost:4200/rooms');
    });

    test('after a refusal, a request does not start the login again until start', async () => {
        const world = fake();
        const state = (await startLogin(world)).get('state') ?? '';
        world.setUrl(`http://localhost:4200/?error=access_denied&state=${state}`);
        const auth = session(world);
        await auth.start();
        const navigations = world.navigations.length;
        // A request of the client calls `authorize`. It must not go to the consent page again.
        const again = await auth.authorize();
        if (!again.ok) expect(again.error.kind).toBe('authorization_denied');
        expect(world.navigations).toHaveLength(navigations);
        // `start` is the explicit retry.
        await auth.start();
        expect(world.navigations).toHaveLength(navigations + 1);
    });

    test('an error with a different state is not a refusal of this client', async () => {
        const world = fake();
        await startLogin(world);
        world.setUrl('http://localhost:4200/?error=access_denied&state=other');
        const result = await session(world).start();
        if (!result.ok) expect(result.error.kind).toBe('redirecting');
    });

    test('a refused code stops the login, so a bad token path cannot loop', async () => {
        const world = fake({ token: () => new Response('', { status: 404 }) });
        const state = (await startLogin(world)).get('state') ?? '';
        const navigations = world.navigations.length;
        world.setUrl(`http://localhost:4200/?code=abc&state=${state}`);
        const auth = session(world);
        const result = await auth.start();
        expect(result).toEqual({
            ok: false,
            error: { kind: 'token_rejected', status: 404, message: null },
        });
        expect(world.navigations).toHaveLength(navigations);
        expect(auth.status().kind).toBe('signed_out');
        await auth.authorize();
        expect(world.navigations).toHaveLength(navigations);
    });

    test('the redirect leaves the URL also when the authority does not load', async () => {
        const world = fake({ authority: () => new Response('down', { status: 503 }) });
        world.storage.set(`${CLIENT_ID}_nonce`, 'nonce-1');
        world.setUrl('http://localhost:4200/rooms?code=abc&state=nonce-1');
        await session(world).start();
        expect(world.url()).toBe('http://localhost:4200/rooms');
    });

    test('a denial in a deep link during start is read one time, and stops the login', async () => {
        let release: () => void = () => {};
        const loaded = new Promise<void>((resolve) => (release = resolve));
        const world = fake({
            authority: async () => {
                await loaded;
                return Response.json({ ...world.authority });
            },
        });
        world.storage.set(`${CLIENT_ID}_nonce`, 'nonce-1');
        const auth = session(world);
        const starting = auth.start();
        await Bun.sleep(0);
        const handled = auth.handleRedirect('placeos://callback?error=access_denied&state=nonce-1');
        release();
        await starting;
        const result = await handled;
        if (!result.ok) expect(result.error.kind).toBe('authorization_denied');
        expect(world.navigations).toHaveLength(0);
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
    test('sends a user without a session to the login page, on the server', async () => {
        const world = fake({ session: false });
        await session(world).start();
        const back = encodeURIComponent('http://localhost:4200/rooms?level=2#/map');
        expect(world.navigations).toEqual([`/login?continue=${back}`]);
    });

    test('gives login_required and does not navigate when handleLogin is false', async () => {
        const world = fake({ session: false });
        const auth = session(world, { handleLogin: false });
        expect(await auth.start()).toEqual({ ok: false, error: { kind: 'login_required' } });
        expect(world.navigations).toEqual([]);
        expect(auth.status()).toEqual({ kind: 'signed_out', error: { kind: 'login_required' } });
    });

    test('accepts the authority of auth.cr, which can have a null id', async () => {
        const world = fake({
            session: false,
            authority: () =>
                Response.json({
                    id: null,
                    name: 'PlaceOS',
                    description: '',
                    domain: 'placeos.test',
                    login_url: '/auth/login?continue={{url}}',
                    logout_url: '/auth/logout',
                    email_domains: [],
                    config: {},
                    updated_at: '2026-11-01T00:00:00Z',
                    version: 'v2.0.0',
                    production: true,
                    session: false,
                    token_valid: false,
                }),
        });
        const auth = session(world);
        await auth.start();
        expect(auth.authority()?.id).toBeNull();
        expect(world.navigations[0]).toStartWith('/auth/login?continue=');
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
        // auth.cr adds `scope` when the granted scope is not the requested one.
        const fragment = `access_token=abc&token_type=Bearer&expires_in=600&scope=public`;
        world.setUrl(`http://localhost:4200/#${fragment}&state=${state}`);
        const auth = session(world, { grant: { kind: 'implicit' } });
        expect(await auth.start()).toEqual({ ok: true, value: { kind: 'bearer', token: 'abc' } });
        expect(world.url()).toBe('http://localhost:4200/');
    });

    test('the password grant sends the credentials in the body, not in the URL', async () => {
        const world = fake();
        const grant = { kind: 'password', username: 'ann', password: 'secret' } as const;
        await session(world, { grant }).start();
        const request = world.tokenRequests()[0];
        expect(request?.url).toBe('/auth/oauth/token');
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
        expect(world.navigations).toEqual(['/login']);
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
        name: 'zones.show',
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

    test('a refresh that ends after logout does not log the user in again', async () => {
        let answer: (response: Response) => void = () => {};
        const world = fake({
            token: () => new Promise<Response>((resolve) => (answer = resolve)),
        });
        world.storage.set('trusted', 'true');
        world.storage.set(`${CLIENT_ID}_refresh_token`, 'refresh-0');
        const auth = session(world);
        const pending = auth.start();
        await Bun.sleep(0);
        await auth.logout();
        answer(
            Response.json({
                access_token: 'late',
                refresh_token: 'late-refresh',
                expires_in: 3600,
            }),
        );
        expect(await pending).toEqual({ ok: false, error: { kind: 'logged_out' } });
        expect(world.storage.get(`${CLIENT_ID}_access_token`)).toBeNull();
        expect(auth.credential()).toBeNull();
        expect(auth.status().kind).toBe('signed_out');
    });

    test('a logout while the Entra token is pending ends that login', async () => {
        let give: (token: string) => void = () => {};
        const entraToken = () => new Promise<string | null>((resolve) => (give = resolve));
        const world = fake();
        const auth = session(world, { grant: { kind: 'entra', entraToken } });
        const pending = auth.start();
        await Bun.sleep(0);
        await auth.logout();
        give('entra-1');
        expect(await pending).toEqual({ ok: false, error: { kind: 'logged_out' } });
        expect(world.tokenRequests()).toHaveLength(0);
        expect(auth.credential()).toBeNull();
    });

    test('a logout at once after start does not give the old token to start', async () => {
        const world = fake();
        world.storage.set('trusted', 'true');
        world.storage.set(`${CLIENT_ID}_access_token`, 'token');
        world.storage.set(`${CLIENT_ID}_expires_at`, String(NOW_MS + 60_000));
        const auth = session(world);
        await auth.reloadAuthority();
        const pending = auth.start();
        await auth.logout();
        expect(await pending).toEqual({ ok: false, error: { kind: 'logged_out' } });
    });

    test('a logout at once after start ends that login, so it does not redirect', async () => {
        const world = fake();
        const auth = session(world);
        await auth.reloadAuthority();
        const pending = auth.start();
        await auth.logout();
        expect(await pending).toEqual({ ok: false, error: { kind: 'logged_out' } });
        expect(world.navigations.filter((url) => url.includes('/authorize'))).toHaveLength(0);
    });

    test('a logout while a deep link waits ends the link, so the login does not restart', async () => {
        let release: () => void = () => {};
        const loaded = new Promise<void>((resolve) => (release = resolve));
        const world = fake({
            authority: async () => {
                await loaded;
                return Response.json({ ...world.authority });
            },
        });
        world.storage.set(`${CLIENT_ID}_nonce`, 'nonce-1');
        const auth = session(world);
        const starting = auth.start();
        await Bun.sleep(0);
        const handled = auth.handleRedirect('placeos://callback?code=abc&state=nonce-1');
        await auth.logout();
        release();
        await starting;
        expect(await handled).toEqual({ ok: false, error: { kind: 'logged_out' } });
        expect(world.navigations.filter((url) => url.includes('/authorize'))).toHaveLength(0);
        expect(world.tokenRequests()).toHaveLength(0);
    });

    test('a logout while a renewal loads the authority ends the renewal', async () => {
        let release: () => void = () => {};
        let slow = false;
        const world = fake({
            authority: async () => {
                if (slow) await new Promise<void>((resolve) => (release = resolve));
                return Response.json({ ...world.authority });
            },
        });
        world.storage.set('trusted', 'true');
        world.storage.set(`${CLIENT_ID}_access_token`, 'stale');
        world.storage.set(`${CLIENT_ID}_refresh_token`, 'refresh-0');
        world.storage.set(`${CLIENT_ID}_expires_at`, String(NOW_MS + 60_000));
        const auth = session(world);
        await auth.start();
        if (auth.clientAuth.kind !== 'credential') throw new Error('a credential auth');
        slow = true;
        const renewing = auth.clientAuth.rejected(401, { kind: 'bearer', token: 'stale' });
        await Bun.sleep(0);
        await auth.logout();
        release();
        expect(await renewing).toBe(false);
        expect(world.tokenRequests()).toHaveLength(0);
        expect(auth.credential()).toBeNull();
    });

    test('logout sends the token also after its local expiry, so the server revokes it', async () => {
        const world = fake();
        world.storage.set('trusted', 'true');
        world.storage.set(`${CLIENT_ID}_access_token`, 'expired-here');
        world.storage.set(`${CLIENT_ID}_expires_at`, String(NOW_MS - 1));
        await session(world).logout();
        expect(world.sent.at(-1)?.headers.get('authorization')).toBe('Bearer expired-here');
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
        expect(world.navigations).toEqual(['/logout']);
        expect(world.sent.at(-1)?.headers.get('authorization')).toBe('Bearer token');
    });
});

describe('web storage', () => {
    /** A Web Storage in memory. `full` makes `setItem` throw, as a full quota does. */
    function fakeStorage() {
        const values = new Map<string, string>();
        let full = false;
        const storage: Storage = {
            get length() {
                return values.size;
            },
            clear: () => values.clear(),
            getItem: (key) => values.get(key) ?? null,
            key: (index) => [...values.keys()][index] ?? null,
            removeItem: (key) => {
                values.delete(key);
            },
            setItem: (key, value) => {
                if (full) throw new DOMException('quota', 'QuotaExceededError');
                values.set(key, value);
            },
        };
        return { storage, values, fill: () => (full = true) };
    }

    test('a removal in a different tab is seen here, so a logout there logs out here', () => {
        const fakeWeb = fakeStorage();
        const store = webStorageStore(() => fakeWeb.storage);
        store.set('token', 'abc');
        fakeWeb.values.delete('token');
        expect(store.get('token')).toBeNull();
    });

    test('a value that the storage refuses stays in memory', () => {
        const fakeWeb = fakeStorage();
        const store = webStorageStore(() => fakeWeb.storage);
        fakeWeb.fill();
        store.set('token', 'abc');
        expect(store.get('token')).toBe('abc');
        expect(store.keys()).toEqual(['token']);
    });
});
