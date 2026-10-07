import { PlaceAlert } from './alert';
import { PlaceAlertDashboard } from './dashboard';
import { PlaceAlertDashboardQueryOptions, PlaceAlertQueryOptions, PlaceAlertShowOptions } from './interfaces';
/**
 * Query the available alert dashboards
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryAlertDashboards(query_params?: PlaceAlertDashboardQueryOptions): import('..').QueryResponse<PlaceAlertDashboard>;
/**
 * Get the data for an alert dashboard
 * @param id ID of the alert dashboard to retrieve
 */
export declare function showAlertDashboard(id: string): Promise<PlaceAlertDashboard>;
/**
 * Update the alert dashboard in the database
 * @param id ID of the alert dashboard
 * @param form_data New values for the alert dashboard
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateAlertDashboard(id: string, form_data: Partial<PlaceAlertDashboard>, method?: 'put' | 'patch'): Promise<PlaceAlertDashboard>;
/**
 * Add a new alert dashboard to the database
 * @param form_data Application data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addAlertDashboard(form_data: Partial<PlaceAlertDashboard>): Promise<PlaceAlertDashboard>;
/**
 * Remove an alert dashboard from the database
 * @param id ID of the alert dashboard
 */
export declare function removeAlertDashboard(id: string): Promise<import('../utilities/types').HashMap<any>>;
/**
 * Get list of alerts for dashbaord
 * @param id Alert dashboard ID
 */
export declare function listDashboardAlerts(id: string): import('..').QueryResponse<PlaceAlert>;
/**
 * Query the available alerts
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryAlerts(query_params?: PlaceAlertQueryOptions): import('..').QueryResponse<PlaceAlert>;
/**
 * Get the data for an alert
 * @param id ID of the alert to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showAlert(id: string, query_params?: PlaceAlertShowOptions): Promise<PlaceAlert>;
/**
 * Update the alert in the database
 * @param id ID of the alert
 * @param form_data New values for the alert
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateAlert(id: string, form_data: Partial<PlaceAlert>, method?: 'put' | 'patch'): Promise<PlaceAlert>;
/**
 * Add a new alert to the database
 * @param form_data Application data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addAlert(form_data: Partial<PlaceAlert>): Promise<PlaceAlert>;
/**
 * Remove an alert from the database
 * @param id ID of the alert
 */
export declare function removeAlert(id: string): Promise<import('../utilities/types').HashMap<any>>;
