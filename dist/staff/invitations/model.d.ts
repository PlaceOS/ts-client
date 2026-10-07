export declare class SurveyInvitation {
    id: number;
    survey_id: number;
    token: string;
    email: string;
    sent: boolean;
    constructor(_data: Partial<SurveyInvitation>);
}
