import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiEndpoint } from '../auth/functions';
import { post } from '../http/functions';
import { toQueryString } from '../utilities/api';
import { MqttAccessOptions } from './interfaces';

const PATH = 'mqtt';

/** Validate MQTT JWT user access */
export function mqttUser(): Observable<void> {
    return post(`${apiEndpoint()}/${PATH}/user`, {}).pipe(map(() => undefined));
}

/** Validate MQTT topic access */
export function mqttAccess(query_params: MqttAccessOptions): Observable<void> {
    const q = toQueryString(query_params);
    return post(`${apiEndpoint()}/${PATH}/access${q ? '?' + q : ''}`, {}).pipe(
        map(() => undefined),
    );
}
