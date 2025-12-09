import { PlaceResourceQueryOptions } from '../resources/interface';

/** Mapping of available query parameters for the assets index endpoint */
export interface PlaceAssetQueryOptions extends PlaceResourceQueryOptions {
    /** Return assets which are in the zone provided */
    zone_id?: string;
    /** Return assets that match the asset type ID provided */
    type_id?: string;
    /** Return assets that match the purchase order ID provided */
    order_id?: string;
    /** Return assets that have a matching barcode */
    barcode?: string;
    /** Return assets that have a matching serial number */
    serial_number?: string;
}

/** Mapping of available query parameters for the asset types index endpoint */
export interface PlaceAssetTypeQueryOptions extends PlaceResourceQueryOptions {
    /** Return assets with the provided brand name */
    brand?: string;
    /** Return assets with the provided model number */
    model_number?: string;
    /** Return asset types in the category provided */
    category_id?: string;
    /** Filters the asset count to the zone provided */
    zone_id?: string;
}

/** Mapping of available query parameters for the asset categories index endpoint */
export interface PlaceAssetCategoryQueryOptions extends PlaceResourceQueryOptions {
    /**
     * Filter categories by hidden status.
     * `true` returns only hidden categories,
     * `false` returns only non-hidden categories,
     * `undefined` returns all categories.
     */
    hidden?: boolean;
}

/** Mapping of available query parameters for the asset purchase orders index endpoint */
export interface PlaceAssetPurchaseOrderQueryOptions extends PlaceResourceQueryOptions {}
