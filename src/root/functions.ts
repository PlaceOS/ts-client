import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiEndpoint } from '../auth/functions';
import { get, post } from '../http/functions';
import { toQueryString } from '../utilities/api';
import { HashMap } from '../utilities/types';
import { PlacePlatformInfo, PlaceVersion, ReindexOptions, SignalOptions } from './interfaces';

/** Check API health */
export function healthCheck(): Observable<void> {
    return get(apiEndpoint()).pipe(map(() => undefined));
}

/** Get platform release details */
export function platformInfo(): Observable<PlacePlatformInfo> {
    return get(`${apiEndpoint()}/platform`) as any;
}

/** Get this service version */
export function serviceVersion(): Observable<PlaceVersion> {
    return get(`${apiEndpoint()}/version`) as any;
}

/** Get core node versions */
export function coreVersions(): Observable<PlaceVersion[]> {
    return get(`${apiEndpoint()}/cluster/versions`) as any;
}

/** List available API scopes */
export function apiScopes(): Observable<string[]> {
    return get(`${apiEndpoint()}/scopes`) as any;
}

/** Signal a channel in a similar manner to a webhook for drivers */
export function signal(channel: string, body: HashMap = {}): Observable<void> {
    const q = toQueryString({ channel } as SignalOptions);
    return post(`${apiEndpoint()}/signal?${q}`, body).pipe(map(() => undefined));
}

/** Recreate Elasticsearch indexes */
export function reindex(query_params: ReindexOptions = {}): Observable<void> {
    const q = toQueryString(query_params);
    return post(`${apiEndpoint()}/reindex${q ? '?' + q : ''}`, {}).pipe(
        map(() => undefined),
    );
}

/** Push all database data into Elasticsearch */
export function backfill(): Observable<void> {
    return post(`${apiEndpoint()}/backfill`, {}).pipe(map(() => undefined));
}
