import { beforeEach, describe, expect, test } from 'vitest';
import {
    PlaceAsset,
    PlaceAssetCategory,
    PlaceAssetPurchaseOrder,
    PlaceAssetType,
} from '../../src/assets/assets.class';

describe('PlaceAssetCategory', () => {
    let category: PlaceAssetCategory;

    beforeEach(() => {
        category = new PlaceAssetCategory({
            id: 'cat-test',
            parent_category_id: 'cat-parent',
            name: 'Test Category',
            description: 'A test category',
            hidden: true,
            created_at: 1000,
            updated_at: 2000,
        });
    });

    test('should create instance', () => {
        expect(category).toBeTruthy();
        expect(category).toBeInstanceOf(PlaceAssetCategory);
    });

    test('should expose id', () => {
        expect(category.id).toBe('cat-test');
    });

    test('should expose parent_category_id', () => {
        expect(category.parent_category_id).toBe('cat-parent');
    });

    test('should expose name', () => {
        expect(category.name).toBe('Test Category');
    });

    test('should expose description', () => {
        expect(category.description).toBe('A test category');
    });

    test('should expose hidden', () => {
        expect(category.hidden).toBe(true);
    });

    test('should expose created_at', () => {
        expect(category.created_at).toBe(1000);
    });

    test('should expose updated_at', () => {
        expect(category.updated_at).toBe(2000);
    });

    test('should use default values for missing properties', () => {
        const emptyCategory = new PlaceAssetCategory({});
        expect(emptyCategory.id).toBe('');
        expect(emptyCategory.parent_category_id).toBe('');
        expect(emptyCategory.name).toBe('');
        expect(emptyCategory.description).toBe('');
        expect(emptyCategory.hidden).toBe(false);
        expect(emptyCategory.created_at).toBe(0);
        expect(emptyCategory.updated_at).toBe(0);
    });
});

describe('PlaceAssetPurchaseOrder', () => {
    let purchaseOrder: PlaceAssetPurchaseOrder;

    beforeEach(() => {
        purchaseOrder = new PlaceAssetPurchaseOrder({
            id: 'po-test',
            purchase_order_number: 'PO-12345',
            invoice_number: 'INV-67890',
            supplier_details: { name: 'Acme Corp', contact: 'john@acme.com' },
            purchase_date: 1609459200,
            unit_price: 999,
            expected_service_start_date: 1609545600,
            expected_service_end_date: 1640995200,
            created_at: 1000,
            updated_at: 2000,
        });
    });

    test('should create instance', () => {
        expect(purchaseOrder).toBeTruthy();
        expect(purchaseOrder).toBeInstanceOf(PlaceAssetPurchaseOrder);
    });

    test('should expose id', () => {
        expect(purchaseOrder.id).toBe('po-test');
    });

    test('should expose purchase_order_number', () => {
        expect(purchaseOrder.purchase_order_number).toBe('PO-12345');
    });

    test('should expose invoice_number', () => {
        expect(purchaseOrder.invoice_number).toBe('INV-67890');
    });

    test('should expose supplier_details', () => {
        expect(purchaseOrder.supplier_details).toEqual({
            name: 'Acme Corp',
            contact: 'john@acme.com',
        });
    });

    test('should expose purchase_date', () => {
        expect(purchaseOrder.purchase_date).toBe(1609459200);
    });

    test('should expose unit_price', () => {
        expect(purchaseOrder.unit_price).toBe(999);
    });

    test('should expose expected_service_start_date', () => {
        expect(purchaseOrder.expected_service_start_date).toBe(1609545600);
    });

    test('should expose expected_service_end_date', () => {
        expect(purchaseOrder.expected_service_end_date).toBe(1640995200);
    });

    test('should expose created_at', () => {
        expect(purchaseOrder.created_at).toBe(1000);
    });

    test('should expose updated_at', () => {
        expect(purchaseOrder.updated_at).toBe(2000);
    });

    test('should use default values for missing properties', () => {
        const emptyPO = new PlaceAssetPurchaseOrder({});
        expect(emptyPO.id).toBe('');
        expect(emptyPO.purchase_order_number).toBe('');
        expect(emptyPO.invoice_number).toBe('');
        expect(emptyPO.supplier_details).toEqual({});
        expect(emptyPO.purchase_date).toBe(0);
        expect(emptyPO.unit_price).toBe(0);
        expect(emptyPO.expected_service_start_date).toBe(0);
        expect(emptyPO.expected_service_end_date).toBe(0);
        expect(emptyPO.created_at).toBe(0);
        expect(emptyPO.updated_at).toBe(0);
    });
});

