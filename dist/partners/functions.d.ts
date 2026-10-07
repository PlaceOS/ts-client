import { PlaceResourceQueryOptions } from '../resources/interface';
import { PlacePartner } from './partner';
/**
 * Query the partners within reach. Cluster admins see every partner, everyone
 * else sees their own.
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryPartners(query_params?: PlaceResourceQueryOptions): import('..').QueryResponse<PlacePartner>;
/**
 * Get the data for a partner
 * @param id ID of the partner to retrieve
 */
export declare function showPartner(id: string): Promise<PlacePartner>;
/**
 * Update a partner (cluster admins only)
 * @param id ID of the partner
 * @param form_data New values for the partner
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updatePartner(id: string, form_data: Partial<PlacePartner>, method?: 'put' | 'patch'): Promise<PlacePartner>;
/**
 * Add a new partner (cluster admins only)
 * @param form_data Partner data
 */
export declare function addPartner(form_data: Partial<PlacePartner>): Promise<PlacePartner>;
/**
 * Remove a partner (cluster admins only). Fails while organisations remain under it.
 * @param id ID of the partner
 */
export declare function removePartner(id: string): Promise<import('../utilities/types').HashMap<any>>;
