import { QuestionQueryOptions, QuestionShowOptions } from './interfaces';
import { SurveyQuestion } from './model';
/**
 * Query the available questions
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryQuestions(query_params?: QuestionQueryOptions): Promise<any>;
/**
 * Get the data for an question
 * @param id ID of the surveyquestion to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showQuestion(id: string, query_params?: QuestionShowOptions): Promise<SurveyQuestion>;
/**
 * Add a new surveyquestion to the database
 * @param form_data SurveyQuestion data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addQuestion(form_data: Partial<SurveyQuestion>): Promise<SurveyQuestion>;
/**
 * Update the question in the database
 * @param id ID of the question
 * @param form_data New values for the question
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateQuestion(id: string, form_data: Partial<SurveyQuestion>, method?: 'put' | 'patch'): Promise<SurveyQuestion>;
/**
 * Remove an surveyquestion from the database
 * @param id ID of the question
 * @param query_params Query parameters to add the to request URL
 */
export declare function removeQuestion(id: string, query_params?: Record<string, any>): Promise<import('../../utilities/types').HashMap<any>>;
