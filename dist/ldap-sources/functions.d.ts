import { PlaceAuthSourceQueryOptions } from '../auth-sources/interfaces';
import { PlaceLDAPSource } from './ldap-source';
/**
 * Query the available LDAP sources
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryLDAPSources(query_params?: PlaceAuthSourceQueryOptions): import('..').QueryResponse<PlaceLDAPSource>;
/**
 * Get the data for an LDAP source
 * @param id ID of the LDAP source to retrieve
 */
export declare function showLDAPSource(id: string): Promise<PlaceLDAPSource>;
/**
 * Update the LDAP source in the database
 * @param id ID of the LDAP source
 * @param form_data New values for the LDAP source
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateLDAPSource(id: string, form_data: Partial<PlaceLDAPSource>, method?: 'put' | 'patch'): Promise<PlaceLDAPSource>;
/**
 * Add a new LDAP source to the database
 * @param form_data LDAP source data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addLDAPSource(form_data: Partial<PlaceLDAPSource>): Promise<PlaceLDAPSource>;
/**
 * Remove an LDAP source from the database
 * @param id ID of the LDAP source
 */
export declare function removeLDAPSource(id: string): Promise<import('../utilities/types').HashMap<any>>;
