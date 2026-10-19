import { describe, expect, test } from 'vitest';

import { PlaceHistory } from '../../src/history/history';

describe('PlaceHistory', () => {
    test('should expose the change details', () => {
        const entry = new PlaceHistory({
            id: 'h-1',
            resource_type: 'zone',
            resource_id: 'zone-1',
            correlation_id: 'group-1',
            action: 'update',
            changed_fields: ['name'],
            diff: { name: ['old', 'new'] },
            user_id: 'user-1',
            user_email: 'user@place.tech',
            context: { app_name: 'backoffice', ip: '10.0.0.1' },
            created_at: 1729382400,
        });
        expect(entry.resource_type).toBe('zone');
        expect(entry.diff.name).toEqual(['old', 'new']);
        expect(entry.context.app_name).toBe('backoffice');
        expect(entry.snapshot).toBeNull();
        expect(entry.created_at).toBe(1729382400);
    });

    test('should default missing fields', () => {
        const entry = new PlaceHistory();
        expect(entry.id).toBe('');
        expect(entry.changed_fields).toEqual([]);
        expect(entry.diff).toEqual({});
        expect(entry.context).toEqual({});
        expect(entry.created_at).toBe(0);
    });
});
