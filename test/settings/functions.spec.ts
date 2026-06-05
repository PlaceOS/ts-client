import { describe, expect, test, vi } from 'vitest';

import * as Resources from '../../src/resources/functions';
import * as SERVICE from '../../src/settings/functions';
import { PlaceSettings } from '../../src/settings/settings';

describe('Settings API', () => {
    test('should allow querying settings', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        const list = await SERVICE.querySettings();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceSettings);
    });

    test('should allow showing settings details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.showSettings('1');
        expect(item).toBeInstanceOf(PlaceSettings);
    });

    test('should allow creating new settings', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.addSettings({});
        expect(item).toBeInstanceOf(PlaceSettings);
        item = await SERVICE.addSettings({}, {});
    });

    test('should allow updating settings details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateSettings('1', {});
        expect(item).toBeInstanceOf(PlaceSettings);
        item = await SERVICE.updateSettings('1', {}, {}, 'patch');
    });

    test('should allow removing settings', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeSettings('1');
        expect(item).toBeFalsy();
    });

    test('should allow getting settings history', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation((_: any) =>
            Promise.resolve(_.callback([{}]) as any),
        );
        let item = await SERVICE.settingsHistory('1', {});
        expect(item).toBeInstanceOf(Array);
        item = await SERVICE.settingsHistory('1');
    });
});
