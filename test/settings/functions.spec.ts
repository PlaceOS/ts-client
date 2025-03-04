import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { of } from 'rxjs';

import * as Resources from '../../src/resources/functions';
import * as SERVICE from '../../src/settings/functions';
import { PlaceSettings } from '../../src/settings/settings';

describe('Settings API', () => {
    test('should allow querying settings', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) => of({ data: [_.fn!({})] } as any));
        const list = await SERVICE.querySettings().toPromise();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceSettings);
    });

    test('should allow showing settings details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.showSettings('1').toPromise();
        expect(item).toBeInstanceOf(PlaceSettings);
        item = await SERVICE.showSettings('1', {}).toPromise();
    });

    test('should allow creating new settings', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.addSettings({}).toPromise();
        expect(item).toBeInstanceOf(PlaceSettings);
        item = await SERVICE.addSettings({}, {}).toPromise();
    });

    test('should allow updating settings details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.updateSettings('1', {}).toPromise();
        expect(item).toBeInstanceOf(PlaceSettings);
        item = await SERVICE.updateSettings('1', {}, {}, 'patch').toPromise();
    });

    test('should allow removing settings', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        let item = await SERVICE.removeSettings('1', {}).toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeSettings('1').toPromise();
    });

    test('should allow getting settings history', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation((_: any) => of(_.callback([{}]) as any));
        let item = await SERVICE.settingsHistory('1', {}).toPromise();
        expect(item).toBeInstanceOf(Array);
        item = await SERVICE.settingsHistory('1').toPromise();
    });
});
