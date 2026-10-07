import { HashMap } from '../utilities/types';
import { PlaceMetadataBulkOptions, PlaceMetadataDeleteOptions, PlaceMetadataHistoryOptions, PlaceMetadataOptions, PlaceMetadataRenamePayload, PlaceZoneMetadataOptions } from './interfaces';
import { PlaceMetadata } from './metadata';
import { PlaceZoneMetadata } from './zone-metadata';
/**
 * List the metadata for a database item
 * @param id ID of the item to retrieve metadata
 * @param query_params Query parameters to add the to request URL.
 */
export declare function listMetadata(id: string, query_params?: PlaceMetadataOptions): Promise<PlaceMetadata[]>;
/**
 * List the metadata history for a database item
 * @param id ID of the item to retrieve metadata
 * @param query_params Query parameters to add to the request URL.
 */
export declare function listMetadataHistory(id: string, query_params?: PlaceMetadataHistoryOptions): Promise<PlaceMetadata[]>;
/**
 * Get a metadata field for a database item
 * @param id ID of the item to retrieve metadata
 * @param name Name of the metadata field to retrieve
 */
export declare function showMetadata(id: string, name: string): Promise<PlaceMetadata>;
/**
 * Update the metadata in the database
 * @param id ID of the item associated with the metadata
 * @param form_data New values for the metadata
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateMetadata(id: string, form_data: Partial<PlaceMetadata>, method?: 'put' | 'patch'): Promise<PlaceMetadata>;
export declare function addMetadata(form_data: Partial<PlaceMetadata>): Promise<PlaceMetadata>;
/**
 * Remove metadata from the database
 * @param id ID of the item associated with the metadata
 * @param query_params Query parameters including the metadata key name (required)
 */
export declare function removeMetadata(id: string, query_params: PlaceMetadataDeleteOptions): Promise<HashMap<any>>;
/**
 * Rename a metadata key on the given parent resource
 * @param id ID of the item associated with the metadata
 * @param form_data Current and new metadata key names
 */
export declare function renameMetadata(id: string, form_data: PlaceMetadataRenamePayload): Promise<PlaceMetadata>;
/**
 * Query metadata of associated child items
 * @param id ID of the item to get associated child metadata
 * @param query_params Query parameters to add the to request URL
 */
export declare function listChildMetadata(id: string, query_params: PlaceZoneMetadataOptions): Promise<PlaceZoneMetadata[]>;
/** Fetch metadata with a specific name for multiple resources */
export declare function bulkMetadata(name: string, query_params: PlaceMetadataBulkOptions): Promise<Record<string, PlaceMetadata>>;
