import { PlaceStorage } from './storage.class';
import { PlaceStorageQueryOptions } from './interfaces';
/**
 * Query the available storages
 * @param query_params Query parameters to add to the request URL
 */
export declare function queryStorages(query_params?: PlaceStorageQueryOptions): import('..').QueryResponse<PlaceStorage>;
/**
 * Get the data for a storage
 * @param id ID of the storage to retrieve
 * @param query_params Query parameters to add to the request URL
 */
export declare function showStorage(id: string, query_params?: Record<string, any>): Promise<PlaceStorage>;
/**
 * Update a storage in the database
 * @param id ID of the storage
 * @param form_data New values for the storage
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateStorage(id: string, form_data: Partial<PlaceStorage>, method?: 'put' | 'patch'): Promise<PlaceStorage>;
/**
 * Add a new storage to the database
 * @param form_data Storage data
 */
export declare function addStorage(form_data: Partial<PlaceStorage>): Promise<PlaceStorage>;
/**
 * Remove a storage from the database
 * @param id ID of the storage
 * @param query_params Query parameters to add to the request URL
 */
export declare function removeStorage(id: string, query_params?: Record<string, any>): Promise<import('../utilities/types').HashMap<any>>;
