import { InvitationQueryOptions, InvitationShowOptions } from './interfaces';
import { SurveyInvitation } from './model';
/**
 * Query the available invitations
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryInvitations(query_params?: InvitationQueryOptions): Promise<any>;
/**
 * Get the data for an invitation
 * @param id ID of the surveyinvitation to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showInvitation(token: string, query_params?: InvitationShowOptions): Promise<SurveyInvitation>;
/**
 * Update the surveyinvitation in the database
 * @param id ID of the invitation
 * @param form_data New values for the invitation
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateInvitation(token: string, form_data: Partial<SurveyInvitation>, method?: 'put' | 'patch'): Promise<SurveyInvitation>;
/**
 * Add a new surveyinvitation to the database
 * @param form_data SurveyInvitation data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addInvitation(form_data: Partial<SurveyInvitation>): Promise<SurveyInvitation>;
/**
 * Remove an surveyinvitation from the database
 * @param id ID of the invitation
 * @param query_params Query parameters to add the to request URL
 */
export declare function removeInvitation(token: string, query_params?: Record<string, any>): Promise<import('../../utilities/types').HashMap<any>>;
