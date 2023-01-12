export class SurveyInvitation {
    id: number;
    survey_id: number;
    token: string;
    email: string;
    sent: boolean;

    constructor(_data: Partial<SurveyInvitation>) {
        this.id = _data.id || 0;
        this.survey_id = _data.survey_id || 0;
        this.token = _data.token || '';
        this.email = _data.email || '';
        this.sent = _data.sent ?? false;
    }
}
