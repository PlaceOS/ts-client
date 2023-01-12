import { map } from 'rxjs/operators';
import { del, get, patch, post, put } from 'src/api';
import { toQueryString } from 'src/utilities/api';
import { SurveyQueryOptions, SurveyShowOptions } from './interfaces';
import { Survey } from './model';

/**
 * @private
 */
const PATH = '/api/staff/v1/surveys';

/**
 * Query the available surveys
 * @param query_params Query parameters to add the to request URL
 */
export function querySurveys(query_params: SurveyQueryOptions = {}) {
    const query = toQueryString(query_params);
    return get(`${PATH}${query ? '?' + query : ''}`).pipe(
        map((l: any) => l.map((_: any) => new Survey(_)))
    );
}

/**
 * Get the data for an survey
 * @param id ID of the survey to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showSurvey(id: string, query_params: SurveyShowOptions = {}) {
    const query = toQueryString(query_params);
    return get(`${PATH}/${id}${query ? '?' + query : ''}`).pipe(
        map((l: any) => new Survey(l))
    );
}

/**
 * Update the survey in the database
 * @param id ID of the survey
 * @param form_data New values for the survey
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateSurvey(
    id: string,
    form_data: Partial<Survey>,
    method: 'put' | 'patch' = 'patch'
) {
    return (method === 'put' ? put : patch)(`${PATH}/${id}`, form_data).pipe(
        map((l: any) => new Survey(l))
    );
}

/**
 * Add a new survey to the database
 * @param form_data Survey data
 * @param query_params Query parameters to add the to request URL
 */
export function addSurvey(form_data: Partial<Survey>) {
    return post(`${PATH}`, form_data).pipe(
        map((l: any) => l.map((_: any) => new Survey(_)))
    );
}

/**
 * Remove an survey from the database
 * @param id ID of the survey
 * @param query_params Query parameters to add the to request URL
 */
export function removeSurvey(
    id: string,
    query_params: Record<string, any> = {}
) {
    const query = toQueryString(query_params);
    return del(`${PATH}/${id}${query ? '?' + query : ''}`);
}
