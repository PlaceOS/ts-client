import { apiEndpoint } from '../auth/functions';
import { post } from '../http/functions';
import { toQueryString } from '../utilities/api';
import { MqttAccessOptions } from './interfaces';

const PATH = 'mqtt';

/** Validate MQTT JWT user access */
export function mqttUser(): Promise<void> {
    return post(`${apiEndpoint()}/${PATH}/user`, {}).then(() => undefined);
}

/** Validate MQTT topic access */
export function mqttAccess(query_params: MqttAccessOptions): Promise<void> {
    const q = toQueryString(query_params);
    return post(`${apiEndpoint()}/${PATH}/access${q ? '?' + q : ''}`, {}).then(
        () => undefined,
    );
}
