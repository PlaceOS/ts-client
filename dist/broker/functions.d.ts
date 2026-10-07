import { HashMap } from '../utilities/types';
import { PlaceMQTTBroker } from './broker';
/**
 * Query the available MQTT brokers
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryBrokers(query_params?: HashMap): import('..').QueryResponse<PlaceMQTTBroker>;
/**
 * Get the data for a MQTT broker
 * @param id ID of the broker to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showBroker(id: string, query_params?: HashMap): Promise<PlaceMQTTBroker>;
/**
 * Update the MQTT broker data
 * @param id ID of the broker
 * @param form_data New values for the broker
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateBroker(id: string, form_data: Partial<PlaceMQTTBroker>, method?: 'put' | 'patch'): Promise<PlaceMQTTBroker>;
/**
 * Add a new MQTT broker to the database
 * @param form_data Broker data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addBroker(form_data: Partial<PlaceMQTTBroker>): Promise<PlaceMQTTBroker>;
/**
 * Remove a MQTT broker from the database
 * @param id ID of the broker
 * @param query_params Query parameters to add the to request URL
 */
export declare function removeBroker(id: string, query_params?: HashMap): Promise<HashMap<any>>;
