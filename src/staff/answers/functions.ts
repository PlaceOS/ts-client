import { map } from 'rxjs/operators';
import { get, post } from '../../api';
import { toQueryString } from '../../utilities/api';
import { AnswerQueryOptions } from './interfaces';
import { SurveyAnswer } from './model';

/**
 * @private
 */
const PATH = '/api/staff/v1/surveys/answers';

/**
 * Query the available answers
 * @param query_params Query parameters to add the to request URL
 */
export function queryAnswers(query_params: AnswerQueryOptions = {}) {
    const query = toQueryString(query_params);
    return get(`${PATH}${query ? '?' + query : ''}`).pipe(
        map((l: any) => l.map((_: any) => new SurveyAnswer(_))),
    );
}

/**
 * Add a new answer to the database
 * @param form_data Answer data
 * @param query_params Query parameters to add the to request URL
 */
export function addAnswer(form_data: Partial<SurveyAnswer>[]) {
    return post(`${PATH}`, form_data).pipe(
        map((l: any) => l.map((_: any) => new SurveyAnswer(_))),
    );
}
