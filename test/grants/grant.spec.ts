import { describe, expect, test } from 'vitest';
import { PlaceGrant } from '../../src/grants/grant';

describe('PlaceGrant', () => {
    test('should expose fields with defaults', () => {
        const grant = new PlaceGrant({
            id: 'grant-1',
            user_id: 'user-1',
            scope_type: 'partner',
            scope_id: 'partner-1',
            permissions: 3,
            expires_at: '2026-12-01T00:00:00Z',
            granted_by: 'user-2',
        });
        expect(grant).toBeInstanceOf(PlaceGrant);
        expect(grant.scope_type).toBe('partner');
        expect(grant.permissions).toBe(3);
        expect(new PlaceGrant().scope_type).toBe('organisation');
        expect(new PlaceGrant().permissions).toBe(0);
    });
});
