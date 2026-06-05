import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { PlaceVariableBinding } from '../../src/realtime/status-variable';
import { WritableSignal, createSignal } from '../../src/utilities/signal';

import * as ws from '../../src/realtime/functions';

vi.mock('../../src/realtime/functions');

describe('PlaceVariableBinding', () => {
    let status: PlaceVariableBinding;
    let fake_module: any;
    let fake_system: any;
    let state_subject: WritableSignal<boolean>;
    let status_value: WritableSignal<number | undefined>;

    beforeEach(() => {
        vi.useFakeTimers();
        state_subject = createSignal<boolean>(false);
        status_value = createSignal<number | undefined>(undefined);
        (ws as any).status.mockImplementation(() => state_subject.asReadonly());
        (ws as any).bind.mockImplementation((_: any) => Promise.resolve());
        (ws as any).unbind.mockImplementation((_: any) => Promise.resolve());
        (ws as any).listen.mockImplementation(() => status_value.asReadonly());
        (ws as any).value.mockImplementation((_: any) => status_value.value);
        fake_system = { id: 'sys-A0' };
        fake_module = { system: fake_system, name: 'Test', index: 1 };
        status = new PlaceVariableBinding(fake_module, 'test');
    });

    afterEach(() => {
        (ws.bind as any).mockRestore();
        vi.useRealTimers();
    });

    test('should create an instance', () => {
        expect(status).toBeTruthy();
    });

    test('should expose it name', () => {
        expect(status.name).toBe('test');
    });

    test('should bind to the status variable', () =>
        new Promise<void>((resolve) => {
            vi.useRealTimers();
            const unbind = status.bind();
            expect(unbind).toBeInstanceOf(Function);
            expect(ws.bind).toBeCalled();
            setTimeout(() => {
                expect(status.count).toBe(1);
                resolve();
            });
        }));

    test('should unbind to the status variable', () =>
        new Promise<void>((resolve) => {
            vi.useRealTimers();
            status.bind();
            const unbind = status.bind();
            setTimeout(() => {
                expect(status.count).toBe(2);
                unbind();
                setTimeout(() => {
                    expect(status.count).toBe(1);
                    status.unbind();
                    setTimeout(() => {
                        expect(status.count).toBe(0);
                        expect(ws.unbind).toBeCalledTimes(1);
                        // Check that the binding count doesn't go below 0
                        status.unbind();
                        setTimeout(() => {
                            expect(status.count).toBe(0);
                            resolve();
                        });
                    });
                });
            });
        }));

    test('should expose the binding value', () => {
        expect(status.value).toBeUndefined();
        status_value.set(10);
        expect(status.value).toBe(10);
    });

    test('should allow for subscribing to the binding value', () =>
        new Promise<void>((resolve) => {
            status.listen().subscribe((value: any) => {
                if (value) {
                    expect(value).toBe(10);
                    resolve();
                }
            });
            status_value.set(10);
        }));

    test('should rebind to bindings on websocket reconnect', () =>
        new Promise<void>((resolve) => {
            vi.useRealTimers();
            state_subject.set(true);
            state_subject.set(false);
            setTimeout(() => {
                expect(ws.bind).not.toBeCalled();
                status.bind();
                setTimeout(() => {
                    state_subject.set(false);
                    state_subject.set(true);
                    setTimeout(() => {
                        expect(ws.bind).toBeCalled();
                        resolve();
                    });
                });
            });
        }));
});
