import { SurveyQueryOptions, SurveyShowOptions } from './interfaces';
import { Survey } from './model';
/**
 * Query the available surveys
 * @param query_params Query parameters to add the to request URL
 */
export declare function querySurveys(query_params?: SurveyQueryOptions): Promise<any>;
/**
 * Get the data for an survey
 * @param id ID of the survey to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showSurvey(id: string, query_params?: SurveyShowOptions): Promise<Survey>;
/**
 * Update the survey in the database
 * @param id ID of the survey
 * @param form_data New values for the survey
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateSurvey(id: string, form_data: Partial<Survey>, method?: 'put' | 'patch'): Promise<Survey>;
/**
 * Add a new survey to the database
 * @param form_data Survey data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addSurvey(form_data: Partial<Survey>): Promise<Survey>;
/**
 * Remove an survey from the database
 * @param id ID of the survey
 * @param query_params Query parameters to add the to request URL
 */
export declare function removeSurvey(id: string, query_params?: Record<string, any>): Promise<import('../../utilities/types').HashMap<any>>;
