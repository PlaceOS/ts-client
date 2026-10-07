import { PlaceSettings } from '../settings/settings';
import { PlaceTrigger } from '../triggers/trigger';
import { HashMap } from '../utilities/types';
import { PlaceZone } from '../zones/zone';
import { PlaceModuleFunctionMap, PlaceSystemControlOptions, PlaceSystemMetadataOptions, PlaceSystemModuleTypes, PlaceSystemShowOptions, PlaceSystemsQueryOptions, PlaceSystemStartStopOptions, PlaceSystemsWithEmailsOptions, PlaceSystemTriggerShowOptions, PlaceSystemTriggersQueryOptions } from './interfaces';
import { PlaceSystem } from './system';
/**
 * Query the available systems
 * @param query_params Query parameters to add the to request URL
 */
export declare function querySystems(query_params?: PlaceSystemsQueryOptions): import('..').QueryResponse<PlaceSystem>;
/**
 * Query the available systems by email addresses
 * @param query_params Query parameters to add the to request URL
 */
export declare function querySystemsWithEmails(query_params: PlaceSystemsWithEmailsOptions): import('..').QueryResponse<PlaceSystem>;
/**
 * Get the data for a system
 * @param id ID of the system to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showSystem(id: string, query_params?: PlaceSystemShowOptions): Promise<PlaceSystem>;
/**
 * Update the system in the database
 * @param id ID of the system
 * @param form_data New values for the system
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateSystem(id: string, form_data: Partial<PlaceSystem>, method?: 'put' | 'patch'): Promise<PlaceSystem>;
/**
 * Add a new system to the database
 * @param form_data System data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addSystem(form_data: Partial<PlaceSystem>): Promise<PlaceSystem>;
/**
 * Remove a system from the database
 * @param id ID of the system
 */
export declare function removeSystem(id: string): Promise<HashMap<any>>;
/**
 * Add module to the given system
 * @param id System ID
 * @param module_id ID of the module to add
 */
export declare function addSystemModule(id: string, module_id: string, data?: HashMap): Promise<PlaceSystem>;
/**
 * Remove module from the given system
 * @param id System ID
 * @param module_id ID of the module to remove
 */
export declare function removeSystemModule(id: string, module_id: string): Promise<PlaceSystem>;
/**
 * Start the given system and clears any existing caches
 * @param id System ID
 * @param query_params Query parameters to add the to request URL
 */
export declare function startSystem(id: string, query_params?: PlaceSystemStartStopOptions): Promise<void>;
/**
 * Stops all modules in the given system
 * @param id System ID
 * @param query_params Query parameters to add the to request URL
 */
export declare function stopSystem(id: string, query_params?: PlaceSystemStartStopOptions): Promise<void>;
/**
 * Execute a function of the given system module
 * @param id System ID
 * @param method Name of the function to execute
 * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
 * @param index Module index. Defaults to `1`
 * @param args Array of arguments to pass to the executed method
 */
export declare function executeOnSystem(id: string, method: string, module: string, index?: number, args?: any[]): Promise<HashMap>;
/**
 * Get the state of the given system module
 * @param id System ID
 * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
 * @param index Module index. Defaults to `1`
 * @param lookup Status variable of interest. If set it will return only the state of this variable
 */
export declare function systemModuleState(id: string, module: string, index?: number): Promise<HashMap>;
/**
 * Get the state of the given system module
 * @param id System ID
 * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
 * @param index Module index. Defaults to `1`
 * @param lookup Status variable of interest. If set it will return only the state of this variable
 */
export declare function lookupSystemModuleState(id: string, module: string, index: number | undefined, lookup: string): Promise<HashMap>;
/**
 * Get the list of functions for the given system module
 * @param id System ID
 * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
 * @param index Module index. Defaults to `1`
 */
export declare function functionList(id: string, module: string, index?: number): Promise<PlaceModuleFunctionMap>;
/**
 * Occurances of a particular type of module in the given system
 * @param id System ID
 * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
 */
export declare function moduleCount(id: string, module: string): Promise<{
    count: number;
}>;
/**
 * List types of modules and counts in the given system
 * @param id System ID
 */
export declare function moduleTypes(id: string): Promise<HashMap<number>>;
/** List types of modules and counts in the given system */
export declare function systemModuleTypes(id: string): Promise<PlaceSystemModuleTypes>;
/**
 * Get list of Zones for system
 * @param id System ID
 */
export declare function listSystemZones(id: string): import('..').QueryResponse<PlaceZone>;
/**
 * Get list of triggers for system
 * @param id System ID
 * @param query_params Query parameters to add the to request URL
 */
export declare function listSystemTriggers(id: string, query_params?: PlaceSystemTriggersQueryOptions): import('..').QueryResponse<PlaceTrigger>;
/**
 * Get list of triggers for system
 * @param id System ID
 * @param data Values for trigger properties
 */
export declare function addSystemTrigger(id: string, data: Partial<PlaceTrigger>): Promise<PlaceTrigger>;
/**
 * Remove trigger from system
 * @param id System ID
 * @param trigger_id ID of the trigger
 */
export declare function removeSystemTrigger(id: string, trigger_id: string): Promise<void>;
/**
 * Fetch settings of modules, zones and drivers associated with the system
 * @param id System ID
 */
export declare function systemSettings(id: string): Promise<PlaceSettings[]>;
/**
 * Get the websocket API endpoint URL for system control.
 * @param query_params Query parameters to add to the URL
 */
export declare function systemControlUrl(query_params?: PlaceSystemControlOptions): string;
/**
 * Get metadata for the system
 * @param id System ID
 * @param query_params Query parameters to add to the request
 */
export declare function systemMetadata(id: string, query_params?: PlaceSystemMetadataOptions): Promise<HashMap>;
/**
 * Get a particular trigger instance
 * @param sys_id System ID
 * @param trig_id Trigger ID
 * @param query_params Query parameters to add to the request
 */
export declare function showSystemTrigger(sys_id: string, trig_id: string, query_params?: PlaceSystemTriggerShowOptions): Promise<PlaceTrigger>;
/**
 * Update the details of a trigger instance
 * @param sys_id System ID
 * @param trig_id Trigger ID
 * @param data Values for trigger properties
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateSystemTrigger(sys_id: string, trig_id: string, data: Partial<PlaceTrigger>, method?: 'put' | 'patch'): Promise<PlaceTrigger>;
