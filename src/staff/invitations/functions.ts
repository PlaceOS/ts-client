import { map } from 'rxjs/operators';
import { del, get, patch, post, put } from '../../api';
import { toQueryString } from '../../utilities/api';
import { InvitationQueryOptions, InvitationShowOptions } from './interfaces';
import { SurveyInvitation } from './model';

/**
 * @private
 */
const PATH = '/api/staff/v1/surveys/invitations';

/**
 * Query the available invitations
 * @param query_params Query parameters to add the to request URL
 */
export function queryInvitations(query_params: InvitationQueryOptions = {}) {
    const query = toQueryString(query_params);
    return get(`${PATH}${query ? '?' + query : ''}`).pipe(
        map((l: any) => l.map((_: any) => new SurveyInvitation(_))),
    );
}

/**
 * Get the data for an invitation
 * @param id ID of the surveyinvitation to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showInvitation(
    token: string,
    query_params: InvitationShowOptions = {},
) {
    const query = toQueryString(query_params);
    return get(`${PATH}/${token}${query ? '?' + query : ''}`).pipe(
        map((l: any) => new SurveyInvitation(l)),
    );
}

/**
 * Update the surveyinvitation in the database
 * @param id ID of the invitation
 * @param form_data New values for the invitation
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateInvitation(
    token: string,
    form_data: Partial<SurveyInvitation>,
    method: 'put' | 'patch' = 'patch',
) {
    return (method === 'put' ? put : patch)(`${PATH}/${token}`, form_data).pipe(
        map((l: any) => new SurveyInvitation(l)),
    );
}

/**
 * Add a new surveyinvitation to the database
 * @param form_data SurveyInvitation data
 * @param query_params Query parameters to add the to request URL
 */
export function addInvitation(form_data: Partial<SurveyInvitation>) {
    return post(`${PATH}`, form_data).pipe(
        map((l: any) => new SurveyInvitation(l)),
    );
}

/**
 * Remove an surveyinvitation from the database
 * @param id ID of the invitation
 * @param query_params Query parameters to add the to request URL
 */
export function removeInvitation(
    token: string,
    query_params: Record<string, any> = {},
) {
    const query = toQueryString(query_params);
    return del(`${PATH}/${token}${query ? '?' + query : ''}`);
}
