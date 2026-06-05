import { describe, expect, test, vi } from 'vitest';
import * as Auth from '../../src/auth/functions';
import * as Resources from '../../src/resources/functions';
import { PlaceSettings } from '../../src/settings/settings';
import * as SERVICE from '../../src/systems/functions';
import { PlaceSystem } from '../../src/systems/system';
import { PlaceTrigger } from '../../src/triggers/trigger';
import { PlaceZone } from '../../src/zones/zone';

vi.mock('../../src/resources/functions');

describe('Systems API', () => {
    test('should allow querying systems', async () => {
        (Resources.query as any) = vi
            .fn()
            .mockImplementation((_) => Promise.resolve({ data: [_.fn({})] }));
        let list = await SERVICE.querySystems();
        expect(list).toBeTruthy();
        expect(list?.data.length).toBe(1);
        expect(list?.data[0]).toBeInstanceOf(PlaceSystem);
        list = await SERVICE.querySystems({});
    });

    test('should allow showing system details', async () => {
        (Resources.show as any) = vi
            .fn()
            .mockImplementation((_) => Promise.resolve(_.fn({})));
        let item = await SERVICE.showSystem('1');
        expect(item).toBeInstanceOf(PlaceSystem);
        item = await SERVICE.showSystem('1', {});
    });

    test('should allow creating new systems', async () => {
        (Resources.create as any) = vi
            .fn()
            .mockImplementation((_) => Promise.resolve(_.fn({}) as any));
        let item = await SERVICE.addSystem({});
        expect(item).toBeInstanceOf(PlaceSystem);
        item = await SERVICE.addSystem({});
    });

    test('should allow updating system details', async () => {
        (Resources.update as any) = vi
            .fn()
            .mockImplementation((_) => Promise.resolve(_.fn({})));
        let item = await SERVICE.updateSystem('1', {});
        expect(item).toBeInstanceOf(PlaceSystem);
        item = await SERVICE.updateSystem('1', {}, 'patch');
    });

    test('should allow removing systems', async () => {
        (Resources.remove as any) = vi
            .fn()
            .mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeSystem('1');
        expect(item).toBeFalsy();
    });

    test('should allow adding a module to a system', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation(() => Promise.resolve());
        let item = await SERVICE.addSystemModule('1', 'mod-1');
        expect(item).toBeFalsy();
        item = await SERVICE.addSystemModule('1', 'mod-1', {});
    });

    test('should allow removing a module from a system', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeSystemModule('1', 'mod-1');
        expect(item).toBeFalsy();
    });

    test('should allow starting a system', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation(() => Promise.resolve());
        const item = await SERVICE.startSystem('1');
        expect(item).toBeFalsy();
    });

    test('should allow stopping a system', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation(() => Promise.resolve());
        const item = await SERVICE.stopSystem('1');
        expect(item).toBeFalsy();
    });

    test('should allow excuting a method on a system', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation(() => Promise.resolve({}));
        let item = await SERVICE.executeOnSystem('1', 'test', 'mod');
        expect(item).toEqual({});
        item = await SERVICE.executeOnSystem('1', 'test', 'mod', 2, ['Yeah']);
    });

    test('should allow gettings state of a system module', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation(() => Promise.resolve({}));
        let item = await SERVICE.systemModuleState('1', 'mod');
        expect(item).toEqual({});
        item = await SERVICE.systemModuleState('1', 'mod', 2);
    });

    test('should allow lookup state of a system module', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation(() => Promise.resolve({}));
        let item = await SERVICE.lookupSystemModuleState(
            '1',
            'mod',
            1,
            'connected',
        );
        expect(item).toEqual({});
        item = await SERVICE.lookupSystemModuleState(
            '1',
            'mod',
            undefined,
            'connected',
        );
    });

    test('should allow listing methods for system module', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation(() => Promise.resolve({}));
        let item = await SERVICE.functionList('1', 'mod');
        expect(item).toEqual({});
        item = await SERVICE.functionList('1', 'mod', 3);
    });

    test('should allow getting module count', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation(() => Promise.resolve({}));
        const item = await SERVICE.moduleCount('1', 'mod');
        expect(item).toEqual({});
    });

    test('should allow getting types of modules in a syste', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation(() => Promise.resolve({}));
        const item = await SERVICE.moduleTypes('1');
        expect(item).toEqual({});
    });

    test("should allow listing system's zones", async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation((_) => Promise.resolve(_.callback([{}])));
        const item = await SERVICE.listSystemZones('1');
        expect(item).toBeTruthy();
        expect(item?.data[0]).toBeInstanceOf(PlaceZone);
    });

    test("should allow listing system's triggers", async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation((_) => Promise.resolve(_.callback([{}])));
        const item = await SERVICE.listSystemTriggers('1');
        expect(item).toBeTruthy();
        expect(item?.data[0]).toBeInstanceOf(PlaceTrigger);
    });

    test('should allow adding a trigger to a system', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation((_) => Promise.resolve(_.callback({})));
        const item = await SERVICE.addSystemTrigger('1', {});
        expect(item).toBeTruthy();
        expect(item).toBeInstanceOf(PlaceTrigger);
    });

    test('should allow removing a trigger from a system', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeSystemTrigger('1', 'trig-1');
        expect(item).toBeFalsy();
    });

    test('should allow listing settings for a system', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation((_) => Promise.resolve(_.callback([{}])));
        const item = await SERVICE.systemSettings('1');
        expect(item).toBeTruthy();
        expect(item?.[0]).toBeInstanceOf(PlaceSettings);
    });

    test('should generate correct system control websocket URL for HTTPS', () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('https://example.com/api/engine/v2/');

        const url = SERVICE.systemControlUrl();
        expect(url).toBe('wss://example.com/api/engine/v2/systems/control');
    });

    test('should generate correct system control websocket URL for HTTP', () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('http://example.com/api/engine/v2/');

        const url = SERVICE.systemControlUrl();
        expect(url).toBe('ws://example.com/api/engine/v2/systems/control');
    });

    test('should include fixed_device in system control URL', () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('https://example.com/api/engine/v2/');

        const url = SERVICE.systemControlUrl({ fixed_device: true });
        expect(url).toBe(
            'wss://example.com/api/engine/v2/systems/control?fixed_device=true',
        );
    });

    test('should allow getting system metadata', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation(() => Promise.resolve({ key: 'value' }));
        let item = await SERVICE.systemMetadata('1');
        expect(item).toEqual({ key: 'value' });
        item = await SERVICE.systemMetadata('1', { name: 'test' });
    });

    test('should allow showing a system trigger', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation((_) => Promise.resolve(_.callback({})));
        let item = await SERVICE.showSystemTrigger('sys-1', 'trig-1');
        expect(item).toBeTruthy();
        expect(item).toBeInstanceOf(PlaceTrigger);
        item = await SERVICE.showSystemTrigger('sys-1', 'trig-1', {
            complete: true,
        });
    });

    test('should allow updating a system trigger', async () => {
        (Resources.task as any) = vi
            .fn()
            .mockImplementation((_) => Promise.resolve(_.callback({})));
        let item = await SERVICE.updateSystemTrigger('sys-1', 'trig-1', {});
        expect(item).toBeTruthy();
        expect(item).toBeInstanceOf(PlaceTrigger);
        item = await SERVICE.updateSystemTrigger('sys-1', 'trig-1', {}, 'put');
    });
});
