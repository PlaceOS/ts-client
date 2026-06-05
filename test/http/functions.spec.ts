import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { HttpError } from '../../src/http/interfaces';
import { createSignal } from '../../src/utilities/signal';

import * as Auth from '../../src/auth/functions';
import * as Http from '../../src/http/functions';

vi.mock('../../src/auth/functions');

describe('Http', () => {
    beforeEach(() => {
        (Auth as any).refreshAuthority = vi.fn(() => Promise.resolve());
        (Auth as any).invalidateToken = vi.fn(() => Promise.resolve());
        (Auth as any).hasToken = vi.fn();
        (Auth as any).hasToken.mockReturnValue(true);
        (Auth as any).listenForToken = vi.fn(() =>
            createSignal(true).asReadonly(),
        );
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
        await Http.request('GET', '_', {}).catch((error) => {
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
        (Auth as any).listenForToken = vi.fn(() =>
            createSignal(true).asReadonly(),
        );
        setTimeout(() => (Auth as any).hasToken.mockReturnValue(true), 500);
        await Http.request('GET', '_', {}).catch((_) => _);
        expect(Auth.refreshAuthority).toBeCalled();
    });

    test('should skip token wait for unauthenticated requests', async () => {
        expect.assertions(2);
        (Auth as any).listenForToken = vi.fn(() =>
            createSignal(false).asReadonly(),
        );
        (Auth as any).token = vi.fn();

        await Http.request('GET', '_', { skip_auth: true });

        expect(window.fetch).toHaveBeenCalled();
        expect(Auth.token).not.toHaveBeenCalled();
    });

    test('should not refresh auth for unauthenticated request failures', async () => {
        expect.assertions(2);
        window.fetch = vi.fn().mockImplementation(async () => ({
            status: 401,
            ok: false,
            text: async () => 'Unauthorised',
        }));

        await expect(
            Http.request('GET', '_', { skip_auth: true }),
        ).rejects.toMatchObject({ status: 401 });
        expect(Auth.refreshAuthority).not.toBeCalled();
    });

    test('should attach token without auth flow recovery when requested', async () => {
        expect.assertions(3);
        (Auth as any).token = vi.fn(() => 'public-token');
        window.fetch = vi.fn().mockImplementation(async () => ({
            status: 401,
            ok: false,
            text: async () => 'Unauthorised',
        }));

        await expect(
            Http.request('GET', '_', { skip_auth_flow: true }),
        ).rejects.toMatchObject({ status: 401 });
        expect(window.fetch).toHaveBeenCalledWith(
            '_',
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer public-token',
                }),
            }),
        );
        expect(Auth.refreshAuthority).not.toBeCalled();
    });

    test('should expose response headers', () => {
        expect(Http.responseHeaders('/test')).toEqual({});
    });

    test('should allow GET requests', async () => {
        expect.assertions(2);
        const data = await Http.get('test_url');
        expect(data).toEqual({ message: 'MSG Received!!!' });
        expect(window.fetch).toHaveBeenCalled();
        await (Http as any).get('', undefined, () => Promise.resolve());
    });

    test('should allow returning text data for GET', async () => {
        expect.assertions(2);
        const data = await Http.get('test_url', { response_type: 'text' });
        expect(window.fetch).toHaveBeenCalled();
        expect(data).toBe('MSG Received!!!');
    });

    test('should allow custom headers for GET', async () => {
        expect.assertions(1);
        await Http.get('test_url', {
            headers: { 'CUSTOM-HEADER-X': 'Trump Cards :)' },
        });
        expect(window.fetch).toHaveBeenCalled();
    });

    test('should handle GET errors ', async () => {
        expect.assertions(1);
        (window.fetch as any).mockImplementation(async () => ({
            status: 400,
            text: async () => 'Bad Request',
        }));
        await expect(Http.get('_')).rejects.toMatchObject({ status: 400 });
    });

    test('should allow POST requests', async () => {
        expect.assertions(2);
        const data = await Http.post('test_url', 'test_body');
        expect(data).toEqual({ message: 'MSG Received!!!' });
        expect(window.fetch).toHaveBeenCalled();
        await (Http as any).post('', '', undefined, () => Promise.resolve());
    });

    test('should allow returning POST text data', async () => {
        expect.assertions(2);
        const data = await Http.post('test_url', 'test_body', {
            response_type: 'text',
        });
        expect(data).toBe('MSG Received!!!');
        expect(window.fetch).toHaveBeenCalled();
    });

    test('should allow custom headers on POST', async () => {
        expect.assertions(1);
        await Http.post('test_url', 'test_body', {
            headers: { 'CUSTOM-HEADER-X': 'Trump Cards :)' },
        });
        expect(window.fetch).toHaveBeenCalled();
    });

    test('should handle POST errors', async () => {
        expect.assertions(1);
        (window.fetch as any).mockImplementation(async () => ({
            status: 400,
            text: async () => 'Bad Request',
        }));
        await expect(Http.post('_', '')).rejects.toMatchObject({ status: 400 });
    });

    test('should allow PUT requests', async () => {
        expect.assertions(2);
        const data = await Http.put('test_url', 'test_body');
        expect(data).toEqual({ message: 'MSG Received!!!' });
        expect(window.fetch).toHaveBeenCalled();
        await (Http as any).put('', '', undefined, () => Promise.resolve());
    });

    test('should handle PUT errors', async () => {
        expect.assertions(1);
        (window.fetch as any).mockImplementation(async () => ({
            status: 400,
            text: async () => 'Bad Request',
        }));
        await expect(Http.put('_', '')).rejects.toMatchObject({ status: 400 });
    });

    test('should allow PATCH requests', async () => {
        expect.assertions(2);
        const data = await Http.patch('test_url', 'test_body');
        expect(data).toEqual({ message: 'MSG Received!!!' });
        expect(window.fetch).toHaveBeenCalled();
        await (Http as any).patch('', '', undefined, () => Promise.resolve());
    });

    test('should handle PATCH errors', async () => {
        expect.assertions(1);
        (window.fetch as any).mockImplementation(async () => ({
            status: 400,
            text: async () => 'Bad Request',
        }));
        await expect(Http.patch('_', '')).rejects.toMatchObject({
            status: 400,
        } satisfies Partial<HttpError>);
    });

    test('should allow DELETE requests', async () => {
        expect.assertions(2);
        const data = await Http.del('test_url');
        expect(data).toBeUndefined();
        expect(window.fetch).toHaveBeenCalled();
        await (Http as any).del('', undefined, () => Promise.resolve());
    });

    test('should allow returning json data on DELETE', async () => {
        expect.assertions(2);
        const data = await Http.del('test_url', {
            response_type: 'json',
        });
        expect(data).toEqual({ message: 'MSG Received!!!' });
        expect(window.fetch).toHaveBeenCalled();
    });

    test('should allow returning text data on DELETE', async () => {
        expect.assertions(2);
        const data = await Http.del('test_url', {
            response_type: 'text',
        });
        expect(data).toEqual('MSG Received!!!');
        expect(window.fetch).toHaveBeenCalled();
    });

    test('should handle DELETE errors', async () => {
        expect.assertions(1);
        (window.fetch as any).mockImplementation(async () => ({
            status: 400,
            text: async () => 'Bad Request',
        }));
        await expect(Http.del('_')).rejects.toMatchObject({
            status: 400,
        } satisfies Partial<HttpError>);
    });
});
