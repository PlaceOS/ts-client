import { HashMap } from '../utilities/types';
import { PlaceOrganisationClaimResult, PlaceOrganisationQueryOptions, PlaceOrganisationWriteOptions, PlaceReach } from './interfaces';
import { PlaceOrganisation } from './organisation';
/**
 * Query the organisations within reach
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryOrganisations(query_params?: PlaceOrganisationQueryOptions): import('..').QueryResponse<PlaceOrganisation>;
/**
 * Get the data for an organisation
 * @param id ID of the organisation to retrieve
 */
export declare function showOrganisation(id: string): Promise<PlaceOrganisation>;
/**
 * Update an organisation (cluster admins only)
 * @param id ID of the organisation
 * @param form_data New values for the organisation
 * @param options Payer and partner staff flags
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateOrganisation(id: string, form_data: Partial<PlaceOrganisation>, options?: PlaceOrganisationWriteOptions, method?: 'put' | 'patch'): Promise<PlaceOrganisation>;
/**
 * Add a new organisation (cluster admins only)
 * @param form_data Organisation data
 * @param options Payer and partner staff flags
 */
export declare function addOrganisation(form_data: Partial<PlaceOrganisation>, options?: PlaceOrganisationWriteOptions): Promise<PlaceOrganisation>;
/**
 * Remove an organisation (cluster admins only). Fails while domains or estate remain under it.
 * @param id ID of the organisation
 */
export declare function removeOrganisation(id: string): Promise<HashMap<any>>;
/**
 * What the signed-in user can reach: the level, their own organisation and
 * partner, and the organisations in reach
 */
export declare function currentReach(): Promise<PlaceReach>;
/**
 * Assign unowned zone trees, with their systems and modules, to an organisation (cluster admins only)
 * @param id ID of the organisation
 * @param zone_ids Root zone IDs to claim
 */
export declare function claimZonesForOrganisation(id: string, zone_ids: string[]): Promise<PlaceOrganisationClaimResult>;
