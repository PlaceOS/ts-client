export class SurveyAnswer {
    id: number;
    question_id: number;
    survey_id: number;
    type: string;
    answer_json: Record<string, any>;

    constructor(_data: Partial<SurveyAnswer>) {
        this.id = _data.id || 0;
        this.question_id = _data.question_id || 0;
        this.survey_id = _data.survey_id || 0;
        this.type = _data.type || '';
        this.answer_json = _data.answer_json || {};
    }
}
