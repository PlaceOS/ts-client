import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiEndpoint } from '../auth/functions';
import { del, get, patch, post, put } from '../http/functions';
import { query } from '../resources/functions';
import { HashMap } from '../utilities/types';
import { PlaceGroupZone } from './group-zone';
import { PlaceGroupZoneQueryOptions } from './interfaces';

const PATH = 'group_zones';

/** Convert raw server data to a group zone object */
function process(item: Partial<PlaceGroupZone>) {
    return new PlaceGroupZone(item);
}

function pathFor(group_id: string, zone_id: string) {
    return `${PATH}/${encodeURIComponent(group_id)}/${encodeURIComponent(zone_id)}`;
}

/** Query group zone access rows */
export function queryGroupZones(query_params: PlaceGroupZoneQueryOptions = {}) {
    return query({ query_params, fn: process, path: PATH });
}

/** Get a group zone access row */
export function showGroupZone(
    group_id: string,
    zone_id: string,
): Observable<PlaceGroupZone> {
    const url = `${apiEndpoint()}/${pathFor(group_id, zone_id)}`;
    return get(url).pipe(map((resp: HashMap) => process(resp)));
}

/** Add group access to a zone */
export function addGroupZone(
    form_data: Partial<PlaceGroupZone>,
): Observable<PlaceGroupZone> {
    const url = `${apiEndpoint()}/${PATH}`;
    return post(url, form_data).pipe(map((resp: HashMap) => process(resp)));
}

/** Update group access to a zone */
export function updateGroupZone(
    group_id: string,
    zone_id: string,
    form_data: Partial<PlaceGroupZone>,
    method: 'put' | 'patch' = 'patch',
): Observable<PlaceGroupZone> {
    const url = `${apiEndpoint()}/${pathFor(group_id, zone_id)}`;
    return (method === 'put' ? put : patch)(url, form_data).pipe(
        map((resp: HashMap) => process(resp)),
    );
}

/** Remove group access from a zone */
export function removeGroupZone(
    group_id: string,
    zone_id: string,
): Observable<void> {
    const url = `${apiEndpoint()}/${pathFor(group_id, zone_id)}`;
    return del(url, { response_type: 'void' });
}