describe('PlaceAssetType', () => {
    let assetType: PlaceAssetType;

    beforeEach(() => {
        assetType = new PlaceAssetType({
            id: 'type-test',
            category_id: 'cat-123',
            name: 'Test Asset Type',
            brand: 'Acme',
            description: 'A test asset type',
            model_number: 'MODEL-001',
            images: ['image1.jpg', 'image2.jpg'],
            created_at: 1000,
            updated_at: 2000,
        });
    });

    test('should create instance', () => {
        expect(assetType).toBeTruthy();
        expect(assetType).toBeInstanceOf(PlaceAssetType);
    });

    test('should expose id', () => {
        expect(assetType.id).toBe('type-test');
    });

    test('should expose category_id', () => {
        expect(assetType.category_id).toBe('cat-123');
    });

    test('should expose name', () => {
        expect(assetType.name).toBe('Test Asset Type');
    });

    test('should expose brand', () => {
        expect(assetType.brand).toBe('Acme');
    });

    test('should expose description', () => {
        expect(assetType.description).toBe('A test asset type');
    });

    test('should expose model_number', () => {
        expect(assetType.model_number).toBe('MODEL-001');
    });

    test('should expose images', () => {
        expect(assetType.images).toEqual(['image1.jpg', 'image2.jpg']);
    });

    test('should expose created_at', () => {
        expect(assetType.created_at).toBe(1000);
    });

    test('should expose updated_at', () => {
        expect(assetType.updated_at).toBe(2000);
    });

    test('should use default values for missing properties', () => {
        const emptyType = new PlaceAssetType({});
        expect(emptyType.id).toBe('');
        expect(emptyType.category_id).toBe('');
        expect(emptyType.name).toBe('');
        expect(emptyType.brand).toBe('');
        expect(emptyType.description).toBe('');
        expect(emptyType.model_number).toBe('');
        expect(emptyType.images).toEqual([]);
        expect(emptyType.created_at).toBe(0);
        expect(emptyType.updated_at).toBe(0);
    });
});

