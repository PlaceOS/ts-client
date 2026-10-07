export declare class PlaceAssetCategory {
    readonly id: string;
    readonly parent_category_id: string;
    readonly name: string;
    readonly description: string;
    readonly hidden: boolean;
    readonly created_at: number;
    readonly updated_at: number;
    constructor(data: Partial<PlaceAssetCategory>);
}
export declare class PlaceAssetPurchaseOrder {
    readonly id: string;
    readonly purchase_order_number: string;
    readonly invoice_number: string;
    readonly supplier_details: Record<string, string>;
    readonly purchase_date: number;
    readonly unit_price: number;
    readonly expected_service_start_date: number;
    readonly expected_service_end_date: number;
    readonly created_at: number;
    readonly updated_at: number;
    constructor(data: Partial<PlaceAssetPurchaseOrder>);
}
export declare class PlaceAssetType {
    readonly id: string;
    readonly category_id: string;
    readonly name: string;
    readonly brand: string;
    readonly description: string;
    readonly model_number: string;
    readonly images: string[];
    readonly created_at: number;
    readonly updated_at: number;
    constructor(data: Partial<PlaceAssetType>);
}
export declare class PlaceAsset {
    readonly id: string;
    readonly parent_id: string;
    readonly asset_type_id: string;
    readonly purchase_order_id: string;
    readonly zone_id: string;
    readonly identifier: string;
    readonly serial_number: string;
    readonly other_data: Record<string, string>;
    readonly barcode: string;
    readonly name: string;
    readonly client_ids: Record<string, string>;
    readonly map_id: string;
    readonly bookable: boolean;
    readonly accessible: boolean;
    readonly zones: string[];
    readonly place_groups: string[];
    readonly assigned_to: string;
    readonly assigned_name: string;
    readonly features: string[];
    readonly images: string[];
    readonly notes: string;
    readonly security_system_groups: string[];
    readonly created_at: number;
    readonly updated_at: number;
    constructor(data: Partial<PlaceAsset>);
}
