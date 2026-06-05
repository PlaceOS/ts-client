import { describe, expect, test, vi } from 'vitest';
import * as SERVICE from '../../src/modules/functions';
import { PlaceModule } from '../../src/modules/module';
import * as Resources from '../../src/resources/functions';
import { PlaceSettings } from '../../src/settings/settings';

describe('Modules API', () => {
    test('should allow querying modules', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        let list = await SERVICE.queryModules();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceModule);
        list = await SERVICE.queryModules({});
    });

    test('should allow showing module details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.showModule('1');
        expect(item).toBeInstanceOf(PlaceModule);
        item = await SERVICE.showModule('1', {});
    });

    test('should allow creating new modules', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.addModule({});
        expect(item).toBeInstanceOf(PlaceModule);
        item = await SERVICE.addModule({});
    });

    test('should allow updating module details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateModule('1', {});
        expect(item).toBeInstanceOf(PlaceModule);
        item = await SERVICE.updateModule('1', {}, 'patch');
    });

    test('should allow removing modules', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeModule('1');
        expect(item).toBeFalsy();
    });

    test('should allow starting a module', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation(() => Promise.resolve());
        const item = await SERVICE.startModule('1');
        expect(item).toBeFalsy();
    });

    test('should allow stopping a module', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation(() => Promise.resolve());
        const item = await SERVICE.stopModule('1');
        expect(item).toBeFalsy();
    });

    test('should allow pinging a module', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation(() =>
            Promise.resolve({ host: '', pingable: false }),
        );
        const item = await SERVICE.pingModule('1');
        expect(item).toBeTruthy();
    });

    test('should allow getting state of a module', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation(() => Promise.resolve({}));
        const item = await SERVICE.moduleState('1');
        expect(item).toBeTruthy();
    });

    test('should allow lookup of module state', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation(() => Promise.resolve({}));
        const item = await SERVICE.lookupModuleState('1', 'connected');
        expect(item).toBeTruthy();
    });

    test('should allow loading module', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation(() => Promise.resolve({}));
        const item = await SERVICE.loadModule('1');
        expect(item).toBeTruthy();
    });

    test('should allow settings for a module', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation((_: any) =>
            Promise.resolve(_.callback([{}]) as any),
        );
        const item = await SERVICE.moduleSettings('1');
        expect(item).toBeTruthy();
        expect(item[0]).toBeInstanceOf(PlaceSettings);
    });

    test('should allow executing a method on a module', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation(() => Promise.resolve({ result: 'success' }));
        let item = await SERVICE.executeOnModule('1', 'test_method');
        expect(item).toEqual({ result: 'success' });
        item = await SERVICE.executeOnModule('1', 'test_method', [
            'arg1',
            'arg2',
        ]);
    });
});
