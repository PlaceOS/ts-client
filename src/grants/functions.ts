import { create, query, remove, show } from '../resources/functions';
import { PlaceGrant } from './grant';
import { PlaceGrantCreatePayload, PlaceGrantQueryOptions } from './interfaces';

/**
 * @private
 */
const PATH = 'grants';

/** Convert raw server data to a grant object */
function process(item: Partial<PlaceGrant>) {
    return new PlaceGrant(item);
}

/**
 * Query grants on a scope or held by a user
 * @param query_params Query parameters to add the to request URL
 */
export function queryGrants(query_params: PlaceGrantQueryOptions = {}) {
    return query({ query_params, fn: process, path: PATH });
}

/**
 * Get the data for a grant
 * @param id ID of the grant to retrieve
 */
export function showGrant(id: string) {
    return show({ id, query_params: {}, fn: process, path: PATH });
}

/**
 * Issue a grant
 * @param form_data Grant data
 */
export function addGrant(form_data: PlaceGrantCreatePayload) {
    return create({ form_data, query_params: {}, fn: process, path: PATH });
}

/**
 * Revoke a grant
 * @param id ID of the grant
 */
export function removeGrant(id: string) {
    return remove({ id, query_params: {}, path: PATH });
}
