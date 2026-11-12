import { describe, expect, test } from 'vitest';
import { PlacePartner } from '../../src/partners/partner';

describe('PlacePartner', () => {
    test('should expose fields with defaults', () => {
        const partner = new PlacePartner({ id: 'partner-1', name: 'NTT', management: true });
        expect(partner).toBeInstanceOf(PlacePartner);
        expect(partner.management).toBe(true);
        expect(partner.parent_id).toBe('');
        expect(partner.config).toEqual({});
        expect(new PlacePartner().management).toBe(false);
    });
});
