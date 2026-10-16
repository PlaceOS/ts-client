import { create, query, remove, show, update } from '../resources/functions';
import { PlaceResourceQueryOptions } from '../resources/interface';
import { PlacePartner } from './partner';

/**
 * @private
 */
const PATH = 'partners';

/** Convert raw server data to a partner object */
function process(item: Partial<PlacePartner>) {
    return new PlacePartner(item);
}

/**
 * Query the partners within reach. Cluster admins see every partner, everyone
 * else sees their own.
 * @param query_params Query parameters to add the to request URL
 */
export function queryPartners(query_params: PlaceResourceQueryOptions = {}) {
    return query({ query_params, fn: process, path: PATH });
}

/**
 * Get the data for a partner
 * @param id ID of the partner to retrieve
 */
export function showPartner(id: string) {
    return show({ id, query_params: {}, fn: process, path: PATH });
}

/**
 * Update a partner (cluster admins only)
 * @param id ID of the partner
 * @param form_data New values for the partner
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updatePartner(
    id: string,
    form_data: Partial<PlacePartner>,
    method: 'put' | 'patch' = 'patch',
) {
    return update({
        id,
        form_data,
        query_params: {},
        method,
        fn: process,
        path: PATH,
    });
}

/**
 * Add a new partner (cluster admins only)
 * @param form_data Partner data
 */
export function addPartner(form_data: Partial<PlacePartner>) {
    return create({ form_data, query_params: {}, fn: process, path: PATH });
}

/**
 * Remove a partner (cluster admins only). Fails while organisations remain under it.
 * @param id ID of the partner
 */
export function removePartner(id: string) {
    return remove({ id, query_params: {}, path: PATH });
}
