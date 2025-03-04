import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { PlaceModuleBinding } from '../../src/realtime/module';
import { PlaceSystemBinding } from '../../src/realtime/system';

describe('PlaceSystemBinding', () => {
    let system: PlaceSystemBinding;

    beforeEach(() => {
        vi.useFakeTimers();
        system = new PlaceSystemBinding('sys-A0');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('should create an instance', () => {
        expect(system).toBeTruthy();
    });

    test('should have an ID', () => {
        expect(system.id).toBe('sys-A0');
    });

    test('should return modules', () => {
        expect(() => system.module('')).toThrow();
        const test = system.module('Test');
        expect(test).toBeInstanceOf(PlaceModuleBinding);
        expect(test).toBe(system.module('Test'));
        expect(test).toBe(system.module('Test_1'));
        expect(test).toBe(system.module('Test', -1));
        expect(test).not.toBe(system.module('Test', 2));
    });
});
