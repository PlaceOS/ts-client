import { PlaceAuthSourceQueryOptions } from '../auth-sources/interfaces';
import { PlaceOAuthSource } from './oauth-source';
/**
 * Query the available OAuth sources
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryOAuthSources(query_params?: PlaceAuthSourceQueryOptions): import('..').QueryResponse<PlaceOAuthSource>;
/**
 * Get the data for an OAuth source
 * @param id ID of the OAuth source to retrieve
 */
export declare function showOAuthSource(id: string): Promise<PlaceOAuthSource>;
/**
 * Update the OAuth source in the database
 * @param id ID of the OAuth source
 * @param form_data New values for the OAuth source
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateOAuthSource(id: string, form_data: Partial<PlaceOAuthSource>, method?: 'put' | 'patch'): Promise<PlaceOAuthSource>;
/**
 * Add a new OAuth source to the database
 * @param form_data OAuth source data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addOAuthSource(form_data: Partial<PlaceOAuthSource>): Promise<PlaceOAuthSource>;
/**
 * Remove an OAuth source from the database
 * @param id ID of the OAuth source
 */
export declare function removeOAuthSource(id: string): Promise<import('../utilities/types').HashMap<any>>;
