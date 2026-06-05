import { describe, expect, test, vi } from 'vitest';
import * as SERVICE from '../../src/metadata/functions';
import { PlaceMetadata } from '../../src/metadata/metadata';
import { PlaceZoneMetadata } from '../../src/metadata/zone-metadata';
import * as Resources from '../../src/resources/functions';

describe('Applications API', () => {
    test('should allow listing metadata', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!([{}]) as any));
        const item = await SERVICE.listMetadata('1');
        expect(item[0]).toBeInstanceOf(PlaceMetadata);
    });

    test('should allow getting metadata', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.showMetadata('1', 'test');
        expect(item).toBeInstanceOf(PlaceMetadata);
    });

    test('should allow creating new metadata', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.addMetadata({});
        expect(item).toBeInstanceOf(PlaceMetadata);
        item = await SERVICE.addMetadata({});
    });

    test('should allow updating metadata details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateMetadata('1', {});
        expect(item).toBeInstanceOf(PlaceMetadata);
        item = await SERVICE.updateMetadata('1', {}, 'patch');
    });

    test('should allow removing metadata', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeMetadata('1', {
            name: 'test',
        });
        expect(item).toBeFalsy();
    });

    test('should allow listing child zone metadata', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation((_: any) =>
            Promise.resolve(_.callback([{ metadata: {} }]) as any),
        );
        const item = await SERVICE.listChildMetadata('1', {});
        expect(item[0]).toBeInstanceOf(PlaceZoneMetadata);
    });
});
