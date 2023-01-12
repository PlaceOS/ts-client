export class SurveyQuestion {
    id: number;
    title: string;
    description: string;
    type: string;
    question_json: Record<string, any>;

    constructor(_data: Partial<SurveyQuestion>) {
        this.id = _data.id || 0;
        this.title = _data.title || '';
        this.description = _data.description || '';
        this.type = _data.type || '';
        this.question_json = _data.question_json || {};
    }
}
