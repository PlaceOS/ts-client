import { describe, expect, test, vi } from 'vitest';
import * as Auth from '../../src/auth/functions';
import * as Http from '../../src/http/functions';
import * as SERVICE from '../../src/organisations/functions';
import { PlaceOrganisation } from '../../src/organisations/organisation';
import { PlacePartner } from '../../src/partners/partner';
import * as Resources from '../../src/resources/functions';

describe('Organisations API', () => {
    test('should allow querying organisations', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        const list = await SERVICE.queryOrganisations({ partner_id: 'p' });
        expect(list.data[0]).toBeInstanceOf(PlaceOrganisation);
        expect(spy.mock.calls[0][0].query_params).toEqual({ partner_id: 'p' });
    });

    test('should allow showing organisation details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.showOrganisation('1');
        expect(item).toBeInstanceOf(PlaceOrganisation);
    });

    test('should pass payer and partner staff as query parameters on create', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.addOrganisation(
            { name: 'NTT staff' },
            { payer: 'partner', partner_staff: true },
        );
        expect(item).toBeInstanceOf(PlaceOrganisation);
        expect(spy.mock.calls[0][0].query_params).toEqual({
            payer: 'partner',
            partner_staff: true,
        });
    });

    test('should allow updating organisation details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.updateOrganisation('1', {}, { payer: 'organisation' });
        expect(item).toBeInstanceOf(PlaceOrganisation);
        expect(spy.mock.calls[0][0].query_params).toEqual({ payer: 'organisation' });
    });

    test('should allow removing organisations', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeOrganisation('1');
        expect(item).toBeFalsy();
    });

    test('should resolve the current reach', async () => {
        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        const httpSpy = vi.spyOn(Http, 'get');
        httpSpy.mockImplementation(
            () =>
                Promise.resolve({
                    reach: 'partner',
                    enforcing: true,
                    organisation: { id: 'org-ntt', name: 'NTT' },
                    partner: { id: 'partner-ntt', name: 'NTT' },
                    organisations: [{ id: 'org-ntt' }, { id: 'org-acadian' }],
                }) as any,
        );
        const reach = await SERVICE.currentReach();
        expect(httpSpy).toHaveBeenCalledWith('/api/engine/v2/organisations/current');
        expect(reach.reach).toBe('partner');
        expect(reach.enforcing).toBe(true);
        expect(reach.organisation).toBeInstanceOf(PlaceOrganisation);
        expect(reach.partner).toBeInstanceOf(PlacePartner);
        expect(reach.organisations?.map((o) => o.id)).toEqual(['org-ntt', 'org-acadian']);
    });

    test('should report cluster reach with no organisation list', async () => {
        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        vi.spyOn(Http, 'get').mockImplementation(
            () => Promise.resolve({ reach: 'cluster', enforcing: false }) as any,
        );
        const reach = await SERVICE.currentReach();
        expect(reach.reach).toBe('cluster');
        expect(reach.organisation).toBeNull();
        expect(reach.organisations).toBeNull();
    });

    test('should claim zone trees for an organisation', async () => {
        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        const postSpy = vi.spyOn(Http, 'post');
        postSpy.mockImplementation(
            () => Promise.resolve({ zones: 3, systems: 2, modules: 4, triggers: 0 }) as any,
        );
        const result = await SERVICE.claimZonesForOrganisation('org-1', ['zone-a']);
        expect(postSpy).toHaveBeenCalledWith('/api/engine/v2/organisations/org-1/claim', {
            zone_ids: ['zone-a'],
        });
        expect(result.zones).toBe(3);
    });
});
