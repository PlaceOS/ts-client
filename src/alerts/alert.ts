import { PlaceResource } from '../resources/resource';
import { TriggerConditions } from '../triggers/interfaces';
import { PlaceAlertDashboard } from './dashboard';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'threshold' | 'status' | 'custom';

export class PlaceAlert extends PlaceResource {
    // Dashboard to show this alert on
    public readonly alert_dashboard_id: string;
    // Details of the dashboard assigned
    public readonly alert_dashboard_details: PlaceAlertDashboard | undefined;
    // Domain authority that the dashboard exists under
    public readonly authority_id: string;
    // Description of the dashboard's purpose
    public readonly description: string;
    // Whether the dashboard is enabled or not
    public readonly enabled: boolean;
    // Conditions for triggering the alert
    public readonly conditions: TriggerConditions;
    // Severity of the alert
    public readonly severity: AlertSeverity;
    // Type of the alert
    public readonly alert_type: AlertType;
    // How often should this alert should be raised when triggered
    public readonly debounce_period: number;

    constructor(data: Partial<PlaceAlert>) {
        super(data);
        this.authority_id = data.authority_id || '';
        this.description = data.description || '';
        this.enabled = data.enabled || false;
        this.conditions = data.conditions || {
            time_dependents: [],
            comparisons: [],
        };
        this.severity = data.severity || 'low';
        this.alert_type = data.alert_type || 'threshold';
        this.debounce_period = data.debounce_period || 0;
        this.alert_dashboard_id = data.alert_dashboard_id || '';
        this.alert_dashboard_details =
            data.alert_dashboard_details || undefined;
    }
}
