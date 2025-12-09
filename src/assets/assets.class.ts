export class PlaceAssetCategory {
    readonly id: string;
    readonly parent_category_id: string;
    readonly name: string;
    readonly description: string;
    readonly hidden: boolean;
    readonly created_at: number;
    readonly updated_at: number;

    constructor(data: Partial<PlaceAssetCategory>) {
        this.id = data.id || '';
        this.parent_category_id = data.parent_category_id || '';
        this.name = data.name || '';
        this.description = data.description || '';
        this.hidden = data.hidden || false;
        this.created_at = data.created_at || 0;
        this.updated_at = data.updated_at || 0;
    }
}

export class PlaceAssetPurchaseOrder {
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

    constructor(data: Partial<PlaceAssetPurchaseOrder>) {
        this.id = data.id || '';
        this.purchase_order_number = data.purchase_order_number || '';
        this.invoice_number = data.invoice_number || '';
        this.supplier_details = data.supplier_details || {};
        this.purchase_date = data.purchase_date || 0;
        this.unit_price = data.unit_price || 0;
        this.expected_service_start_date = data.expected_service_start_date || 0;
        this.expected_service_end_date = data.expected_service_end_date || 0;
        this.created_at = data.created_at || 0;
        this.updated_at = data.updated_at || 0;
    }
}

export class PlaceAssetType {
    readonly id: string;
    readonly category_id: string;
    readonly name: string;
    readonly brand: string;
    readonly description: string;
    readonly model_number: string;
    readonly images: string[];
    readonly created_at: number;
    readonly updated_at: number;

    constructor(data: Partial<PlaceAssetType>) {
        this.id = data.id || '';
        this.category_id = data.category_id || '';
        this.name = data.name || '';
        this.brand = data.brand || '';
        this.description = data.description || '';
        this.model_number = data.model_number || '';
        this.images = data.images || [];
        this.created_at = data.created_at || 0;
        this.updated_at = data.updated_at || 0;
    }
}

export class PlaceAsset {
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

    constructor(data: Partial<PlaceAsset>) {
        this.id = data.id || '';
        this.parent_id = data.parent_id || '';
        this.asset_type_id = data.asset_type_id || '';
        this.purchase_order_id = data.purchase_order_id || '';
        this.zone_id = data.zone_id || '';
        this.identifier = data.identifier || '';
        this.serial_number = data.serial_number || '';
        this.other_data = data.other_data || {};
        this.barcode = data.barcode || '';
        this.name = data.name || '';
        this.client_ids = data.client_ids || {};
        this.map_id = data.map_id || '';
        this.bookable = data.bookable || false;
        this.accessible = data.accessible || false;
        this.zones = data.zones || [];
        this.place_groups = data.place_groups || [];
        this.assigned_to = data.assigned_to || '';
        this.assigned_name = data.assigned_name || '';
        this.features = data.features || [];
        this.images = data.images || [];
        this.notes = data.notes || '';
        this.security_system_groups = data.security_system_groups || [];
        this.created_at = data.created_at || 0;
        this.updated_at = data.updated_at || 0;
    }
}
