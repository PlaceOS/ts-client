import { Observable } from 'rxjs';
import { Md5 } from 'ts-md5';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import * as Auth from '../../src/auth/functions';
import { PlaceAuthority } from '../../src/auth/interfaces';

describe('Auth', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            writable: true,
            value: {
                assign: vi.fn(),
                protocol: 'http:',
                origin: 'http://undefined',
                href: 'http://undefined',
                host: 'undefined',
                hostname: 'undefined',
            },
        });
        window.fetch = vi.fn().mockImplementation(async () => ({
            ok: true,
            json: async () =>
                ({
                    version: '1.0.0',
                    login_url: '/login?continue={{url}}',
                    session: true,
                }) as PlaceAuthority,
        }));
    });

    afterEach(() => {
        localStorage.clear();
        Auth.cleanupAuth();
    });

    test('should allow setting up auth', async () => {
        await Auth.setup({
            auth_uri: '',
            token_uri: '',
            redirect_uri: '1',
            scope: 'public',
        });
        expect(Auth.authority).toBeTruthy();
        const client_id = Auth.clientId();
        await Auth.setup(undefined as any);
        expect(client_id).toBe(Auth.clientId());
    });

    test('should allow setting up auth with username and password', async () => {
        await Auth.setup({
            auth_uri: '',
            token_uri: '',
            redirect_uri: '',
            scope: 'public',
            auth_type: 'password',
        });
        expect(Auth.authority()).toBeTruthy();
    });

    test('should expose the API endpoint', () => {
        expect(Auth.apiEndpoint()).toBe(
            `${location.origin}${Auth.httpRoute()}`,
        );
    });

    // test('should expose the API route', async () => {
    //     vi.useFakeTimers();
    //     expect(Auth.httpRoute()).toBe('/api/engine/v2');
    //     const promise = Auth.setup({
    //         auth_uri: '',
    //         token_uri: '',
    //         redirect_uri: '',
    //         scope: 'public',
    //     });
    //     vi.runOnlyPendingTimers();
    //     await promise;
    //     expect(Auth.httpRoute()).toBe('/control/api');
    //     vi.useRealTimers();
    // });

    test('should expose the options', () => {
        expect(Auth.isMock()).toBe(false);
        expect(Auth.isSecure()).toBe(false);
        expect(Auth.isOnline()).toBe(false);
        expect(Auth.authority()).toBeFalsy();
        expect(Auth.redirectUri()).toBe(undefined);
        expect(Auth.host()).toBe(location.host);
        Auth.setup({
            host: 'localhost',
            auth_uri: '/auth/authorize',
            token_uri: '/auth/token',
            redirect_uri: '/oauth-resp.html',
            scope: 'public',
            mock: true,
            secure: true,
        });
        expect(Auth.clientId()).toBe(Md5.hashStr('/oauth-resp.html'));
        expect(Auth.redirectUri()).toBe('/oauth-resp.html');
        expect(Auth.host()).toBe('localhost');
        expect(Auth.apiEndpoint()).toBeTruthy();
        expect(Auth.isMock()).toBe(true);
        expect(Auth.isSecure()).toBe(true);
        expect(Auth.isOnline()).toBe(true);
        expect(Auth.hasToken()).toBe(!!Auth.token());
        expect(Auth.authority()).toBeTruthy();
        expect(Auth.onlineState()).toBeInstanceOf(Observable);
    });

    test('should expose the API token', async () => {
        expect(Auth.token()).toBeFalsy();
        const options = {
            auth_uri: '',
            token_uri: '',
            redirect_uri: '',
            scope: 'public',
            mock: true,
        };
        await Auth.setup(options);
        expect(Auth.token()).toBe('mock-token');
        window.location.search = '?access_token=test&expires_in=3600';
        await Auth.setup({ ...options, mock: false });
        await Auth.authorise();
        expect(Auth.token()).toBe('test');
    });

    test('should clear expired tokens', async () => {
        window.location.search = '?access_token=test&expires_in=3600';
        const options = {
            auth_uri: '',
            token_uri: '',
            redirect_uri: '',
            scope: 'public',
        };
        await Auth.setup(options);
        expect(Auth.token()).toBe('test');
        localStorage.setItem(
            `${Auth.clientId()}_expires_at`,
            `${new Date().getTime() - 3600}`,
        );
        expect(Auth.token()).toBe('test');
        expect(Auth.token()).toBe('');
    });

    test('should expose the refresh token', async () => {
        window.location.search = '?code=test';
        const options = {
            auth_uri: '',
            token_uri: 'token',
            redirect_uri: '',
            scope: 'public',
        };
        (window.fetch as any)
            .mockImplementationOnce(async () => ({
                ok: true,
                json: async () =>
                    ({
                        version: '1.0.0',
                        login_url: '/login?continue={{url}}',
                        session: true,
                    }) as PlaceAuthority,
            }))
            .mockImplementationOnce(async () => ({
                ok: true,
                json: async () => ({
                    access_token: 'today',
                    refresh_token: 'tomorrow',
                    expires_in: 3600,
                }),
            }));
        await Auth.setup({ ...options, mock: false });
        expect(window.fetch).toHaveBeenCalledTimes(2);
        // expect(Auth.token()).toBe('today');
        // expect(Auth.refreshToken()).toBe('tomorrow');
    });

    test('should expose the authority', async () => {
        expect(Auth.authority()).toBeFalsy();
        const promise = Auth.setup({
            auth_uri: '',
            token_uri: '',
            redirect_uri: '',
            scope: 'public',
        });
        await promise;
        expect(Auth.authority()).toBeTruthy();
    });

    test('should allow using session storage', async () => {
        window.location.search =
            '?access_token=test&expires_in=3600&trust=true';
        await Auth.setup({
            auth_uri: '',
            token_uri: '',
            redirect_uri: '',
            scope: 'public',
            storage: 'session',
        });
        expect(Auth.token()).toBe('test');
        expect(
            localStorage.getItem(`${Auth.clientId()}_access_token`),
        ).toBeNull();
        expect(sessionStorage.getItem(`${Auth.clientId()}_access_token`)).toBe(
            'test',
        );
    });

    test('should handle refresh token in URL', async () => {
        window.location.search =
            '?access_token=test&refresh_token=hehe&expires_in=3600&state=;^_^&&trust=true';
        await Auth.setup({
            auth_uri: '',
            token_uri: '',
            redirect_uri: '',
            scope: 'public',
        });
        expect(Auth.token()).toBe('test');
        expect(localStorage.getItem(`${Auth.clientId()}_access_token`)).toBe(
            'test',
        );
        expect(localStorage.getItem(`${Auth.clientId()}_refresh_token`)).toBe(
            'hehe',
        );
    });

    test('should fail to authorise before authority loaded', async () => {
        expect.assertions(1);
        await Auth.authorise().catch((err) => {
            expect(err).toBe('Authority is not loaded');
        });
    });

    // test('should redirect to login when user has no session', async (done) => {
    //     window.fetch = vi.fn().mockImplementation(async () => ({
    //         ok: true,
    //         json: async () =>
    //             ({
    //                 version: '1.0.0',
    //             } as PlaceAuthority),
    //     }));
    //     await Auth.setup({
    //         auth_uri: '',
    //         token_uri: '',
    //         redirect_uri: '',
    //         scope: 'public',
    //     }).catch();
    //     setTimeout(() => {
    //         expect(location.assign).toHaveBeenCalled();
    //         done();
    //     }, 400);
    // });

    // test('should handle logging out', async (done) => {
    //     window.location.search = '?access_token=test&expires_in=3600';
    //     const spy = vi.spyOn(location, 'assign');
    //     await Auth.setup({
    //         auth_uri: '',
    //         token_uri: '',
    //         redirect_uri: '',
    //         scope: 'public',
    //         storage: 'session',
    //     });
    //     expect(Auth.token()).toBe('test');
    //     Auth.logout();
    //     setTimeout(() => {
    //         expect(window.fetch).toHaveBeenCalledTimes(2);
    //         expect(Auth.token()).toBeFalsy();
    //         expect(spy).toHaveBeenCalled();
    //         done();
    //     }, 400);
    // });

    // test('should allow refreshing the authority', async () => {
    //     vi.useFakeTimers();
    //     expect(Auth.authority()).toBeFalsy();
    //     await Auth.setup({
    //         auth_uri: '',
    //         token_uri: '',
    //         redirect_uri: '',
    //         scope: 'public',
    //     });
    //     expect(Auth.authority()).toBeTruthy();
    //     window.fetch = vi.fn().mockImplementation(async () => ({
    //         ok: true,
    //         json: async () =>
    //             ({
    //                 version: '2.0.0',
    //                 login_url: '/login?continue={{url}}',
    //                 session: true,
    //             } as PlaceAuthority),
    //     }));
    //     vi.runOnlyPendingTimers();
    //     await Auth.refreshAuthority();
    //     expect(Auth.authority()?.version).toBe('2.0.0');
    //     vi.useRealTimers();
    // });

    // test('should handle error when loading authority', async () => {
    //     window.fetch = jest
    //         .fn()
    //         .mockImplementationOnce(async () => ({
    //             status: 500,
    //             ok: false,
    //             json: async () => ({}),
    //         }))
    //         .mockImplementation(async () => ({
    //             ok: true,
    //             json: async () =>
    //                 ({
    //                     version: '2.0.0',
    //                 } as PlaceAuthority),
    //         }));
    //     await Auth.setup({
    //         auth_uri: '',
    //         token_uri: '',
    //         redirect_uri: '',
    //         secure: true,
    //         scope: 'public',
    //     });
    //     expect(Auth.authority()).toBeTruthy();
    // });

    test('should allow listening to changes to token', () =>
        new Promise<void>((resolve) => {
            (async () => {
                window.location.search = '?access_token=test&expires_in=3600';
                Auth.listenForToken().subscribe((token) => {
                    if (token) {
                        resolve();
                    }
                });
                await Auth.setup({
                    auth_uri: '',
                    token_uri: '',
                    redirect_uri: '',
                    secure: true,
                    scope: 'public',
                });
            })();
        }));

    test('should allow generating challenge pairs', () => {
        (window as any).TextEncoder = vi.fn(() => ({
            encode: vi.fn((_: any) => _),
        }));
        const { challenge, verify } = Auth.generateChallenge();
        expect(challenge).toBeTruthy();
        expect(challenge).toHaveLength(43);
        expect(verify).toBeTruthy();
    });
});
