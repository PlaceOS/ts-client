export declare class SurveyAnswer {
    id: number;
    question_id: number;
    survey_id: number;
    type: string;
    answer_json: Record<string, any>;
    constructor(_data: Partial<SurveyAnswer>);
}
