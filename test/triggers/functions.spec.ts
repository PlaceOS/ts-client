import { of } from 'rxjs';
import { describe, expect, test, vi } from 'vitest';

import { PlaceTrigger } from '../../src/triggers/trigger';

import * as Resources from '../../src/resources/functions';
import * as SERVICE from '../../src/triggers/functions';

describe('Triggers API', () => {
    test('should allow querying triggers', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) => of({ data: [_.fn!({})] } as any));
        const list = await SERVICE.queryTriggers().toPromise();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceTrigger);
    });

    test('should allow showing trigger details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        const item = await SERVICE.showTrigger('1').toPromise();
        expect(item).toBeInstanceOf(PlaceTrigger);
    });

    test('should allow creating new triggers', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        const item = await SERVICE.addTrigger({}).toPromise();
        expect(item).toBeInstanceOf(PlaceTrigger);
    });

    test('should allow updating trigger details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        const item = await SERVICE.updateTrigger('1', {}).toPromise();
        expect(item).toBeInstanceOf(PlaceTrigger);
    });

    test('should allow removing triggers', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        const item = await SERVICE.removeTrigger('1', {}).toPromise();
        expect(item).toBeFalsy();
    });

    test("should allow listing trigger's instances", async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation((_: any) => of(_.callback([{}]) as any));
        const item = await SERVICE.listTriggerInstances('1').toPromise();
        expect(item[0]).toBeInstanceOf(PlaceTrigger);
    });
});
