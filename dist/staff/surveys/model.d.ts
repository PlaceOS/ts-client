export declare class Survey {
    readonly id: number;
    readonly title: string;
    readonly description?: string;
    readonly trigger: string;
    readonly building_id: string;
    readonly zone_id: string;
    readonly pages: SurveyPage[];
    constructor(_data: Partial<Survey>);
}
export interface SurveyPage {
    title: string;
    description?: string;
    question_order: number[];
}
