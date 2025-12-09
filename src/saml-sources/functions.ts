import { PlaceAuthSourceQueryOptions } from '../auth-sources/interfaces';
import { create, query, remove, show, update } from '../resources/functions';
import { PlaceSAMLSource } from './saml-source';

/**
 * @private
 */
const PATH = 'saml_auths';

/** Convert raw server data to an SAML source object */
function process(item: Partial<PlaceSAMLSource>) {
    return new PlaceSAMLSource(item);
}

/**
 * Query the available SAML sources
 * @param query_params Query parameters to add the to request URL
 */
export function querySAMLSources(
    query_params: PlaceAuthSourceQueryOptions = {},
) {
    return query({ query_params, fn: process, path: PATH });
}

/**
 * Get the data for a SAML source
 * @param id ID of the SAML source to retrieve
 */
export function showSAMLSource(id: string) {
    return show({ id, query_params: {}, fn: process, path: PATH });
}

/**
 * Update the SAML source in the database
 * @param id ID of the SAML source
 * @param form_data New values for the SAML source
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateSAMLSource(
    id: string,
    form_data: Partial<PlaceSAMLSource>,
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
 * Add a new SAML source to the database
 * @param form_data SAML source data
 * @param query_params Query parameters to add the to request URL
 */
export function addSAMLSource(form_data: Partial<PlaceSAMLSource>) {
    return create({ form_data, query_params: {}, fn: process, path: PATH });
}

/**
 * Remove a SAML source from the database
 * @param id ID of the SAML source
 */
export function removeSAMLSource(id: string) {
    return remove({ id, query_params: {}, path: PATH });
}
