import { beforeEach, describe, expect, test } from 'vitest';
import { PlaceOrganisation } from '../../src/organisations/organisation';

describe('PlaceOrganisation', () => {
    let organisation: PlaceOrganisation;

    beforeEach(() => {
        organisation = new PlaceOrganisation({
            id: 'org-test',
            name: 'Acadian',
            description: 'NTT client',
            partner_id: 'partner-ntt',
            payer: 'partner',
            partner_staff: false,
            config: { region: 'us' },
        });
    });

    test('should create instance', () => {
        expect(organisation).toBeInstanceOf(PlaceOrganisation);
    });

    test('should expose ownership fields', () => {
        expect(organisation.partner_id).toBe('partner-ntt');
        expect(organisation.payer).toBe('partner');
        expect(organisation.partner_staff).toBe(false);
        expect(organisation.config).toEqual({ region: 'us' });
    });

    test('should default to self managed', () => {
        const direct = new PlaceOrganisation({ name: 'UCLA' });
        expect(direct.partner_id).toBe('');
        expect(direct.payer).toBe('organisation');
        expect(direct.partner_staff).toBe(false);
    });
});
