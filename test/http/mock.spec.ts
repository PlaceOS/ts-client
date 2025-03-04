import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
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

    test('should handle route parameters', () =>
        new Promise<void>((resolve) => {
            expect.assertions(3);
            MockHttp.registerMockEndpoint({
                path: 'please/:get/me',
                method: 'GET',
            });
            const handler = MockHttp.findRequestHandler(
                'GET',
                'please/join/me',
            );
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
                    resolve();
                },
            });
            MockHttp.mockRequest('GET', 'please/help/me?query=true')!.subscribe(
                (_) => null,
            );
            vi.runOnlyPendingTimers();
        }));

    test('should handle query parameters', () =>
        new Promise<void>((resolve) => {
            expect.assertions(1);
            MockHttp.registerMockEndpoint({
                path: 'please/:get/me',
                method: 'GET',
                callback: (request) => {
                    expect(request.query_params).toEqual({ query: 'true' });
                    resolve();
                },
            });
            MockHttp.mockRequest('GET', 'please/help/me?query=true')!.subscribe(
                (_) => null,
            );
            vi.runOnlyPendingTimers();
        }));

    test('should handle request body', () =>
        new Promise<void>((resolve) => {
            expect.assertions(1);
            MockHttp.registerMockEndpoint({
                path: 'please/:get/me',
                method: 'POST',
                callback: (request) => {
                    expect(request.body).toEqual({ help: false });
                    resolve();
                },
            });
            MockHttp.mockRequest('POST', 'please/help/me?query=true', {
                help: false,
            })!.subscribe((_) => null);
            vi.runOnlyPendingTimers();
        }));
});
