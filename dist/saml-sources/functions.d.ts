import { PlaceAuthSourceQueryOptions } from '../auth-sources/interfaces';
import { PlaceSAMLSource } from './saml-source';
/**
 * Query the available SAML sources
 * @param query_params Query parameters to add the to request URL
 */
export declare function querySAMLSources(query_params?: PlaceAuthSourceQueryOptions): import('..').QueryResponse<PlaceSAMLSource>;
/**
 * Get the data for a SAML source
 * @param id ID of the SAML source to retrieve
 */
export declare function showSAMLSource(id: string): Promise<PlaceSAMLSource>;
/**
 * Update the SAML source in the database
 * @param id ID of the SAML source
 * @param form_data New values for the SAML source
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateSAMLSource(id: string, form_data: Partial<PlaceSAMLSource>, method?: 'put' | 'patch'): Promise<PlaceSAMLSource>;
/**
 * Add a new SAML source to the database
 * @param form_data SAML source data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addSAMLSource(form_data: Partial<PlaceSAMLSource>): Promise<PlaceSAMLSource>;
/**
 * Remove a SAML source from the database
 * @param id ID of the SAML source
 */
export declare function removeSAMLSource(id: string): Promise<import('../utilities/types').HashMap<any>>;
