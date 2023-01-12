export class Survey {
    public readonly id: number;
    public readonly survey_id: number;
    public readonly token: string;
    public readonly email: string;
    public readonly sent: boolean;
    public readonly created_at: number;
    public readonly updated_at: number;

    constructor(_data: Partial<Survey>) {
        this.id = _data.id || 0;
        this.survey_id = _data.survey_id || 0;
        this.token = _data.token || '';
        this.email = _data.email || '';
        this.sent = _data.sent ?? false;
        this.created_at = (_data.created_at || 0) * 1000 || Date.now();
        this.updated_at = (_data.updated_at || 0) * 1000 || Date.now();
    }
}
