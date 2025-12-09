import { create, query, remove, show, update } from '../resources/functions';
import { PlaceStorage } from './storage.class';
import { PlaceStorageQueryOptions } from './interfaces';

/**
 * @private
 */
const PATH = 'storages';

/** Convert raw server data to a storage object */
function processStorage(item: Partial<PlaceStorage>) {
    return new PlaceStorage(item);
}

/**
 * Query the available storages
 * @param query_params Query parameters to add to the request URL
 */
export function queryStorages(query_params: PlaceStorageQueryOptions = {}) {
    return query({
        query_params,
        fn: processStorage,
        path: PATH,
    });
}

/**
 * Get the data for a storage
 * @param id ID of the storage to retrieve
 * @param query_params Query parameters to add to the request URL
 */
export function showStorage(
    id: string,
    query_params: Record<string, any> = {},
) {
    return show({
        id,
        query_params,
        fn: processStorage,
        path: PATH,
    });
}

/**
 * Update a storage in the database
 * @param id ID of the storage
 * @param form_data New values for the storage
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateStorage(
    id: string,
    form_data: Partial<PlaceStorage>,
    method: 'put' | 'patch' = 'patch',
) {
    return update({
        id,
        form_data,
        query_params: {},
        method,
        fn: processStorage,
        path: PATH,
    });
}

/**
 * Add a new storage to the database
 * @param form_data Storage data
 */
export function addStorage(form_data: Partial<PlaceStorage>) {
    return create({
        form_data,
        query_params: {},
        fn: processStorage,
        path: PATH,
    });
}

/**
 * Remove a storage from the database
 * @param id ID of the storage
 * @param query_params Query parameters to add to the request URL
 */
export function removeStorage(
    id: string,
    query_params: Record<string, any> = {},
) {
    return remove({ id, query_params, path: PATH });
}
