import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { getModule, getSystem } from '../../src/realtime/binding';
import { PlaceModuleBinding } from '../../src/realtime/module';
import { PlaceSystemBinding } from '../../src/realtime/system';

describe('PlaceBindingService', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('should allow getting systems', () => {
        const system = getSystem('sys-A0');
        expect(system).toBeInstanceOf(PlaceSystemBinding);
        expect(system.id).toBe('sys-A0');
    });

    test('should allow getting modules', () => {
        const module = getModule('sys-A0', 'Test');
        expect(module).toBeInstanceOf(PlaceModuleBinding);
        expect(module.id).toBe('Test_1');
        expect(module.name).toBe('Test');
        expect(module.index).toBe(1);
    });
});
