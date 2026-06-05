import { describe, expect, test, vi } from 'vitest';
import * as Api from '../../src/api';
import {
    PlaceAsset,
    PlaceAssetCategory,
    PlaceAssetPurchaseOrder,
    PlaceAssetType,
} from '../../src/assets/assets.class';
import * as SERVICE from '../../src/assets/functions';
import * as Resources from '../../src/resources/functions';

describe('Assets API', () => {
    test('should allow querying assets', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        let list = await SERVICE.queryAssets();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceAsset);
        list = await SERVICE.queryAssets({});
    });

    test('should allow showing asset details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.showAsset('1');
        expect(item).toBeInstanceOf(PlaceAsset);
        item = await SERVICE.showAsset('1', {});
    });

    test('should allow creating new assets', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.addAsset({});
        expect(item).toBeInstanceOf(PlaceAsset);
    });

    test('should allow updating asset details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateAsset('1', {});
        expect(item).toBeInstanceOf(PlaceAsset);
        item = await SERVICE.updateAsset('1', {}, 'patch');
    });

    test('should allow removing assets', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        let item = await SERVICE.removeAsset('1', {});
        expect(item).toBeFalsy();
        item = await SERVICE.removeAsset('1');
    });

    test('should allow bulk creating assets', async () => {
        const spy = vi.spyOn(Api, 'post');
        spy.mockImplementation(() => Promise.resolve([{}, {}] as any));
        const items = await SERVICE.addAssets([{}, {}]);
        expect(items).toBeTruthy();
        expect(items.length).toBe(2);
        expect(items[0]).toBeInstanceOf(PlaceAsset);
        expect(items[1]).toBeInstanceOf(PlaceAsset);
    });

    test('should allow bulk updating assets', async () => {
        const patchSpy = vi.spyOn(Api, 'patch');
        patchSpy.mockImplementation(() => Promise.resolve([{}, {}] as any));
        let items = await SERVICE.updateAssets([{}, {}]);
        expect(items).toBeTruthy();
        expect(items.length).toBe(2);
        expect(items[0]).toBeInstanceOf(PlaceAsset);

        const putSpy = vi.spyOn(Api, 'put');
        putSpy.mockImplementation(() => Promise.resolve([{}] as any));
        items = await SERVICE.updateAssets([{}], 'put');
        expect(items.length).toBe(1);
    });

    test('should allow bulk removing assets', async () => {
        const spy = vi.spyOn(Api, 'del');
        spy.mockImplementation(() => Promise.resolve([{}, {}] as any));
        const items = await SERVICE.removeAssets(['1', '2']);
        expect(items).toBeTruthy();
        expect(items.length).toBe(2);
    });
});

describe('Asset Types API', () => {
    test('should allow querying asset types', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        let list = await SERVICE.queryAssetTypes();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceAssetType);
        list = await SERVICE.queryAssetTypes({});
    });

    test('should allow showing asset type details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.showAssetType('1');
        expect(item).toBeInstanceOf(PlaceAssetType);
        item = await SERVICE.showAssetType('1', {});
    });

    test('should allow creating new asset types', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.addAssetType({});
        expect(item).toBeInstanceOf(PlaceAssetType);
    });

    test('should allow updating asset type details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateAssetType('1', {});
        expect(item).toBeInstanceOf(PlaceAssetType);
        item = await SERVICE.updateAssetType('1', {}, 'patch');
    });

    test('should allow removing asset types', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        let item = await SERVICE.removeAssetType('1', {});
        expect(item).toBeFalsy();
        item = await SERVICE.removeAssetType('1');
    });
});

describe('Asset Categories API', () => {
    test('should allow querying asset categories', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        let list = await SERVICE.queryAssetCategories();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceAssetCategory);
        list = await SERVICE.queryAssetCategories({});
    });

    test('should allow showing asset category details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.showAssetCategory('1');
        expect(item).toBeInstanceOf(PlaceAssetCategory);
        item = await SERVICE.showAssetCategory('1', {});
    });

    test('should allow creating new asset categories', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.addAssetCategory({});
        expect(item).toBeInstanceOf(PlaceAssetCategory);
    });

    test('should allow updating asset category details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateAssetCategory('1', {});
        expect(item).toBeInstanceOf(PlaceAssetCategory);
        item = await SERVICE.updateAssetCategory('1', {}, 'patch');
    });

    test('should allow removing asset categories', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        let item = await SERVICE.removeAssetCategory('1', {});
        expect(item).toBeFalsy();
        item = await SERVICE.removeAssetCategory('1');
    });
});

describe('Asset Purchase Orders API', () => {
    test('should allow querying asset purchase orders', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        let list = await SERVICE.queryAssetPurchaseOrders();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceAssetPurchaseOrder);
        list = await SERVICE.queryAssetPurchaseOrders({});
    });

    test('should allow showing asset purchase order details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.showAssetPurchaseOrder('1');
        expect(item).toBeInstanceOf(PlaceAssetPurchaseOrder);
        item = await SERVICE.showAssetPurchaseOrder('1', {});
    });

    test('should allow creating new asset purchase orders', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.addAssetPurchaseOrder({});
        expect(item).toBeInstanceOf(PlaceAssetPurchaseOrder);
    });

    test('should allow updating asset purchase order details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateAssetPurchaseOrder('1', {});
        expect(item).toBeInstanceOf(PlaceAssetPurchaseOrder);
        item = await SERVICE.updateAssetPurchaseOrder('1', {}, 'patch');
    });

    test('should allow removing asset purchase orders', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        let item = await SERVICE.removeAssetPurchaseOrder('1', {});
        expect(item).toBeFalsy();
        item = await SERVICE.removeAssetPurchaseOrder('1');
    });
});
