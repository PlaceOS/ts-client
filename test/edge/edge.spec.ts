import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { PlaceEdge } from '../../src/edge/edge';

describe('PlaceEdge', () => {
    let edge: PlaceEdge;

    beforeEach(() => {
        edge = new PlaceEdge({
            id: 'dep-test',
            name: 'Test',
            description: 'A Description',
            created_at: 999,
        });
    });

    test('should create instance', () => {
        expect(edge).toBeTruthy();
        expect(edge).toBeInstanceOf(PlaceEdge);
    });

    test('should expose properties', () => {
        expect(edge.name).toBe('Test');
        expect(edge.description).toBe('A Description');
    });
});
