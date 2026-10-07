import { PlaceGrant } from './grant';
import { PlaceGrantCreatePayload, PlaceGrantQueryOptions } from './interfaces';
/**
 * Query grants on a scope or held by a user
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryGrants(query_params?: PlaceGrantQueryOptions): import('..').QueryResponse<PlaceGrant>;
/**
 * Get the data for a grant
 * @param id ID of the grant to retrieve
 */
export declare function showGrant(id: string): Promise<PlaceGrant>;
/**
 * Issue a grant
 * @param form_data Grant data
 */
export declare function addGrant(form_data: PlaceGrantCreatePayload): Promise<PlaceGrant>;
/**
 * Revoke a grant
 * @param id ID of the grant
 */
export declare function removeGrant(id: string): Promise<import('../utilities/types').HashMap<any>>;
