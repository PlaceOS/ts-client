import { beforeEach, describe, expect, test } from 'vitest';
import { MockPlaceWebsocketModule } from '../../src/realtime/mock-module';

class TestModule {
    public value = 0;
    $testFn() {
        this.value++;
    }
}

describe('MockPlaceWebsocketModule', () => {
    let module: MockPlaceWebsocketModule;
    let test_mod: MockPlaceWebsocketModule;
    const system = {
        Bookings: [
            {
                test: 10,
                $namespaceTest: 99,
                namespaceTestFn: () => 1,
                $method: () => 10,
                $methodWithOneArg: (arg1: number) => arg1 + 1,
                $methodWithTwoArgs: (arg1: number, arg2: number) => arg1 + arg2,
                $updateOtherModule() {
                    return (this as any)._system.Other[0].test--;
                },
            },
        ],
        Test: [new TestModule()],
        Other: [
            {
                test: 20,
            },
        ],
    };

    beforeEach(() => {
        module = new MockPlaceWebsocketModule(
            system as any,
            system.Bookings[0],
        );
        test_mod = new MockPlaceWebsocketModule(system as any, system.Test[0]);
    });

    test('should create an instance', () => {
        expect(module).toBeTruthy();
        expect(test_mod).toBeTruthy();
    });

    test('should allow getting binding values', () => {
        expect(module.test).toBe(10);
    });

    test('should allow setting binding values', () => {
        expect(module.test).toBe(10);
        module.test = 20;
        expect(module.test).toBe(20);
    });

    test('should allow listening to binding values', () =>
        new Promise<void>((resolve) => {
            let test_count = 0;
            module.listen('test').subscribe((value: any) => {
                if (test_count === 0) {
                    expect(value).toBe(10);
                    test_count++;
                } else if (test_count === 1) {
                    expect(value).toBe(20);
                    resolve();
                }
            });
            setTimeout(() => (module.test = 20));
        }));

    test('should allow listening to non-predefined binding values', () =>
        new Promise<void>((resolve) => {
            let test_count = 0;
            module.listen('other_test').subscribe((value: any) => {
                if (test_count === 0) {
                    expect(value).toBe(null);
                    test_count++;
                } else if (test_count === 1) {
                    expect(value).toBe(20);
                    resolve();
                }
            });
            setTimeout(() => (module.other_test = 20));
        }));

    test('should allow for executing methods', () => {
        expect(module.call('method')).toBe(10);
        expect(module.call('methodWithOneArg', [10])).toBe(11);
        expect(module.call('methodWithTwoArgs', [10, 11])).toBe(21);
        expect(module.call('falseFn')).toBe(null);
    });

    test('should remove namespace from value bindings', () => {
        expect(module.namespaceTest).toBe(99);
    });

    test('should namespace executable methods', () => {
        expect(module.namespaceTestFn).toBeUndefined();
        expect(module.call('namespaceTestFn')).toBe(1);
    });

    test('should allow for access to parent system', () => {
        expect(module.call('updateOtherModule')).toBe(20);
        expect(system.Other[0].test).toBe(19);
    });
});
