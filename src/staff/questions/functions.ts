import { map } from 'rxjs/operators';
import { del, get, patch, post, put } from '../../api';
import { toQueryString } from '../../utilities/api';
import { QuestionQueryOptions, QuestionShowOptions } from './interfaces';
import { SurveyQuestion } from './model';

/**
 * @private
 */
const PATH = '/api/staff/v1/surveys/questions';

/**
 * Query the available questions
 * @param query_params Query parameters to add the to request URL
 */
export function queryQuestions(query_params: QuestionQueryOptions = {}) {
    const query = toQueryString(query_params);
    return get(`${PATH}${query ? '?' + query : ''}`).pipe(
        map((l: any) => l.map((_: any) => new SurveyQuestion(_))),
    );
}

/**
 * Get the data for an question
 * @param id ID of the surveyquestion to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showQuestion(
    id: string,
    query_params: QuestionShowOptions = {},
) {
    const query = toQueryString(query_params);
    return get(`${PATH}/${id}${query ? '?' + query : ''}`).pipe(
        map((l: any) => new SurveyQuestion(l)),
    );
}

/**
 * Add a new surveyquestion to the database
 * @param form_data SurveyQuestion data
 * @param query_params Query parameters to add the to request URL
 */
export function addQuestion(form_data: Partial<SurveyQuestion>) {
    return post(`${PATH}`, form_data).pipe(
        map((l: any) => new SurveyQuestion(l)),
    );
}

/**
 * Update the question in the database
 * @param id ID of the question
 * @param form_data New values for the question
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateQuestion(
    id: string,
    form_data: Partial<SurveyQuestion>,
    method: 'put' | 'patch' = 'patch',
) {
    return (method === 'put' ? put : patch)(`${PATH}/${id}`, form_data).pipe(
        map((l: any) => new SurveyQuestion(l)),
    );
}

/**
 * Remove an surveyquestion from the database
 * @param id ID of the question
 * @param query_params Query parameters to add the to request URL
 */
export function removeQuestion(
    id: string,
    query_params: Record<string, any> = {},
) {
    const query = toQueryString(query_params);
    return del(`${PATH}/${id}${query ? '?' + query : ''}`);
}
