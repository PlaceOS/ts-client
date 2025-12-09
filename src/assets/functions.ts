import { map } from 'rxjs';
import {
    create,
    del,
    patch,
    post,
    put,
    query,
    remove,
    show,
    update,
} from '../api';
import { apiEndpoint } from '../auth';
import { PlaceResourceQueryOptions } from '../resources/interface';
import { toQueryString } from '../utilities/api';
import {
    PlaceAsset,
    PlaceAssetCategory,
    PlaceAssetPurchaseOrder,
    PlaceAssetType,
} from './assets.class';

///////////////////////////////////////////////////////////////
//////////////////////////   Assets   /////////////////////////
///////////////////////////////////////////////////////////////

/**
 * @private
 */
const ASSET_PATH = 'assets';

/** Convert raw server data to an asset object */
function processAsset(item: Partial<PlaceAsset>) {
    return new PlaceAsset(item);
}

/**
 * Query the available assets
 * @param query_params Query parameters to add the to request URL
 */
export function queryAssets(query_params: PlaceResourceQueryOptions = {}) {
    return query({
        query_params,
        fn: processAsset,
        path: ASSET_PATH,
    });
}

/**
 * Get the data for an asset
 * @param id ID of the asset to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showAsset(id: string, query_params: Record<string, any> = {}) {
    return show({
        id,
        query_params,
        fn: processAsset,
        path: ASSET_PATH,
    });
}

/**
 * Update the asset in the database
 * @param id ID of the asset
 * @param form_data New values for the asset
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateAsset(
    id: string,
    form_data: Partial<PlaceAsset>,
    method: 'put' | 'patch' = 'patch',
) {
    return update({
        id,
        form_data,
        query_params: {},
        method,
        fn: processAsset,
        path: ASSET_PATH,
    });
}

/**
 * Add a new asset to the database
 * @param form_data Application data
 * @param query_params Query parameters to add the to request URL
 */
export function addAsset(form_data: Partial<PlaceAsset>) {
    return create({
        form_data,
        query_params: {},
        fn: processAsset,
        path: ASSET_PATH,
    });
}

/**
 * Remove an asset from the database
 * @param id ID of the asset
 * @param query_params Query parameters to add the to request URL
 */
export function removeAsset(
    id: string,
    query_params: Record<string, any> = {},
) {
    return remove({ id, query_params, path: ASSET_PATH });
}

/**
 * Add a list of new assets to the database
 * @param form_data List of asset data
 * @param query_params Query parameters to add the to request URL
 */
export function addAssets(form_data: Partial<PlaceAsset>[]) {
    return post(
        `${apiEndpoint()}${ASSET_PATH}/bulk`,
        JSON.stringify(form_data),
        {},
    ).pipe(map((l: any) => l.map((_: any) => processAsset(_))));
}

/**
 * Update a list of assets in the database
 * @param id ID of the asset
 * @param form_data New values for the asset
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateAssets(
    form_data: Partial<PlaceAsset>[],
    method: 'put' | 'patch' = 'patch',
) {
    const verb = method === 'put' ? put : patch;
    return verb(
        `${apiEndpoint()}${ASSET_PATH}/bulk`,
        JSON.stringify(form_data),
        {},
    ).pipe(map((l: any) => l.map((_: any) => processAsset(_))));
}

/**
 * Remove an asset from the database
 * @param id ID of the asset
 * @param query_params Query parameters to add the to request URL
 */
export function removeAssets(
    id_list: string[],
    query_params: Record<string, any> = {},
) {
    const q = toQueryString(query_params);
    return del(`${apiEndpoint()}${ASSET_PATH}/bulk${q ? '?' + q : ''}`, {
        body: JSON.stringify(id_list),
    }).pipe(map((l: any) => l.map((_: any) => processAsset(_))));
}

///////////////////////////////////////////////////////////////
////////////////////////   Asset Types   //////////////////////
///////////////////////////////////////////////////////////////

/**
 * @private
 */
const ASSET_TYPE_PATH = 'asset_types';

/** Convert raw server data to an asset type object */
function processAssetType(item: Partial<PlaceAssetType>) {
    return new PlaceAssetType(item);
}

/**
 * Query the available asset types
 * @param query_params Query parameters to add the to request URL
 */
export function queryAssetTypes(query_params: PlaceResourceQueryOptions = {}) {
    return query({
        query_params,
        fn: processAssetType,
        path: ASSET_TYPE_PATH,
    });
}

/**
 * Get the data for an asset type
 * @param id ID of the asset type to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showAssetType(
    id: string,
    query_params: Record<string, any> = {},
) {
    return show({
        id,
        query_params,
        fn: processAssetType,
        path: ASSET_TYPE_PATH,
    });
}

/**
 * Update the asset type in the database
 * @param id ID of the asset type
 * @param form_data New values for the asset
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateAssetType(
    id: string,
    form_data: Partial<PlaceAssetType>,
    method: 'put' | 'patch' = 'patch',
) {
    return update({
        id,
        form_data,
        query_params: {},
        method,
        fn: processAssetType,
        path: ASSET_TYPE_PATH,
    });
}

/**
 * Add a new asset type to the database
 * @param form_data Application data
 * @param query_params Query parameters to add the to request URL
 */
