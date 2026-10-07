import { PlaceOrganisationOwnerOptions } from '../organisations/interfaces';
import { PlaceResourceQueryOptions } from '../resources/interface';
import { PlaceDomain } from './domain';
/**
 * Query the available domains
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryDomains(query_params?: PlaceResourceQueryOptions & PlaceOrganisationOwnerOptions): import('..').QueryResponse<PlaceDomain>;
/**
 * Get the data for a domain
 * @param id ID of the domain to retrieve
 */
export declare function showDomain(id: string): Promise<PlaceDomain>;
/**
 * Update the domain in the database
 * @param id ID of the domain
 * @param form_data New values for the domain
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 * @param options Organisation to move the domain to (cluster admins only)
 */
export declare function updateDomain(id: string, form_data: Partial<PlaceDomain>, method?: 'put' | 'patch', options?: PlaceOrganisationOwnerOptions): Promise<PlaceDomain>;
/**
 * Add a new domain to the database
 * @param form_data Domain data
 * @param options Organisation that owns the new domain (cluster admins only; defaults to the caller's)
 */
export declare function addDomain(form_data: Partial<PlaceDomain>, options?: PlaceOrganisationOwnerOptions): Promise<PlaceDomain>;
/**
 * Remove a domain from the database
 * @param id ID of the domain
 */
export declare function removeDomain(id: string): Promise<import('../utilities/types').HashMap<any>>;
/**
 * Find the domain associated with a user's email address
 * @param email Email address to lookup
 */
export declare function lookupDomainByEmail(email: string): Promise<string>;
