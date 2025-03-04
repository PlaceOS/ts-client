export class Survey {
    public readonly id: number;
    public readonly title: string;
    public readonly description?: string;
    public readonly trigger: string;
    public readonly building_id: string;
    public readonly zone_id: string;
    public readonly pages: SurveyPage[];

    constructor(_data: Partial<Survey>) {
        this.id = _data.id || 0;
        this.title = _data.title || '';
        this.description = _data.description || '';
        this.building_id = _data.building_id || '';
        this.zone_id = _data.zone_id || '';
        this.pages = _data.pages || [];
        this.trigger = _data.trigger || 'NONE';
    }
}

export interface SurveyPage {
    title: string;
    description?: string;
    question_order: number[];
}
