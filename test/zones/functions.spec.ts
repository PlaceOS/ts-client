import { describe, expect, test, vi } from 'vitest';
import * as Resources from '../../src/resources/functions';
import { PlaceTrigger } from '../../src/triggers/trigger';
import * as SERVICE from '../../src/zones/functions';
import { PlaceZone } from '../../src/zones/zone';

vi.mock('../../src/resources/functions');

describe('Zones API', () => {
    test('should allow querying zones', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        let list = await SERVICE.queryZones();
        expect(list).toBeTruthy();
        expect(list?.data.length).toBe(1);
        expect(list?.data[0]).toBeInstanceOf(PlaceZone);
        list = await SERVICE.queryZones({});
    });

    test('should allow showing zone details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.showZone('1');
        expect(item).toBeInstanceOf(PlaceZone);
        item = await SERVICE.showZone('1', {});
    });

    test('should allow creating new zones', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.addZone({});
        expect(item).toBeInstanceOf(PlaceZone);
        item = await SERVICE.addZone({});
    });

    test('should allow updating zone details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateZone('1', {});
        expect(item).toBeInstanceOf(PlaceZone);
        item = await SERVICE.updateZone('1', {}, 'patch');
    });

    test('should allow removing zones', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeZone('1');
        expect(item).toBeFalsy();
    });

    test("should allow listing zone's triggers", async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation((_) => Promise.resolve(_.callback([{}])));
        let item = await SERVICE.listZoneTriggers('1');
        expect(item).toBeTruthy();
        expect(item?.data[0]).toBeInstanceOf(PlaceTrigger);
        item = await SERVICE.listZoneTriggers('1', {});
    });

    test('should allow getting zone metadata', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation(() => Promise.resolve({ key: 'value' }));
        let item = await SERVICE.zoneMetadata('1');
        expect(item).toEqual({ key: 'value' });
        item = await SERVICE.zoneMetadata('1', { name: 'test' });
    });
});
