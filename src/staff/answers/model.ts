export class SurveyAnswer {
    id: number;
    question_id: number;
    survey_id: number;
    answer_text: string;
    answer_json: Record<string, any>;

    constructor(_data: Partial<SurveyAnswer>) {
        this.id = _data.id || 0;
        this.question_id = _data.id || 0;
        this.survey_id = _data.survey_id || 0;
        this.answer_text = _data.answer_text || '';
        this.answer_json = _data.answer_json || {};
    }
}
