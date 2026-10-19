import { apiEndpoint } from '../auth/functions';
import { get, post } from '../http/functions';
import { query } from '../resources/functions';
import { toQueryString } from '../utilities/api';
import { HashMap } from '../utilities/types';
import { PlaceHistory } from './history';
import { PlaceHistoryQueryOptions } from './interfaces';

const PATH = 'history';

/** Convert raw server data to a history object */
function process(item: Partial<PlaceHistory>) {
    return new PlaceHistory(item);
}

/** Query the change history of PlaceOS resources, newest first. Admin only */
export function queryHistory(query_params: PlaceHistoryQueryOptions = {}) {
    return query({ query_params, fn: process, path: PATH });
}

/** Get a change history entry. Admin only */
export function showHistory(id: string): Promise<PlaceHistory> {
    const url = `${apiEndpoint()}/${PATH}/${encodeURIComponent(id)}`;
    return get(url).then((resp: HashMap) => process(resp));
}

/**
 * Restore the latest deleted version of a resource, keeping its ID.
 * Resources deleted alongside it are not restored and secrets are left empty.
 * Admin only
 * @param resource_type Type (table name) of the deleted resource
 * @param resource_id ID of the deleted resource
 * @returns The restored resource
 */
export function undeleteResource(
    resource_type: string,
    resource_id: string,
): Promise<HashMap> {
    const q = toQueryString({ resource_type, resource_id });
    return post(`${apiEndpoint()}/${PATH}/undelete?${q}`, null);
}
