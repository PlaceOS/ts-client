import { PlaceDriver } from './driver';
import { PlaceDriverQueryOptions, PlaceDriverShowOptions } from './interfaces';
/**
 * Query the available drivers
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryDrivers(query_params?: PlaceDriverQueryOptions): import('..').QueryResponse<PlaceDriver>;
/**
 * Get the data for a driver
 * @param id ID of the driver to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showDriver(id: string, query_params?: PlaceDriverShowOptions): Promise<PlaceDriver>;
/**
 * Update the driver in the database
 * @param id ID of the driver
 * @param form_data New values for the driver
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateDriver(id: string, form_data: Partial<PlaceDriver>, method?: 'put' | 'patch'): Promise<PlaceDriver>;
/**
 * Add a new driver to the database
 * @param form_data Driver data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addDriver(form_data: Partial<PlaceDriver>): Promise<PlaceDriver>;
/**
 * Remove a driver from the database
 * @param id ID of the driver
 */
export declare function removeDriver(id: string): Promise<import('../utilities/types').HashMap<any>>;
/**
 * Request a recompilation of the driver's code
 * @param id ID of the driver
 */
export declare function recompileDriver(id: string): Promise<any>;
/**
 * Request a reload of the driver's binary
 * @param id ID of the driver
 */
export declare function reloadDriver(id: string): Promise<any>;
/**
 * Query the compiled state of the driver's code
 * @param id ID of the driver
 */
export declare function isDriverCompiled(id: string): Promise<any>;
/**
 * Get the drivers readme file if available
 * @param id ID of the driver
 */
export declare function driverReadme(id: string): Promise<string>;
