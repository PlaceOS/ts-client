export declare class SurveyQuestion {
    id: number;
    title: string;
    description?: string;
    type: string;
    options: any;
    required: boolean;
    max_rating: number;
    choices: Array<any>;
    tags: Array<string>;
    deleted: boolean;
    constructor(_data: Partial<SurveyQuestion>);
}
