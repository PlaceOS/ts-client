export class SurveyQuestion {
    id: number;
    title: string;
    description?: string;
    type: string;
    options: any;
    required: boolean;
    max_rating: number;
    choices: Array<any>;
    tags: Array<string>;

    constructor(_data: Partial<SurveyQuestion>) {
        this.id = _data.id || 0;
        this.title = _data.title || '';
        this.description = _data.description || '';
        this.type = _data.type || '';
        this.options = _data.options || {};
        this.required = _data.required || false;
        this.max_rating = _data.max_rating || 0;
        this.choices = _data.choices || [];
        this.tags = _data.tags || [];
    }
}
