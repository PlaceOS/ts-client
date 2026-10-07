import { MqttAccessOptions } from './interfaces';
/** Validate MQTT JWT user access */
export declare function mqttUser(): Promise<void>;
/** Validate MQTT topic access */
export declare function mqttAccess(query_params: MqttAccessOptions): Promise<void>;