describe('PlaceAsset', () => {
    let asset: PlaceAsset;

    beforeEach(() => {
        asset = new PlaceAsset({
            id: 'asset-test',
            parent_id: 'asset-parent',
            asset_type_id: 'type-123',
            purchase_order_id: 'po-456',
            zone_id: 'zone-789',
            identifier: 'ASSET-001',
            serial_number: 'SN-12345',
            other_data: { custom: 'data' },
            barcode: 'BC-12345',
            name: 'Test Asset',
            client_ids: { system1: 'id1', system2: 'id2' },
            map_id: 'map-123',
            bookable: true,
            accessible: true,
            zones: ['zone1', 'zone2'],
            place_groups: ['group1', 'group2'],
            assigned_to: 'user-123',
            assigned_name: 'John Doe',
            features: ['feature1', 'feature2'],
            images: ['asset1.jpg', 'asset2.jpg'],
            notes: 'Some notes',
            security_system_groups: ['sec1', 'sec2'],
            created_at: 1000,
            updated_at: 2000,
        });
    });

    test('should create instance', () => {
        expect(asset).toBeTruthy();
        expect(asset).toBeInstanceOf(PlaceAsset);
    });

    test('should expose id', () => {
        expect(asset.id).toBe('asset-test');
    });

    test('should expose parent_id', () => {
        expect(asset.parent_id).toBe('asset-parent');
    });

    test('should expose asset_type_id', () => {
        expect(asset.asset_type_id).toBe('type-123');
    });

    test('should expose purchase_order_id', () => {
        expect(asset.purchase_order_id).toBe('po-456');
    });

    test('should expose zone_id', () => {
        expect(asset.zone_id).toBe('zone-789');
    });

    test('should expose identifier', () => {
        expect(asset.identifier).toBe('ASSET-001');
    });

    test('should expose serial_number', () => {
        expect(asset.serial_number).toBe('SN-12345');
    });

    test('should expose other_data', () => {
        expect(asset.other_data).toEqual({ custom: 'data' });
    });

    test('should expose barcode', () => {
        expect(asset.barcode).toBe('BC-12345');
    });

    test('should expose name', () => {
        expect(asset.name).toBe('Test Asset');
    });

    test('should expose client_ids', () => {
        expect(asset.client_ids).toEqual({ system1: 'id1', system2: 'id2' });
    });

    test('should expose map_id', () => {
        expect(asset.map_id).toBe('map-123');
    });

    test('should expose bookable', () => {
        expect(asset.bookable).toBe(true);
    });

    test('should expose accessible', () => {
        expect(asset.accessible).toBe(true);
    });

    test('should expose zones', () => {
        expect(asset.zones).toEqual(['zone1', 'zone2']);
    });

    test('should expose place_groups', () => {
        expect(asset.place_groups).toEqual(['group1', 'group2']);
    });

    test('should expose assigned_to', () => {
        expect(asset.assigned_to).toBe('user-123');
    });

    test('should expose assigned_name', () => {
        expect(asset.assigned_name).toBe('John Doe');
    });

    test('should expose features', () => {
        expect(asset.features).toEqual(['feature1', 'feature2']);
    });

    test('should expose images', () => {
        expect(asset.images).toEqual(['asset1.jpg', 'asset2.jpg']);
    });

    test('should expose notes', () => {
        expect(asset.notes).toBe('Some notes');
    });

    test('should expose security_system_groups', () => {
        expect(asset.security_system_groups).toEqual(['sec1', 'sec2']);
    });

    test('should expose created_at', () => {
        expect(asset.created_at).toBe(1000);
    });

    test('should expose updated_at', () => {
        expect(asset.updated_at).toBe(2000);
    });

    test('should use default values for missing properties', () => {
        const emptyAsset = new PlaceAsset({});
        expect(emptyAsset.id).toBe('');
        expect(emptyAsset.parent_id).toBe('');
        expect(emptyAsset.asset_type_id).toBe('');
        expect(emptyAsset.purchase_order_id).toBe('');
        expect(emptyAsset.zone_id).toBe('');
        expect(emptyAsset.identifier).toBe('');
        expect(emptyAsset.serial_number).toBe('');
        expect(emptyAsset.other_data).toEqual({});
        expect(emptyAsset.barcode).toBe('');
        expect(emptyAsset.name).toBe('');
        expect(emptyAsset.client_ids).toEqual({});
        expect(emptyAsset.map_id).toBe('');
        expect(emptyAsset.bookable).toBe(false);
        expect(emptyAsset.accessible).toBe(false);
        expect(emptyAsset.zones).toEqual([]);
        expect(emptyAsset.place_groups).toEqual([]);
        expect(emptyAsset.assigned_to).toBe('');
        expect(emptyAsset.assigned_name).toBe('');
        expect(emptyAsset.features).toEqual([]);
        expect(emptyAsset.images).toEqual([]);
        expect(emptyAsset.notes).toBe('');
        expect(emptyAsset.security_system_groups).toEqual([]);
        expect(emptyAsset.created_at).toBe(0);
        expect(emptyAsset.updated_at).toBe(0);
    });
});
