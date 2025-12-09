import { of } from 'rxjs';
import { describe, expect, test, vi } from 'vitest';
import {
    PlaceAsset,
    PlaceAssetCategory,
    PlaceAssetPurchaseOrder,
    PlaceAssetType,
} from '../../src/assets/assets.class';
import * as SERVICE from '../../src/assets/functions';
import * as Resources from '../../src/resources/functions';
import * as Api from '../../src/api';

describe('Assets API', () => {
    test('should allow querying assets', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) => of({ data: [_.fn!({})] } as any));
        let list = await SERVICE.queryAssets().toPromise();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceAsset);
        list = await SERVICE.queryAssets({}).toPromise();
    });

    test('should allow showing asset details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.showAsset('1').toPromise();
        expect(item).toBeInstanceOf(PlaceAsset);
        item = await SERVICE.showAsset('1', {}).toPromise();
    });

    test('should allow creating new assets', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        const item = await SERVICE.addAsset({}).toPromise();
        expect(item).toBeInstanceOf(PlaceAsset);
    });

    test('should allow updating asset details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.updateAsset('1', {}).toPromise();
        expect(item).toBeInstanceOf(PlaceAsset);
        item = await SERVICE.updateAsset('1', {}, 'patch').toPromise();
    });

    test('should allow removing assets', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        let item = await SERVICE.removeAsset('1', {}).toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeAsset('1').toPromise();
    });

    test('should allow bulk creating assets', async () => {
        const spy = vi.spyOn(Api, 'post');
        spy.mockImplementation(() => of([{}, {}] as any));
        const items = await SERVICE.addAssets([{}, {}]).toPromise();
        expect(items).toBeTruthy();
        expect(items.length).toBe(2);
        expect(items[0]).toBeInstanceOf(PlaceAsset);
        expect(items[1]).toBeInstanceOf(PlaceAsset);
    });

    test('should allow bulk updating assets', async () => {
        const patchSpy = vi.spyOn(Api, 'patch');
        patchSpy.mockImplementation(() => of([{}, {}] as any));
        let items = await SERVICE.updateAssets([{}, {}]).toPromise();
        expect(items).toBeTruthy();
        expect(items.length).toBe(2);
        expect(items[0]).toBeInstanceOf(PlaceAsset);

        const putSpy = vi.spyOn(Api, 'put');
        putSpy.mockImplementation(() => of([{}] as any));
        items = await SERVICE.updateAssets([{}], 'put').toPromise();
        expect(items.length).toBe(1);
    });

    test('should allow bulk removing assets', async () => {
        const spy = vi.spyOn(Api, 'del');
        spy.mockImplementation(() => of([{}, {}] as any));
        const items = await SERVICE.removeAssets(['1', '2']).toPromise();
        expect(items).toBeTruthy();
        expect(items.length).toBe(2);
    });
});

describe('Asset Types API', () => {
    test('should allow querying asset types', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) => of({ data: [_.fn!({})] } as any));
        let list = await SERVICE.queryAssetTypes().toPromise();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceAssetType);
        list = await SERVICE.queryAssetTypes({}).toPromise();
    });

    test('should allow showing asset type details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.showAssetType('1').toPromise();
        expect(item).toBeInstanceOf(PlaceAssetType);
        item = await SERVICE.showAssetType('1', {}).toPromise();
    });

    test('should allow creating new asset types', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        const item = await SERVICE.addAssetType({}).toPromise();
        expect(item).toBeInstanceOf(PlaceAssetType);
    });

    test('should allow updating asset type details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.updateAssetType('1', {}).toPromise();
        expect(item).toBeInstanceOf(PlaceAssetType);
        item = await SERVICE.updateAssetType('1', {}, 'patch').toPromise();
    });

    test('should allow removing asset types', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        let item = await SERVICE.removeAssetType('1', {}).toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeAssetType('1').toPromise();
    });
});

describe('Asset Categories API', () => {
    test('should allow querying asset categories', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) => of({ data: [_.fn!({})] } as any));
        let list = await SERVICE.queryAssetCategories().toPromise();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceAssetCategory);
        list = await SERVICE.queryAssetCategories({}).toPromise();
    });

    test('should allow showing asset category details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.showAssetCategory('1').toPromise();
        expect(item).toBeInstanceOf(PlaceAssetCategory);
        item = await SERVICE.showAssetCategory('1', {}).toPromise();
    });

    test('should allow creating new asset categories', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        const item = await SERVICE.addAssetCategory({}).toPromise();
        expect(item).toBeInstanceOf(PlaceAssetCategory);
    });

    test('should allow updating asset category details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.updateAssetCategory('1', {}).toPromise();
        expect(item).toBeInstanceOf(PlaceAssetCategory);
        item = await SERVICE.updateAssetCategory('1', {}, 'patch').toPromise();
    });

    test('should allow removing asset categories', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        let item = await SERVICE.removeAssetCategory('1', {}).toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeAssetCategory('1').toPromise();
    });
});

describe('Asset Purchase Orders API', () => {
    test('should allow querying asset purchase orders', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) => of({ data: [_.fn!({})] } as any));
        let list = await SERVICE.queryAssetPurchaseOrders().toPromise();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceAssetPurchaseOrder);
        list = await SERVICE.queryAssetPurchaseOrders({}).toPromise();
    });

    test('should allow showing asset purchase order details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.showAssetPurchaseOrder('1').toPromise();
        expect(item).toBeInstanceOf(PlaceAssetPurchaseOrder);
        item = await SERVICE.showAssetPurchaseOrder('1', {}).toPromise();
    });

    test('should allow creating new asset purchase orders', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        const item = await SERVICE.addAssetPurchaseOrder({}).toPromise();
        expect(item).toBeInstanceOf(PlaceAssetPurchaseOrder);
    });

    test('should allow updating asset purchase order details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.updateAssetPurchaseOrder('1', {}).toPromise();
        expect(item).toBeInstanceOf(PlaceAssetPurchaseOrder);
        item = await SERVICE.updateAssetPurchaseOrder('1', {}, 'patch').toPromise();
    });

    test('should allow removing asset purchase orders', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        let item = await SERVICE.removeAssetPurchaseOrder('1', {}).toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeAssetPurchaseOrder('1').toPromise();
    });
});
