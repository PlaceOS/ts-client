import { PlaceOrganisationOwnerOptions } from '../organisations/interfaces';
import { PlaceResourceQueryOptions } from '../resources/interface';
import { PlaceTrigger } from '../triggers/trigger';
import { HashMap } from '../utilities/types';
import { PlaceZoneMetadataQueryOptions, PlaceZoneQueryOptions, PlaceZoneShowOptions } from './interfaces';
import { PlaceZone } from './zone';
/**
 * Query the available applications
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryZones(query_params?: PlaceZoneQueryOptions): import('..').QueryResponse<PlaceZone>;
/**
 * List the set of tags on the existing zones
 * @param query_params
 */
export declare function listZoneTags(query_params?: PlaceZoneQueryOptions): Promise<string[]>;
/**
 * Get the data for an application
 * @param id ID of the application to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showZone(id: string, query_params?: PlaceZoneShowOptions): Promise<PlaceZone>;
/**
 * Update the application in the database
 * @param id ID of the application
 * @param form_data New values for the application
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateZone(id: string, form_data: Partial<PlaceZone>, method?: 'put' | 'patch'): Promise<PlaceZone>;
/**
 * Add a new application to the database
 * @param form_data Application data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addZone(form_data: Partial<PlaceZone>, options?: PlaceOrganisationOwnerOptions): Promise<PlaceZone>;
/**
 * Remove a zone from the database
 * @param id ID of the zone
 */
export declare function removeZone(id: string): Promise<HashMap<any>>;
/**
 * Query the triggers for a zone
 * @param id ID of the zone
 * @param query_params Query parameters to add the to request URL
 */
export declare function listZoneTriggers(id: string, query_params?: PlaceResourceQueryOptions): import('..').QueryResponse<PlaceTrigger>;
/**
 * Execute a function of the system's module under a given zone
 * @param id Zone ID
 * @param method Name of the function to execute
 * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
 * @param index Module index. Defaults to `1`
 * @param args Array of arguments to pass to the executed method
 */
export declare function executeOnZone(id: string, method: string, module: string, index?: number, args?: any[]): Promise<HashMap>;
/**
 * Get metadata associated with the selected zone
 * @param id Zone ID
 * @param query_params Query parameters to add to the request
 */
export declare function zoneMetadata(id: string, query_params?: PlaceZoneMetadataQueryOptions): Promise<HashMap>;
