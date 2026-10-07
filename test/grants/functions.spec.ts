import { describe, expect, test, vi } from 'vitest';
import * as SERVICE from '../../src/grants/functions';
import { PlaceGrant } from '../../src/grants/grant';
import * as Resources from '../../src/resources/functions';

describe('Grants API', () => {
    test('should allow querying grants by scope or user', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        const list = await SERVICE.queryGrants({ scope_type: 'organisation', scope_id: 'org-1' });
        expect(list.data[0]).toBeInstanceOf(PlaceGrant);
        expect(spy.mock.calls[0][0].query_params).toEqual({ scope_type: 'organisation', scope_id: 'org-1' });
    });

    test('should allow issuing, showing and revoking grants', async () => {
        const createSpy = vi.spyOn(Resources, 'create');
        createSpy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        vi.spyOn(Resources, 'show').mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        vi.spyOn(Resources, 'remove').mockImplementation(() => Promise.resolve());
        const payload = { user_id: 'user-1', scope_type: 'organisation' as const, scope_id: 'org-1', permissions: 1 };
        expect(await SERVICE.addGrant(payload)).toBeInstanceOf(PlaceGrant);
        expect(createSpy.mock.calls[0][0].form_data).toEqual(payload);
        expect(await SERVICE.showGrant('1')).toBeInstanceOf(PlaceGrant);
        expect(await SERVICE.removeGrant('1')).toBeFalsy();
    });
});
