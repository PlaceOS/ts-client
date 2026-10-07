import { AnswerQueryOptions } from './interfaces';
import { SurveyAnswer } from './model';
/**
 * Query the available answers
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryAnswers(query_params?: AnswerQueryOptions): Promise<any>;
/**
 * Add a new answer to the database
 * @param form_data Answer data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addAnswer(form_data: Partial<SurveyAnswer>[]): Promise<any>;
