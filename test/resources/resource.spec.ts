import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PlaceResource } from '../../src/resources/resource';

class Resource extends PlaceResource {}

describe('PlaceResource', () => {
    let resource: Resource;
    let service: any;

    beforeEach(() => {
        service = {
            add: vi.fn(),
            delete: vi.fn(),
            update: vi.fn(),
        };
        service.add.mockReturnValue(Promise.resolve());
        service.delete.mockReturnValue(Promise.resolve());
        service.update.mockReturnValue(Promise.resolve());
        resource = new Resource({
            id: 'test',
            name: 'Test',
            created_at: 999,
            updated_at: 999,
        });
    });

    test('should expose id', () => {
        expect(resource.id).toBe('test');
    });

    test('should expose name', () => {
        expect(resource.name).toBe('Test');
    });

    test('should expose creation time', () => {
        expect(resource.created_at).toEqual(999);
    });

    test('should expose updated time', () => {
        expect(resource.updated_at).toEqual(999);
    });
});
