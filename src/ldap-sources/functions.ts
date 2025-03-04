import { PlaceAuthSourceQueryOptions } from '../auth-sources/interfaces';
import { create, query, remove, show, update } from '../resources/functions';
import { HashMap } from '../utilities/types';
import { PlaceLDAPSource } from './ldap-source';

/**
 * @private
 */
const PATH = 'ldap_auths';

/** Convert raw server data to an LDAP source object */
function process(item: Partial<PlaceLDAPSource>) {
    return new PlaceLDAPSource(item);
}

/**
 * Query the available LDAP sources
 * @param query_params Query parameters to add the to request URL
 */
export function queryLDAPSources(
    query_params: PlaceAuthSourceQueryOptions = {},
) {
    return query({ query_params, fn: process, path: PATH });
}

/**
 * Get the data for an LDAP source
 * @param id ID of the LDAP source to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showLDAPSource(id: string, query_params: HashMap = {}) {
    return show({ id, query_params, fn: process, path: PATH });
}

/**
 * Update the LDAP source in the database
 * @param id ID of the LDAP source
 * @param form_data New values for the LDAP source
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateLDAPSource(
    id: string,
    form_data: Partial<PlaceLDAPSource>,
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
 * Add a new LDAP source to the database
 * @param form_data LDAP source data
 * @param query_params Query parameters to add the to request URL
 */
export function addLDAPSource(form_data: Partial<PlaceLDAPSource>) {
    return create({ form_data, query_params: {}, fn: process, path: PATH });
}

/**
 * Remove an LDAP source from the database
 * @param id ID of the LDAP source
 * @param query_params Query parameters to add the to request URL
 */
export function removeLDAPSource(id: string, query_params: HashMap = {}) {
    return remove({ id, query_params, path: PATH });
}
