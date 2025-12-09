import { create, query, remove, show, update } from '../api';
import { PlaceAlert } from './alert';
import { PlaceAlertDashboard } from './dashboard';
import {
    PlaceAlertDashboardQueryOptions,
    PlaceAlertQueryOptions,
    PlaceAlertShowOptions,
} from './interfaces';

///////////////////////////////////////////////////////////////
/////////////////////   Alert Dashboards   ////////////////////
///////////////////////////////////////////////////////////////

/**
 * @private
 */
const DASHBOARD_PATH = 'alert_dashboards';

/** Convert raw server data to an alert dashboard object */
function processDashboard(item: Partial<PlaceAlertDashboard>) {
    return new PlaceAlertDashboard(item);
}

/**
 * Query the available alert dashboards
 * @param query_params Query parameters to add the to request URL
 */
export function queryAlertDashboards(
    query_params: PlaceAlertDashboardQueryOptions = {},
) {
    return query({
        query_params,
        fn: processDashboard,
        path: DASHBOARD_PATH,
    });
}

/**
 * Get the data for an alert dashboard
 * @param id ID of the alert dashboard to retrieve
 */
export function showAlertDashboard(id: string) {
    return show({
        id,
        query_params: {},
        fn: processDashboard,
        path: DASHBOARD_PATH,
    });
}

/**
 * Update the alert dashboard in the database
 * @param id ID of the alert dashboard
 * @param form_data New values for the alert dashboard
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateAlertDashboard(
    id: string,
    form_data: Partial<PlaceAlertDashboard>,
    method: 'put' | 'patch' = 'patch',
) {
    return update({
        id,
        form_data,
        query_params: {},
        method,
        fn: processDashboard,
        path: DASHBOARD_PATH,
    });
}

/**
 * Add a new alert dashboard to the database
 * @param form_data Application data
 * @param query_params Query parameters to add the to request URL
 */
export function addAlertDashboard(form_data: Partial<PlaceAlertDashboard>) {
    return create({
        form_data,
        query_params: {},
        fn: processDashboard,
        path: DASHBOARD_PATH,
    });
}

/**
 * Remove an alert dashboard from the database
 * @param id ID of the alert dashboard
 */
export function removeAlertDashboard(id: string) {
    return remove({ id, query_params: {}, path: DASHBOARD_PATH });
}

/**
 * Get list of alerts for dashbaord
 * @param id Alert dashboard ID
 */
export function listDashboardAlerts(id: string) {
    return query({
        query_params: {},
        fn: processAlert,
        path: `${DASHBOARD_PATH}/${id}/alerts`,
    });
}

///////////////////////////////////////////////////////////////
//////////////////////////   Alerts   /////////////////////////
///////////////////////////////////////////////////////////////

/**
 * @private
 */
const ALERT_PATH = 'alerts';

/** Convert raw server data to an alert object */
function processAlert(item: Partial<PlaceAlert>) {
    return new PlaceAlert(item);
}

/**
 * Query the available alerts
 * @param query_params Query parameters to add the to request URL
 */
export function queryAlerts(query_params: PlaceAlertQueryOptions = {}) {
    return query({
        query_params,
        fn: processAlert,
        path: ALERT_PATH,
    });
}

/**
 * Get the data for an alert
 * @param id ID of the alert to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showAlert(id: string, query_params: PlaceAlertShowOptions = {}) {
    return show({
        id,
        query_params,
        fn: processAlert,
        path: ALERT_PATH,
    });
}

/**
 * Update the alert in the database
 * @param id ID of the alert
 * @param form_data New values for the alert
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateAlert(
    id: string,
    form_data: Partial<PlaceAlert>,
    method: 'put' | 'patch' = 'patch',
) {
    return update({
        id,
        form_data,
        query_params: {},
        method,
        fn: processAlert,
        path: ALERT_PATH,
    });
}

/**
 * Add a new alert to the database
 * @param form_data Application data
 * @param query_params Query parameters to add the to request URL
 */
export function addAlert(form_data: Partial<PlaceAlert>) {
    return create({
        form_data,
        query_params: {},
        fn: processAlert,
        path: ALERT_PATH,
    });
}

/**
 * Remove an alert from the database
 * @param id ID of the alert
 */
export function removeAlert(id: string) {
    return remove({ id, query_params: {}, path: ALERT_PATH });
}
