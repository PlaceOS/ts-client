import { apiEndpoint } from '../auth/functions';
import { get, post } from '../http/functions';
import { toQueryString } from '../utilities/api';
import { HashMap } from '../utilities/types';
import {
    PlacePlatformInfo,
    PlaceSourceResyncStatus,
    PlaceVersion,
    SignalOptions,
} from './interfaces';

/** Check API health */
export function healthCheck(): Promise<void> {
    return get(apiEndpoint()).then(() => undefined);
}

/** Get platform release details */
export function platformInfo(): Promise<PlacePlatformInfo> {
    return get(`${apiEndpoint()}/platform`) as any;
}

/** Get this service version */
export function serviceVersion(): Promise<PlaceVersion> {
    return get(`${apiEndpoint()}/version`) as any;
}

/** Get core node versions */
export function coreVersions(): Promise<PlaceVersion[]> {
    return get(`${apiEndpoint()}/cluster/versions`) as any;
}

/** List available API scopes */
export function apiScopes(): Promise<string[]> {
    return get(`${apiEndpoint()}/scopes`) as any;
}

/**
 * Publish every module's state and every model's metadata to the MQTT brokers
 * again. With `clear`, everything PlaceOS publishes is removed from the brokers
 * first, for when what they hold has drifted. Runs in the background; follow
 * it with `sourceResyncStatus`. Rejects with a 409 while one is running.
 * Needs a system admin.
 */
export function sourceResync(clear = false): Promise<PlaceSourceResyncStatus> {
    return post(`${apiEndpoint()}/source/resync?clear=${clear}`, {}) as any;
}

/** Where the last resync of the MQTT brokers got to. Needs a system admin */
export function sourceResyncStatus(): Promise<PlaceSourceResyncStatus> {
    return get(`${apiEndpoint()}/source/resync`) as any;
}

/** Signal a channel in a similar manner to a webhook for drivers */
export function signal(channel: string, body: HashMap = {}): Promise<void> {
    const q = toQueryString({ channel } as SignalOptions);
    return post(`${apiEndpoint()}/signal?${q}`, body).then(() => undefined);
}
