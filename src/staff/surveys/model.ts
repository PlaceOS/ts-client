export class Survey {
    public readonly id: number;
    public readonly title: string;
    public readonly description?: string;
    public readonly question_order: Array<number>;
    public readonly trigger: string;

    constructor(_data: Partial<Survey>) {
        this.id = _data.id || 0;
        this.title = _data.title || '';
        this.description = _data.description || '';
        this.question_order = _data.question_order || [];
        this.trigger = _data.trigger || 'NONE';
    }
}
