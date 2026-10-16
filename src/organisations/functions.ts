import { apiEndpoint } from '../auth/functions';
import { get, post } from '../http/functions';
import { PlacePartner } from '../partners/partner';
import { create, query, remove, show, update } from '../resources/functions';
import { HashMap } from '../utilities/types';
import {
    PlaceOrganisationClaimResult,
    PlaceOrganisationQueryOptions,
    PlaceOrganisationWriteOptions,
    PlaceReach,
} from './interfaces';
import { PlaceOrganisation } from './organisation';

/**
 * @private
 */
const PATH = 'organisations';

/** Convert raw server data to an organisation object */
function process(item: Partial<PlaceOrganisation>) {
    return new PlaceOrganisation(item);
}

/**
 * Query the organisations within reach
 * @param query_params Query parameters to add the to request URL
 */
export function queryOrganisations(
    query_params: PlaceOrganisationQueryOptions = {},
) {
    return query({ query_params, fn: process, path: PATH });
}

/**
 * Get the data for an organisation
 * @param id ID of the organisation to retrieve
 */
export function showOrganisation(id: string) {
    return show({ id, query_params: {}, fn: process, path: PATH });
}

/**
 * Update an organisation (cluster admins only)
 * @param id ID of the organisation
 * @param form_data New values for the organisation
 * @param options Payer and partner staff flags
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateOrganisation(
    id: string,
    form_data: Partial<PlaceOrganisation>,
    options: PlaceOrganisationWriteOptions = {},
    method: 'put' | 'patch' = 'patch',
) {
    return update({
        id,
        form_data,
        query_params: options,
        method,
        fn: process,
        path: PATH,
    });
}

/**
 * Add a new organisation (cluster admins only)
 * @param form_data Organisation data
 * @param options Payer and partner staff flags
 */
export function addOrganisation(
    form_data: Partial<PlaceOrganisation>,
    options: PlaceOrganisationWriteOptions = {},
) {
    return create({ form_data, query_params: options, fn: process, path: PATH });
}

/**
 * Remove an organisation (cluster admins only). Fails while domains or estate remain under it.
 * @param id ID of the organisation
 */
export function removeOrganisation(id: string) {
    return remove({ id, query_params: {}, path: PATH });
}

/**
 * What the signed-in user can reach: the level, their own organisation and
 * partner, and the organisations in reach
 */
export function currentReach(): Promise<PlaceReach> {
    const url = `${apiEndpoint()}/${PATH}/current`;
    return get(url).then((resp: HashMap) => ({
        reach: resp.reach || 'organisation',
        enforcing: !!resp.enforcing,
        organisation: resp.organisation ? process(resp.organisation) : null,
        partner: resp.partner ? new PlacePartner(resp.partner) : null,
        organisations: resp.organisations
            ? (resp.organisations as HashMap[]).map(process)
            : null,
    }));
}

/**
 * Assign unowned zone trees, with their systems and modules, to an organisation (cluster admins only)
 * @param id ID of the organisation
 * @param zone_ids Root zone IDs to claim
 */
export function claimZonesForOrganisation(
    id: string,
    zone_ids: string[],
): Promise<PlaceOrganisationClaimResult> {
    const url = `${apiEndpoint()}/${PATH}/${encodeURIComponent(id)}/claim`;
    return post(url, { zone_ids }).then(
        (resp: HashMap) => resp as PlaceOrganisationClaimResult,
    );
}
