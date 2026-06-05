import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MockHttpRequestHandlerOptions } from '../../src/http/interfaces';

import * as MockHttp from '../../src/http/mock';

describe('MockHttp', () => {
    const global_handlers: MockHttpRequestHandlerOptions[] = [
        {
            path: 'test/path',
            method: 'GET',
            metadata: {},
            callback: () => 'test',
        },
        {
            path: '/test/path2',
            method: 'GET',
            metadata: {},
            callback: () => 'test',
        },
    ];

    beforeEach(() => {
        for (const handler of global_handlers) {
            MockHttp.registerMockEndpoint(handler);
        }
        vi.useFakeTimers();
    });

    afterEach(() => {
        MockHttp.clearMockEndpoints();
        MockHttp.setMockNotFoundHandler((method, url) => {
            const error = new Error(
                `Mock endpoint not found: ${method} ${url}`,
            );
            (error as any).status = 404;
            return Promise.reject(error);
        });
        vi.useRealTimers();
    });

    test('should register global handlers', () => {
        let handler = MockHttp.findRequestHandler('GET', 'test/path');
        expect(handler).toBeTruthy();
        handler = MockHttp.findRequestHandler('GET', '/test/path');
        expect(handler).toBeTruthy();
        handler = MockHttp.findRequestHandler('GET', 'test/path2');
        expect(handler).toBeTruthy();
        handler = MockHttp.findRequestHandler('GET', '/test/path2');
        expect(handler).toBeTruthy();
    });

    test('should register new handlers', () => {
        MockHttp.registerMockEndpoint({
            path: 'please/delete/me',
            method: 'DELETE',
        });
        let handler = MockHttp.findRequestHandler('DELETE', 'please/delete/me');
        expect(handler).toBeTruthy();
        // Check registration of handlers with route parameters
        MockHttp.registerMockEndpoint({
            path: 'please/:get/me',
            method: 'GET',
        });
        handler = MockHttp.findRequestHandler('GET', 'please/join/me');
        expect(handler).toBeTruthy();
    });

    test('should handle route parameters', async () => {
        expect.assertions(3);
        MockHttp.registerMockEndpoint({
            path: 'please/:get/me',
            method: 'GET',
        });
        const handler = MockHttp.findRequestHandler('GET', 'please/join/me');
        expect(handler).toBeTruthy();
        expect((handler || ({} as any)).path_structure).toEqual([
            '',
            'get',
            '',
        ]);
        MockHttp.registerMockEndpoint({
            path: 'please/:get/me',
            metadata: null,
            method: 'GET',
            callback: (request) => {
                expect(request.route_params).toEqual({ get: 'help' });
            },
        });
        const promise = MockHttp.mockRequest(
            'GET',
            'please/help/me?query=true',
        );
        vi.runOnlyPendingTimers();
        await promise;
    });

    test('should handle query parameters', async () => {
        expect.assertions(1);
        MockHttp.registerMockEndpoint({
            path: 'please/:get/me',
            method: 'GET',
            callback: (request) => {
                expect(request.query_params).toEqual({ query: 'true' });
            },
        });
        const promise = MockHttp.mockRequest(
            'GET',
            'please/help/me?query=true',
        );
        vi.runOnlyPendingTimers();
        await promise;
    });

    test('should handle request body', async () => {
        expect.assertions(1);
        MockHttp.registerMockEndpoint({
            path: 'please/:get/me',
            method: 'POST',
            callback: (request) => {
                expect(request.body).toEqual({ help: false });
            },
        });
        const promise = MockHttp.mockRequest(
            'POST',
            'please/help/me?query=true',
            {
                help: false,
            },
        );
        vi.runOnlyPendingTimers();
        await promise;
    });

    test('should return promise errors from handler callbacks', async () => {
        const error = new Error('Callback failure');
        MockHttp.registerMockEndpoint({
            path: 'please/:get/me',
            method: 'GET',
            callback: () => {
                throw error;
            },
        });
        await expect(
            MockHttp.mockRequest('GET', 'please/help/me'),
        ).rejects.toBe(error);
    });

    test('should return promise errors from not found handlers', async () => {
        const error = new Error('Not found handler failure');
        MockHttp.setMockNotFoundHandler(() => {
            throw error;
        });
        await expect(
            MockHttp.mockRequest('GET', 'missing/endpoint'),
        ).rejects.toBe(error);
    });
});
