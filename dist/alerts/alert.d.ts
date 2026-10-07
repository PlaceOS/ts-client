import { PlaceResource } from '../resources/resource';
import { TriggerConditions } from '../triggers/interfaces';
import { PlaceAlertDashboard } from './dashboard';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'threshold' | 'status' | 'custom';
export declare class PlaceAlert extends PlaceResource {
    readonly alert_dashboard_id: string;
    readonly alert_dashboard_details: PlaceAlertDashboard | undefined;
    readonly authority_id: string;
    readonly description: string;
    readonly enabled: boolean;
    readonly conditions: TriggerConditions;
    readonly severity: AlertSeverity;
    readonly alert_type: AlertType;
    readonly debounce_period: number;
    readonly any_match: boolean;
    constructor(data: Partial<PlaceAlert>);
}
