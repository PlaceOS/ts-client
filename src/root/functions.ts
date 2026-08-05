import { apiEndpoint } from '../auth/functions';
import { get, post } from '../http/functions';
import { toQueryString } from '../utilities/api';
import { HashMap } from '../utilities/types';
import {
    PlacePlatformInfo,
    PlaceVersion,
    ReindexOptions,
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

/** Signal a channel in a similar manner to a webhook for drivers */
export function signal(channel: string, body: HashMap = {}): Promise<void> {
    const q = toQueryString({ channel } as SignalOptions);
    return post(`${apiEndpoint()}/signal?${q}`, body).then(() => undefined);
}

/** @deprecated No-op since PlaceOS moved search to PostgreSQL (PPT-2644); will be removed */
export function reindex(query_params: ReindexOptions = {}): Promise<void> {
    const q = toQueryString(query_params);
    return post(`${apiEndpoint()}/reindex${q ? '?' + q : ''}`, {}).then(
        () => undefined,
    );
}

/** @deprecated No-op since PlaceOS moved search to PostgreSQL (PPT-2644); will be removed */
export function backfill(): Promise<void> {
    return post(`${apiEndpoint()}/backfill`, {}).then(() => undefined);
}
