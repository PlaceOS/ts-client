import { HashMap } from '../utilities/types';
import { PlaceSettingsHistoryOptions, PlaceSettingsQueryOptions } from './interfaces';
import { PlaceSettings } from './settings';
/**
 * Query the available settings
 * @param query_params Query parameters to add the to request URL
 */
export declare function querySettings(query_params?: PlaceSettingsQueryOptions): import('..').QueryResponse<PlaceSettings>;
/**
 * Get the data for settings
 * @param id ID of the settings to retrieve
 */
export declare function showSettings(id: string): Promise<PlaceSettings>;
/**
 * Update the settings in the database
 * @param id ID of the settings
 * @param form_data New values for the settings
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateSettings(id: string, form_data: Partial<PlaceSettings>, query_params?: HashMap, method?: 'put' | 'patch'): Promise<PlaceSettings>;
/**
 * Add a new settings to the database
 * @param form_data Settings data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addSettings(form_data: Partial<PlaceSettings>, query_params?: HashMap): Promise<PlaceSettings>;
/**
 * Remove settings from the database
 * @param id ID of the settings
 */
export declare function removeSettings(id: string): Promise<HashMap<any>>;
/**
 * Get historical versions of settings
 * @param id ID of the settings to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function settingsHistory(id: string, query_params?: PlaceSettingsHistoryOptions): Promise<PlaceSettings[]>;
