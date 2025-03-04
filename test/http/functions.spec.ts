import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { HttpError } from '../../src/http/interfaces';

import { of } from 'rxjs';

import * as Auth from '../../src/auth/functions';
import * as Http from '../../src/http/functions';

vi.mock('../../src/auth/functions');

describe('Http', () => {
    beforeEach(() => {
        (Auth as any).refreshAuthority = vi.fn(() => Promise.resolve());
        (Auth as any).invalidateToken = vi.fn(() => Promise.resolve());
        (Auth as any).hasToken = vi.fn();
        (Auth as any).hasToken.mockReturnValue(true);
        (Auth as any).listenForToken = vi.fn(() => of(true, false, true));
        (Auth as any).hasToken.mockReturnValue(true);
        window.fetch = vi.fn().mockImplementation(
            async () =>
                ({
                    status: 200,
                    ok: true,
                    json: async () => ({ message: 'MSG Received!!!' }),
                    text: async () => 'MSG Received!!!',
                    headers: {
                        Authorisation: 'test',
                        'x-total-count': 100,
                    },
                }) as any,
        );
        vi.useFakeTimers();
    });

    afterEach(() => {
        (window.fetch as any).mockReset();
        (window.fetch as any).mockRestore();
        vi.useRealTimers();
    });

    test('should handle non 401 errors', async () => {
        expect.assertions(2);
        window.fetch = vi.fn().mockImplementation(async () => ({
            status: 400,
            text: () => Promise.resolve('Bad Request'),
        }));
        await Http.request('GET', '_', {})
            .toPromise()
            .catch((error) => {
                expect(Auth.refreshAuthority).not.toBeCalled();
                expect(error.status).toBe(400);
            });
    });

    test('should refresh auth on 401 errors', async () => {
        expect.assertions(1);
        window.fetch = vi
            .fn()
            .mockImplementation(async () => ({
                status: 200,
                text: async () => 'Success',
                json: async () => {},
            }))
            .mockImplementationOnce(async () => ({
                status: 401,
                text: async () => 'Unauthorised',
            }));
        (Auth as any).listenForToken = vi.fn(() => of(true, false, true));
        setTimeout(() => (Auth as any).hasToken.mockReturnValue(true), 500);
        await Http.request('GET', '_', {})
            .toPromise()
            .catch((_) => _);
        expect(Auth.refreshAuthority).toBeCalled();
    });

    test('should expose response headers', () => {
        expect(Http.responseHeaders('/test')).toEqual({});
    });

    test('should allow GET requests', () =>
        new Promise<void>((resolve) => {
            expect.assertions(2);
            Http.get('test_url').subscribe((data) => {
                expect(data).toEqual({ message: 'MSG Received!!!' });
                resolve();
            });
            expect(window.fetch).toHaveBeenCalled();
            (Http as any).get('', undefined, () => of());
        }));

    test('should allow returning text data for GET', () =>
        new Promise<void>((resolve) => {
            expect.assertions(2);
            Http.get('test_url', { response_type: 'text' }).subscribe(
                (data) => {
                    expect(window.fetch).toHaveBeenCalled();
                    expect(data).toBe('MSG Received!!!');
                    resolve();
                },
            );
            vi.runOnlyPendingTimers();
        }));

    test('should allow custom headers for GET', () => {
        expect.assertions(1);
        Http.get('test_url', {
            headers: { 'CUSTOM-HEADER-X': 'Trump Cards :)' },
        }).subscribe((_) => null);
        expect(window.fetch).toHaveBeenCalled();
    });

    test('should handle GET errors ', () =>
        new Promise<void>((resolve) => {
            expect.assertions(1);
            (window.fetch as any).mockImplementation(async () => ({
                status: 400,
                text: async () => 'Bad Request',
            }));
            Http.get('_').subscribe(
                (_) => null,
                (err) => {
                    expect(err.status).toBe(400);
                    resolve();
                },
            );
            vi.runOnlyPendingTimers();
        }));

    test('should allow POST requests', () =>
        new Promise<void>((resolve) => {
            expect.assertions(2);
            Http.post('test_url', 'test_body').subscribe((data) => {
                expect(data).toEqual({ message: 'MSG Received!!!' });
                resolve();
            });
            expect(window.fetch).toHaveBeenCalled();
            (Http as any).post('', '', undefined, () => of());
        }));

    test('should allow returning POST text data', () =>
        new Promise<void>((resolve) => {
            expect.assertions(2);
            Http.post('test_url', 'test_body', {
                response_type: 'text',
            }).subscribe((data) => {
                expect(data).toBe('MSG Received!!!');
                resolve();
            });
            expect(window.fetch).toHaveBeenCalled();
        }));

    test('should allow custom headers on POST', () => {
        expect.assertions(1);
        Http.post('test_url', 'test_body', {
            headers: { 'CUSTOM-HEADER-X': 'Trump Cards :)' },
        }).subscribe((_) => null);
        expect(window.fetch).toHaveBeenCalled();
    });

    test('should handle POST errors', () =>
        new Promise<void>((resolve) => {
            expect.assertions(1);
            (window.fetch as any).mockImplementation(async () => ({
                status: 400,
                text: async () => 'Bad Request',
            }));
            Http.post('_', '').subscribe(
                (_) => null,
                (err) => {
                    expect(err.status).toBe(400);
                    resolve();
                },
            );
            vi.runOnlyPendingTimers();
        }));

    test('should allow PUT requests', () =>
        new Promise<void>((resolve) => {
            expect.assertions(2);
            Http.put('test_url', 'test_body').subscribe((data) => {
                expect(data).toEqual({ message: 'MSG Received!!!' });
                resolve();
            });
            expect(window.fetch).toHaveBeenCalled();
            vi.runOnlyPendingTimers();
            (Http as any).put('', '', undefined, () => of());
        }));

    test('should handle PUT errors', () =>
        new Promise<void>((resolve) => {
            expect.assertions(1);
            (window.fetch as any).mockImplementation(async () => ({
                status: 400,
                text: async () => 'Bad Request',
            }));
            Http.put('_', '').subscribe(
                (_) => null,
                (err) => {
                    expect(err.status).toBe(400);
                    resolve();
                },
            );
            vi.runOnlyPendingTimers();
        }));

    test('should allow PATCH requests', () =>
        new Promise<void>((resolve) => {
            expect.assertions(2);
            Http.patch('test_url', 'test_body').subscribe((data: any) => {
                expect(data).toEqual({ message: 'MSG Received!!!' });
                resolve();
            });
            expect(window.fetch).toHaveBeenCalled();
            vi.runOnlyPendingTimers();
            (Http as any).patch('', '', undefined, () => of());
        }));

    test('should handle PATCH errors', () =>
        new Promise<void>((resolve) => {
            expect.assertions(1);
            (window.fetch as any).mockImplementation(async () => ({
                status: 400,
                text: async () => 'Bad Request',
            }));
            Http.patch('_', '').subscribe(
                (_: any) => null,
                (err: HttpError) => {
                    expect(err.status).toBe(400);
                    resolve();
                },
            );
            vi.runOnlyPendingTimers();
        }));

    test('should allow DELETE requests', () =>
        new Promise<void>((resolve) => {
            expect.assertions(2);
            Http.del('test_url').subscribe((data: any) => {
                expect(data).toBeUndefined();
                resolve();
            });
            expect(window.fetch).toHaveBeenCalled();
            (Http as any).del('', undefined, () => of());
        }));

    test('should allow returning json data on DELETE', () =>
        new Promise<void>((resolve) => {
            expect.assertions(2);
            Http.del('test_url', {
                response_type: 'json',
            }).subscribe((data) => {
                expect(data).toEqual({ message: 'MSG Received!!!' });
                expect(window.fetch).toHaveBeenCalled();
                resolve();
            });
        }));

    test('should allow returning text data on DELETE', () =>
        new Promise<void>((resolve) => {
            expect.assertions(2);
            Http.del('test_url', {
                response_type: 'text',
            }).subscribe((data) => {
                expect(data).toEqual('MSG Received!!!');
                expect(window.fetch).toHaveBeenCalled();
                resolve();
            });
        }));

    test('should handle DELETE errors', () =>
        new Promise<void>((resolve) => {
            expect.assertions(1);
            (window.fetch as any).mockImplementation(async () => ({
                status: 400,
                text: async () => 'Bad Request',
            }));
            Http.del('_').subscribe(
                (_: any) => null,
                (err: HttpError) => {
                    expect(err.status).toBe(400);
                    resolve();
                },
            );
            vi.runOnlyPendingTimers();
        }));
});
