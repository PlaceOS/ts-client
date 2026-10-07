import { PlaceAsset, PlaceAssetCategory, PlaceAssetPurchaseOrder, PlaceAssetType } from './assets.class';
import { PlaceAssetCategoryQueryOptions, PlaceAssetPurchaseOrderQueryOptions, PlaceAssetQueryOptions, PlaceAssetTypeQueryOptions } from './interfaces';
/**
 * Query the available assets
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryAssets(query_params?: PlaceAssetQueryOptions): import('..').QueryResponse<PlaceAsset>;
/**
 * Get the data for an asset
 * @param id ID of the asset to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showAsset(id: string, query_params?: Record<string, any>): Promise<PlaceAsset>;
/**
 * Update the asset in the database
 * @param id ID of the asset
 * @param form_data New values for the asset
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateAsset(id: string, form_data: Partial<PlaceAsset>, method?: 'put' | 'patch'): Promise<PlaceAsset>;
/**
 * Add a new asset to the database
 * @param form_data Application data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addAsset(form_data: Partial<PlaceAsset>): Promise<PlaceAsset>;
/**
 * Remove an asset from the database
 * @param id ID of the asset
 * @param query_params Query parameters to add the to request URL
 */
export declare function removeAsset(id: string, query_params?: Record<string, any>): Promise<import('../utilities/types').HashMap<any>>;
/**
 * Add a list of new assets to the database
 * @param form_data List of asset data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addAssets(form_data: Partial<PlaceAsset>[]): Promise<any>;
/**
 * Update a list of assets in the database
 * @param id ID of the asset
 * @param form_data New values for the asset
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateAssets(form_data: Partial<PlaceAsset>[], method?: 'put' | 'patch'): Promise<any>;
/**
 * Remove an asset from the database
 * @param id ID of the asset
 * @param query_params Query parameters to add the to request URL
 */
export declare function removeAssets(id_list: string[], query_params?: Record<string, any>): Promise<any>;
/**
 * Query the available asset types
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryAssetTypes(query_params?: PlaceAssetTypeQueryOptions): import('..').QueryResponse<PlaceAssetType>;
/**
 * Get the data for an asset type
 * @param id ID of the asset type to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showAssetType(id: string, query_params?: Record<string, any>): Promise<PlaceAssetType>;
/**
 * Update the asset type in the database
 * @param id ID of the asset type
 * @param form_data New values for the asset
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateAssetType(id: string, form_data: Partial<PlaceAssetType>, method?: 'put' | 'patch'): Promise<PlaceAssetType>;
/**
 * Add a new asset type to the database
 * @param form_data Application data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addAssetType(form_data: Partial<PlaceAssetType>): Promise<PlaceAssetType>;
/**
 * Remove an asset type from the database
 * @param id ID of the asset type
 * @param query_params Query parameters to add the to request URL
 */
export declare function removeAssetType(id: string, query_params?: Record<string, any>): Promise<import('../utilities/types').HashMap<any>>;
/**
 * Query the available asset categories
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryAssetCategories(query_params?: PlaceAssetCategoryQueryOptions): import('..').QueryResponse<PlaceAssetCategory>;
/**
 * Get the data for an asset category
 * @param id ID of the asset category to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showAssetCategory(id: string, query_params?: Record<string, any>): Promise<PlaceAssetCategory>;
/**
 * Update the asset category in the database
 * @param id ID of the asset category
 * @param form_data New values for the asset category
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateAssetCategory(id: string, form_data: Partial<PlaceAssetCategory>, method?: 'put' | 'patch'): Promise<PlaceAssetCategory>;
/**
 * Add a new asset category to the database
 * @param form_data Asset category data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addAssetCategory(form_data: Partial<PlaceAssetCategory>): Promise<PlaceAssetCategory>;
/**
 * Remove an asset category from the database
 * @param id ID of the asset category
 * @param query_params Query parameters to add the to request URL
 */
export declare function removeAssetCategory(id: string, query_params?: Record<string, any>): Promise<import('../utilities/types').HashMap<any>>;
/**
 * Query the available asset purchase orders
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryAssetPurchaseOrders(query_params?: PlaceAssetPurchaseOrderQueryOptions): import('..').QueryResponse<PlaceAssetPurchaseOrder>;
/**
 * Get the data for an asset purchase order
 * @param id ID of the asset purchase order to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showAssetPurchaseOrder(id: string, query_params?: Record<string, any>): Promise<PlaceAssetPurchaseOrder>;
/**
 * Update the asset purchase order in the database
 * @param id ID of the asset purchase order
 * @param form_data New values for the asset purchase order
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateAssetPurchaseOrder(id: string, form_data: Partial<PlaceAssetPurchaseOrder>, method?: 'put' | 'patch'): Promise<PlaceAssetPurchaseOrder>;
/**
 * Add a new asset purchase order to the database
 * @param form_data Asset purchase order data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addAssetPurchaseOrder(form_data: Partial<PlaceAssetPurchaseOrder>): Promise<PlaceAssetPurchaseOrder>;
/**
 * Remove an asset purchase order from the database
 * @param id ID of the asset purchase order
 * @param query_params Query parameters to add the to request URL
 */
export declare function removeAssetPurchaseOrder(id: string, query_params?: Record<string, any>): Promise<import('../utilities/types').HashMap<any>>;
