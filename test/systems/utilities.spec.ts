import { describe, expect, test } from 'vitest';
import { generateMockSystem } from '../../src/systems/utilities';

describe('System Utilities', () => {
    describe('generateMockSystem', () => {
        test('should create a randomly generated mock system', () => {
            let system = generateMockSystem();
            expect(system).toBeInstanceOf(Object);
            system = generateMockSystem('test');
            expect(system).toBeInstanceOf(Object);
        });
        test('should allow for overriding fields', () => {
            const system = generateMockSystem({ id: 'test' });
            expect(system).toBeInstanceOf(Object);
            expect(system.id).toBe('test');
        });
    });
});
