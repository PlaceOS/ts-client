import { PlaceApplication } from './application';
import { PlaceApplicationQueryOptions } from './interfaces';
/**
 * Query the available applications
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryApplications(query_params?: PlaceApplicationQueryOptions): import('..').QueryResponse<PlaceApplication>;
/**
 * Get the data for an application
 * @param id ID of the application to retrieve
 */
export declare function showApplication(id: string): Promise<PlaceApplication>;
/**
 * Update the application in the database
 * @param id ID of the application
 * @param form_data New values for the application
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateApplication(id: string, form_data: Partial<PlaceApplication>, method?: 'put' | 'patch'): Promise<PlaceApplication>;
/**
 * Add a new application to the database
 * @param form_data Application data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addApplication(form_data: Partial<PlaceApplication>): Promise<PlaceApplication>;
/**
 * Remove an application from the database
 * @param id ID of the application
 */
export declare function removeApplication(id: string): Promise<import('../utilities/types').HashMap<any>>;
