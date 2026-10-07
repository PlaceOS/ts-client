import { PlaceTriggerQueryOptions, PlaceTriggerShowOptions } from './interfaces';
import { PlaceTrigger } from './trigger';
/**
 * Query the available triggers
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryTriggers(query_params?: PlaceTriggerQueryOptions): import('..').QueryResponse<PlaceTrigger>;
/**
 * Get the data for a trigger
 * @param id ID of the trigger to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showTrigger(id: string, query_params?: PlaceTriggerShowOptions): Promise<PlaceTrigger>;
/**
 * Update the trigger in the database
 * @param id ID of the trigger
 * @param form_data New values for the trigger
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateTrigger(id: string, form_data: Partial<PlaceTrigger>, method?: 'put' | 'patch'): Promise<PlaceTrigger>;
/**
 * Add a new trigger to the database
 * @param form_data Trigger data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addTrigger(form_data: Partial<PlaceTrigger>): Promise<PlaceTrigger>;
/**
 * Remove a trigger from the database
 * @param id ID of the trigger
 */
export declare function removeTrigger(id: string): Promise<import('../utilities/types').HashMap<any>>;
/**
 * List systems that contain instances of a trigger
 * @param id ID of the trigger to grab system instances for
 */
export declare function listTriggerInstances(id: string): Promise<PlaceTrigger[]>;
