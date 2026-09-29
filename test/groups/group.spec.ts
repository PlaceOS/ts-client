import { describe, expect, test } from 'vitest';
import { PlaceGroupUser } from '../../src/group-users/group-user';
import { PlaceGroup } from '../../src/groups/group';

describe('PlaceGroup', () => {
    test('should expose default permissions and AD group mappings', () => {
        const group = new PlaceGroup({
            default_permissions: 5,
            ad_group_mappings: { 'ad-1': ['Staff', 1] },
        });
        expect(group.default_permissions).toBe(5);
        expect(group.ad_group_mappings).toEqual({ 'ad-1': ['Staff', 1] });
    });

    test('should default new fields when missing', () => {
        const group = new PlaceGroup();
        expect(group.default_permissions).toBe(0);
        expect(group.ad_group_mappings).toEqual({});
    });
});

describe('PlaceGroupUser', () => {
    test('should expose the AD group that added the membership', () => {
        expect(
            new PlaceGroupUser({ auto_assigned: 'ad-1' }).auto_assigned,
        ).toBe('ad-1');
        expect(new PlaceGroupUser().auto_assigned).toBe('');
    });
});
