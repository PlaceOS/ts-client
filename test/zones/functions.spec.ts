import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { of } from 'rxjs';
import * as Resources from '../../src/resources/functions';
import { PlaceTrigger } from '../../src/triggers/trigger';
import * as SERVICE from '../../src/zones/functions';
import { PlaceZone } from '../../src/zones/zone';

vi.mock('../../src/resources/functions');

describe('Zones API', () => {
    test('should allow querying zones', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) => of({ data: [_.fn!({})] } as any));
        let list = await SERVICE.queryZones().toPromise();
        expect(list).toBeTruthy();
        expect(list?.data.length).toBe(1);
        expect(list?.data[0]).toBeInstanceOf(PlaceZone);
        list = await SERVICE.queryZones({}).toPromise();
    });

    test('should allow showing zone details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.showZone('1').toPromise();
        expect(item).toBeInstanceOf(PlaceZone);
        item = await SERVICE.showZone('1', {}).toPromise();
    });

    test('should allow creating new zones', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.addZone({}).toPromise();
        expect(item).toBeInstanceOf(PlaceZone);
        item = await SERVICE.addZone({}).toPromise();
    });

    test('should allow updating zone details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.updateZone('1', {}).toPromise();
        expect(item).toBeInstanceOf(PlaceZone);
        item = await SERVICE.updateZone('1', {}, 'patch').toPromise();
    });

    test('should allow removing zones', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        let item = await SERVICE.removeZone('1').toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeZone('1', {}).toPromise();
    });

    test("should allow listing zone's triggers", async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation((_) => of(_.callback([{}])));
        let item = await SERVICE.listZoneTriggers('1').toPromise();
        expect(item).toBeTruthy();
        expect(item?.data[0]).toBeInstanceOf(PlaceTrigger);
        item = await SERVICE.listZoneTriggers('1', {}).toPromise();
    });
});
