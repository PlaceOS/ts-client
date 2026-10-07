import { PlaceOrganisationOwnerOptions } from '../organisations/interfaces';
import { HashMap } from '../utilities/types';
import { PlaceModulePingOptions, PlaceModuleQueryOptions, PlaceModuleShowOptions } from './interfaces';
import { PlaceModule } from './module';
/**
 * Query the available moduels
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryModules(query_params?: PlaceModuleQueryOptions): import('..').QueryResponse<PlaceModule>;
/**
 * Get the data for a module
 * @param id ID of the module to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showModule(id: string, query_params?: PlaceModuleShowOptions): Promise<PlaceModule>;
/**
 * Update the module in the database
 * @param id ID of the module
 * @param form_data New values for the module
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateModule(id: string, form_data: Partial<PlaceModule>, method?: 'put' | 'patch'): Promise<PlaceModule>;
/**
 * Add a new module to the database
 * @param form_data Module data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addModule(form_data: Partial<PlaceModule>, options?: PlaceOrganisationOwnerOptions): Promise<PlaceModule>;
/**
 * Remove a module from the database
 * @param id ID of the module
 */
export declare function removeModule(id: string): Promise<HashMap<any>>;
/**
 * Starts the module with the given ID and clears any existing caches
 * @param id Module ID
 */
export declare function startModule(id: string): Promise<any>;
/**
 * Stops the module with the given ID
 * @param id Module ID
 */
export declare function stopModule(id: string): Promise<any>;
/**
 * Pings the IP address of the module with the given ID
 * @param id Module ID
 */
export declare function pingModule(id: string): Promise<PlaceModulePingOptions>;
/**
 * Get the internal state of the given module
 * @param id Module ID
 * @param lookup Status variable of interest. If set it will return only the state of this variable
 */
export declare function moduleState(id: string): Promise<HashMap>;
/**
 * Get the state of the given module
 * @param id Module ID
 * @param key Status variable of interest. If set it will return only the state of this variable
 */
export declare function lookupModuleState(id: string, key: string): Promise<HashMap>;
/**
 * Manually load module into PlaceOS core. Only use if module should be loaded but isn't present.
 * @param id Module ID
 */
export declare function loadModule(id: string): Promise<HashMap>;
/**
 * Fetch settings of driver associated with the module
 * @param id Module ID
 */
export declare function moduleSettings(id: string): Promise<any>;
/**
 * Get the runtime errors of the given module
 * @param id Module ID
 */
export declare function moduleRuntimeError(id: string): Promise<string[]>;
/**
 * Execute a command on a module
 * @param id Module ID
 * @param method Name of the method to execute
 * @param args Array of arguments to pass to the executed method
 */
export declare function executeOnModule(id: string, method: string, args?: any[]): Promise<HashMap>;
