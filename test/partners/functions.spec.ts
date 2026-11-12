import { describe, expect, test, vi } from 'vitest';
import * as SERVICE from '../../src/partners/functions';
import { PlacePartner } from '../../src/partners/partner';
import * as Resources from '../../src/resources/functions';

describe('Partners API', () => {
    test('should allow querying partners', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        const list = await SERVICE.queryPartners();
        expect(list.data[0]).toBeInstanceOf(PlacePartner);
    });

    test('should allow showing, creating, updating and removing partners', async () => {
        vi.spyOn(Resources, 'show').mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        vi.spyOn(Resources, 'create').mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        vi.spyOn(Resources, 'update').mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        vi.spyOn(Resources, 'remove').mockImplementation(() => Promise.resolve());
        expect(await SERVICE.showPartner('1')).toBeInstanceOf(PlacePartner);
        expect(await SERVICE.addPartner({ name: 'NTT' })).toBeInstanceOf(PlacePartner);
        expect(await SERVICE.updatePartner('1', {})).toBeInstanceOf(PlacePartner);
        expect(await SERVICE.removePartner('1')).toBeFalsy();
    });
});
