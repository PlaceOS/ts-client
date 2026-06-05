import { describe, expect, test, vi } from 'vitest';
import * as Resources from '../../src/resources/functions';
import * as SERVICE from '../../src/storages/functions';
import { PlaceStorage } from '../../src/storages/storage.class';

describe('Storages API', () => {
    test('should allow querying storages', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        let list = await SERVICE.queryStorages();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceStorage);
        list = await SERVICE.queryStorages({});
    });

    test('should allow querying storages with auth_id', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        const list = await SERVICE.queryStorages({
            auth_id: 'auth-123',
        });
        expect(list).toBeTruthy();
        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({
                query_params: { auth_id: 'auth-123' },
            }),
        );
    });

    test('should allow showing storage details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.showStorage('1');
        expect(item).toBeInstanceOf(PlaceStorage);
        item = await SERVICE.showStorage('1', {});
    });

    test('should allow creating new storages', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.addStorage({});
        expect(item).toBeInstanceOf(PlaceStorage);
    });

    test('should allow updating storage details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateStorage('1', {});
        expect(item).toBeInstanceOf(PlaceStorage);
        item = await SERVICE.updateStorage('1', {}, 'patch');
        item = await SERVICE.updateStorage('1', {}, 'put');
    });

    test('should allow removing storages', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        let item = await SERVICE.removeStorage('1', {});
        expect(item).toBeFalsy();
        item = await SERVICE.removeStorage('1');
    });
});