export function addAssetType(form_data: Partial<PlaceAssetType>) {
    return create({
        form_data,
        query_params: {},
        fn: processAssetType,
        path: ASSET_TYPE_PATH,
    });
}

/**
 * Remove an asset type from the database
 * @param id ID of the asset type
 * @param query_params Query parameters to add the to request URL
 */
export function removeAssetType(
    id: string,
    query_params: Record<string, any> = {},
) {
    return remove({ id, query_params, path: ASSET_TYPE_PATH });
}

///////////////////////////////////////////////////////////////
/////////////////////   Asset Categories   ////////////////////
///////////////////////////////////////////////////////////////

/**
 * @private
 */
const ASSET_CATEGORY_PATH = 'asset_categories';

/** Convert raw server data to an asset category object */
function processAssetCategory(item: Partial<PlaceAssetCategory>) {
    return new PlaceAssetCategory(item);
}

/**
 * Query the available asset categories
 * @param query_params Query parameters to add the to request URL
 */
export function queryAssetCategories(
    query_params: PlaceResourceQueryOptions = {},
) {
    return query({
        query_params,
        fn: processAssetCategory,
        path: ASSET_CATEGORY_PATH,
    });
}

/**
 * Get the data for an asset category
 * @param id ID of the asset category to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showAssetCategory(
    id: string,
    query_params: Record<string, any> = {},
) {
    return show({
        id,
        query_params,
        fn: processAssetCategory,
        path: ASSET_CATEGORY_PATH,
    });
}

/**
 * Update the asset category in the database
 * @param id ID of the asset category
 * @param form_data New values for the asset category
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateAssetCategory(
    id: string,
    form_data: Partial<PlaceAssetCategory>,
    method: 'put' | 'patch' = 'patch',
) {
    return update({
        id,
        form_data,
        query_params: {},
        method,
        fn: processAssetCategory,
        path: ASSET_CATEGORY_PATH,
    });
}

/**
 * Add a new asset category to the database
 * @param form_data Asset category data
 * @param query_params Query parameters to add the to request URL
 */
export function addAssetCategory(form_data: Partial<PlaceAssetCategory>) {
    return create({
        form_data,
        query_params: {},
        fn: processAssetCategory,
        path: ASSET_CATEGORY_PATH,
    });
}

/**
 * Remove an asset category from the database
 * @param id ID of the asset category
 * @param query_params Query parameters to add the to request URL
 */
export function removeAssetCategory(
    id: string,
    query_params: Record<string, any> = {},
) {
    return remove({ id, query_params, path: ASSET_CATEGORY_PATH });
}

///////////////////////////////////////////////////////////////
//////////////////   Asset Purchase Orders   //////////////////
///////////////////////////////////////////////////////////////

/**
 * @private
 */
const ASSET_PURCHASE_ORDER_PATH = 'asset_purchase_orders';

/** Convert raw server data to an asset purchase order object */
function processAssetPurchaseOrder(item: Partial<PlaceAssetPurchaseOrder>) {
    return new PlaceAssetPurchaseOrder(item);
}

/**
 * Query the available asset purchase orders
 * @param query_params Query parameters to add the to request URL
 */
export function queryAssetPurchaseOrders(
    query_params: PlaceResourceQueryOptions = {},
) {
    return query({
        query_params,
        fn: processAssetPurchaseOrder,
        path: ASSET_PURCHASE_ORDER_PATH,
    });
}

/**
 * Get the data for an asset purchase order
 * @param id ID of the asset purchase order to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showAssetPurchaseOrder(
    id: string,
    query_params: Record<string, any> = {},
) {
    return show({
        id,
        query_params,
        fn: processAssetPurchaseOrder,
        path: ASSET_PURCHASE_ORDER_PATH,
    });
}

/**
 * Update the asset purchase order in the database
 * @param id ID of the asset purchase order
 * @param form_data New values for the asset purchase order
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateAssetPurchaseOrder(
    id: string,
    form_data: Partial<PlaceAssetPurchaseOrder>,
    method: 'put' | 'patch' = 'patch',
) {
    return update({
        id,
        form_data,
        query_params: {},
        method,
        fn: processAssetPurchaseOrder,
        path: ASSET_PURCHASE_ORDER_PATH,
    });
}

/**
 * Add a new asset purchase order to the database
 * @param form_data Asset purchase order data
 * @param query_params Query parameters to add the to request URL
 */
export function addAssetPurchaseOrder(
    form_data: Partial<PlaceAssetPurchaseOrder>,
) {
    return create({
        form_data,
        query_params: {},
        fn: processAssetPurchaseOrder,
        path: ASSET_PURCHASE_ORDER_PATH,
    });
}

/**
 * Remove an asset purchase order from the database
 * @param id ID of the asset purchase order
 * @param query_params Query parameters to add the to request URL
 */
export function removeAssetPurchaseOrder(
    id: string,
    query_params: Record<string, any> = {},
) {
    return remove({ id, query_params, path: ASSET_PURCHASE_ORDER_PATH });
}
