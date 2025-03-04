import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { Subject } from 'rxjs';

import { HashMap } from '../../src/utilities/types';
import { PlaceResponse } from '../../src/realtime/interfaces';

import * as rxjs from 'rxjs/webSocket';
import * as Auth from '../../src/auth/functions';
import * as Utils from '../../src/utilities/general';
import * as mock_ws from '../../src/realtime/mock';
import * as ws from '../../src/realtime/functions';

vi.mock('../../src/auth/functions');

const DELAY = Math.pow(2, 40);

describe('Realtime API', () => {
    let fake_socket: Subject<any>;
    let another_fake_socket: Subject<any>;
    let ws_spy: any;
    let log_spy: any;
    let conn_spy: any;
    let count = 0;

    beforeEach(() => {
        vi.useFakeTimers();
        fake_socket = new Subject<any>();
        another_fake_socket = new Subject<any>();
        log_spy = vi.spyOn(Utils, 'log');
        (Auth as any).token = vi.fn().mockReturnValue('test');
        (Auth as any).apiEndpoint = vi.fn().mockReturnValue('/api/engine/v2');
        (Auth as any).authority = vi.fn().mockReturnValue({});
        (Auth as any).isMock = vi.fn().mockReturnValue(false);
        (Auth as any).refreshAuthority = vi
            .fn()
            .mockImplementation(async () => null);
        (Auth as any).invalidateToken = vi
            .fn()
            .mockImplementation(async () => null);
        ws_spy = vi.spyOn(rxjs, 'webSocket');
        ws_spy
            .mockImplementationOnce(() => fake_socket)
            .mockImplementationOnce(() => another_fake_socket)
            .mockImplementation(() => fake_socket);
        ws.ignore({ sys: 'sys-A0', mod: 'mod', index: 1, name: 'power' }, 0);
        count++;
        conn_spy = vi.spyOn(ws, 'isConnected');
        conn_spy.mockReturnValue(true);
        vi.runOnlyPendingTimers();
    });

    afterEach(() => {
        count = 0;
        ws.cleanupRealtime();
        ws_spy.mockRestore();
        log_spy.mockRestore();
        conn_spy.mockRestore();
        vi.useRealTimers();
    });

    const test_method = (
        method: 'bind' | 'unbind' | 'debug' | 'ignore',
        done: () => void,
    ) => {
        const details = {
            sys: `sys-B0-${method}`,
            mod: 'mod',
            index: 1,
            name: 'power',
        };
        const post = vi.fn().mockImplementation(async () => null);
        let promise = (ws[method] as any)(details, DELAY, post);
        expect(post).toHaveBeenCalledWith(
            {
                id: ++count,
                cmd: method,
                ...details,
            },
            DELAY,
        );
        // Test success
        promise.then(() => {
            post.mockImplementation(async () => {
                throw {
                    id: 2,
                    type: 'error',
                    code: 7,
                    msg: 'test error',
                } as PlaceResponse;
            });
            promise = (ws[method] as any)(details, DELAY, post);
            expect(post).toHaveBeenCalledWith(
                {
                    id: ++count,
                    cmd: method,
                    ...details,
                },
                DELAY,
            );
            // Test error
            promise.then(null, () => done());
        });
    };

    test('should handle bind request', () =>
        new Promise<void>((resolve) => test_method('bind', resolve)));

    test('should handle unbind request', () =>
        new Promise<void>((resolve) => test_method('unbind', resolve)));

    test('should handle debug request', () =>
        new Promise<void>((resolve) => test_method('debug', resolve)));

    test('should handle ignore request', () =>
        new Promise<void>((resolve) => test_method('ignore', resolve)));

    test('should handle exec request', () =>
        new Promise<void>((resolve) => {
            const details = {
                sys: 'sys-A3',
                mod: 'mod',
                index: 1,
                name: 'power',
                args: [true],
            };
            const result = { test: 1 };
            const post = vi.fn().mockImplementation(async () => result);
            let promise = (ws.execute as any)(details, DELAY, post);
            expect(post).toHaveBeenCalledWith(
                {
                    id: ++count,
                    cmd: 'exec',
                    ...details,
                },
                DELAY,
            );
            expect(promise).toBeInstanceOf(Promise);
            // Test success
            promise.then((resp: HashMap) => {
                expect(resp).toEqual(result);
                post.mockImplementation(async () => {
                    throw {
                        id: 2,
                        type: 'error',
                        code: 7,
                        msg: 'test error',
                    } as PlaceResponse;
                });
                promise = (ws.execute as any)(details, DELAY, post);
                expect(post).toHaveBeenCalledWith(
                    {
                        id: ++count,
                        cmd: 'exec',
                        ...details,
                    },
                    DELAY,
                );
                // Test error
                promise.then(null).catch(() => resolve());
            });
        }));

    test('should handle notify responses', () =>
        new Promise<void>((resolve) => {
            const binding = {
                sys: 'sys-A2',
                mod: 'mod',
                index: 1,
                name: 'power',
            };
            ws.listen(binding).subscribe((value) => {
                if (value) {
                    expect(value).toBe('Yeah');
                    resolve();
                }
            });
            fake_socket.next({
                type: 'notify',
                value: 'Yeah',
                meta: binding,
            } as PlaceResponse);
        }));

    test('should reconnect the websocket', () =>
        new Promise<void>((resolve) => {
            vi.useRealTimers();
            let actions = 0;
            ws.status().subscribe((connected: boolean) => {
                if (actions === 0) {
                    actions++;
                    // Websocket connected
                    expect(connected).toBe(true);
                    fake_socket.error({
                        status: 401,
                        message: 'Invalid auth token',
                    });
                    // vi.runOnlyPendingTimers();
                } else if (actions === 1) {
                    actions++;
                    // Websocket disconnected
                    expect(connected).toBe(false);
                    // vi.runOnlyPendingTimers();
                } else if (actions === 2) {
                    actions++;
                    // Setup websocket
                    expect(connected).toBe(true);
                    resolve();
                }
                // vi.runOnlyPendingTimers();
            });
        }));

    test('should allow retrieving the current value of a binding', () =>
        new Promise<void>((resolve) => {
            const metadata = {
                sys: 'sys-A0',
                mod: 'mod',
                index: 1,
                name: 'power',
            };
            const post = vi.fn().mockImplementation(async () => null);
            expect(ws.value(metadata)).toBeUndefined();
            const promise = (ws as any).bind(metadata, DELAY, post);
            promise.then(() => {
                fake_socket.next({
                    type: 'notify',
                    value: 'Yeah',
                    meta: metadata,
                } as PlaceResponse);
                expect(ws.value(metadata)).toBe('Yeah');
                resolve();
            });
            fake_socket.next({ id: 1, type: 'success' } as PlaceResponse);
        }));

    test('should handle engine errors', () => {
        fake_socket.next({
            id: 0,
            type: 'error',
            code: 0,
            msg: 'test error',
        } as PlaceResponse);
        // fake_socket.next({ id: 1, type: 'error', code: 1, msg: 'test error' } as PlaceResponse);
        fake_socket.next({
            id: 2,
            type: 'error',
            code: 2,
            msg: 'test error',
        } as PlaceResponse);
        fake_socket.next({
            id: 3,
            type: 'error',
            code: 3,
            msg: 'test error',
        } as PlaceResponse);
        fake_socket.next({
            id: 4,
            type: 'error',
            code: 4,
            msg: 'test error',
        } as PlaceResponse);
        fake_socket.next({
            id: 5,
            type: 'error',
            code: 5,
            msg: 'test error',
        } as PlaceResponse);
        fake_socket.next({
            id: 6,
            type: 'error',
            code: 6,
            msg: 'test error',
        } as PlaceResponse);
        fake_socket.next({
            id: 7,
            type: 'error',
            code: 7,
            msg: 'test error',
        } as PlaceResponse);
        vi.advanceTimersByTime(1000);
        expect(log_spy).toBeCalledTimes(14);
    });

    test('should log error when engine message is invalid', () => {
        const message = {};
        fake_socket.next(message);
        expect(log_spy).toBeCalledWith(
            'WS',
            'Invalid websocket message',
            message,
            'error',
        );
    });

    test('should delay requests while reconnecting', () =>
        new Promise<void>((resolve) => {
            const metadata = {
                sys: 'sys-A0',
                mod: 'mod',
                index: 1,
                name: 'power',
            };
            another_fake_socket.subscribe((msg_str: string) => {
                if (msg_str !== 'ping' && typeof msg_str === 'string') {
                    const expected: HashMap = {
                        id: 1,
                        cmd: 'bind',
                        ...metadata,
                    };
                    const message: HashMap = JSON.parse(msg_str);
                    for (const key in message) {
                        if (message[key]) {
                            expect(message[key]).toBe(expected[key]);
                        }
                    }
                }
            });
            (Auth as any).token.mockReturnValue('test');
            (ws.isConnected as any).mockReturnValue(false);
            ws.bind(metadata);
            vi.advanceTimersByTime(ws.REQUEST_TIMEOUT / 2);
            (ws.isConnected as any).mockReturnValue(true);
            another_fake_socket.next({
                id: 1,
                type: 'success',
            } as PlaceResponse);
            vi.advanceTimersByTime(ws.REQUEST_TIMEOUT / 2 - 1);
            resolve();
        }));

    test('should ping the websocket every X seconds', () =>
        new Promise<void>((resolve) => {
            fake_socket.subscribe((message: any) => {
                expect(message).toBe('ping');
                resolve();
            });
            vi.runOnlyPendingTimers();
        }));

    test('should retry connecting if websocket fails to create', () => {
        // TODO
        expect(1).toBe(1);
    });

    test('should bind to mock system modules', () =>
        new Promise<void>((resolve) => {
            let checked = false;
            vi.useRealTimers();
            mock_ws.registerSystem('sys-A9', {
                Test: [
                    {
                        test: 0,
                        $testCall() {
                            return (this as any)._system.Test[0].test++;
                        },
                    },
                ],
            });
            ws.cleanupRealtime();
            vi.spyOn(Auth, 'isMock').mockReturnValue(true);
            const binding = {
                sys: 'sys-A9',
                mod: 'Test',
                index: 1,
                name: 'test',
            };
            ws.bind(binding).then(() => {
                ws.listen(binding).subscribe((value) => {
                    if (!value || checked) return;
                    expect(ws.value(binding)).toBe(value);
                    expect(ws.value(binding)).toBe(10);
                    resolve();
                    checked = true;
                });
                mock_ws.mockSystem('sys-A9').Test[0].test = 10;
            });
        }));
});
