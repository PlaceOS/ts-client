import { PlaceResourceQueryOptions } from '../resources/interface';

/** Mapping of available query parameters for the alert dashboards index endpoint */
export interface PlaceAlertDashboardQueryOptions extends PlaceResourceQueryOptions {
    /** Return dashboards for a specific authority */
    authority_id?: string;
}

/** Mapping of available query parameters for the alerts index endpoint */
export interface PlaceAlertQueryOptions extends PlaceResourceQueryOptions {
    /** Return alerts for a specific dashboard */
    alert_dashboard_id?: string;
    /** Filter by alert severity */
    severity?: string;
    /** Filter by alert type */
    alert_type?: string;
    /** Filter by enabled status */
    enabled?: boolean;
}

/** Mapping of available query parameters for the alerts show endpoint */
export interface PlaceAlertShowOptions {
    /** Return the dashboard associated with this alert */
    dashboard?: boolean;
}
