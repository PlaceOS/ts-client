import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiEndpoint } from '../auth/functions';
import { get } from '../http/functions';
import { create, remove, show, task, update } from '../resources/functions';
import { toQueryString } from '../utilities/api';
import { HashMap } from '../utilities/types';
import {
    PlaceMetadataBulkOptions,
    PlaceMetadataDeleteOptions,
    PlaceMetadataHistoryOptions,
    PlaceMetadataOptions,
    PlaceZoneMetadataOptions,
} from './interfaces';
import { PlaceMetadata } from './metadata';
import { PlaceZoneMetadata } from './zone-metadata';

/**
 * @private
 */
const PATH = 'metadata';

/** Convert raw server data to a metadata object */
function process(item: Partial<PlaceMetadata>) {
    return new PlaceMetadata(item);
}

/**
 * List the metadata for a database item
 * @param id ID of the item to retrieve metadata
 * @param query_params Query parameters to add the to request URL.
 */
export function listMetadata(
    id: string,
    query_params: PlaceMetadataOptions = {},
): Observable<PlaceMetadata[]> {
    return show({
        id,
        query_params,
        fn: (list: HashMap) =>
            Object.keys(list).map((key: string) => process(list[key])) as any,
        path: PATH,
    });
}

function flatten<T = any>(an_array: T[]): T {
    const stack = [...an_array];
    const res = [];
    while (stack.length) {
        // pop value from stack
        const next = stack.pop();
        if (Array.isArray(next)) {
            // push back array items, won't modify the original input
            stack.push(...next);
        } else {
            res.push(next);
        }
    }
    // reverse to restore input order
    return res.reverse() as T;
}

/**
 * List the metadata history for a database item
 * @param id ID of the item to retrieve metadata
 * @param query_params Query parameters to add to the request URL.
 */
export function listMetadataHistory(
    id: string,
    query_params: PlaceMetadataHistoryOptions = {},
): Observable<PlaceMetadata[]> {
    return task({
        id,
        task_name: `history`,
        form_data: query_params,
        method: 'get',
        callback: (list: HashMap) =>
            flatten(
                Object.keys(list).map((key: string) =>
                    list[key].map((i: any) => process(i)),
                ) as Array<PlaceMetadata[]>,
            ),
        path: PATH,
    });
}

/**
 * Get a metadata field for a database item
 * @param id ID of the item to retrieve metadata
 * @param name Name of the metadata field to retrieve
 */
export function showMetadata(
    id: string,
    name: string,
): Observable<PlaceMetadata> {
    return show({
        id,
        query_params: { name },
        fn: (data: HashMap) => process(data[name]),
        path: PATH,
    });
}

/**
 * Update the metadata in the database
 * @param id ID of the item associated with the metadata
 * @param form_data New values for the metadata
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateMetadata(
    id: string,
    form_data: Partial<PlaceMetadata>,
    method: 'put' | 'patch' = 'put',
) {
    return update({
        id,
        form_data,
        query_params: {},
        method,
        fn: process,
        path: PATH,
    });
}

export function addMetadata(form_data: Partial<PlaceMetadata>) {
    return create({ form_data, query_params: {}, fn: process, path: PATH });
}

/**
 * Remove metadata from the database
 * @param id ID of the item associated with the metadata
 * @param query_params Query parameters including the metadata key name (required)
 */
export function removeMetadata(
    id: string,
    query_params: PlaceMetadataDeleteOptions,
) {
    return remove({ id, query_params, path: PATH });
}

/**
 * Query metadata of associated child items
 * @param id ID of the item to get associated child metadata
 * @param query_params Query parameters to add the to request URL
 */
export function listChildMetadata(
    id: string,
    query_params: PlaceZoneMetadataOptions,
) {
    return task({
        id,
        task_name: 'children',
        form_data: query_params,
        method: 'get',
        callback: (list: HashMap[]) =>
            list.map(
                (item) =>
                    new PlaceZoneMetadata({
                        ...item,
                        keys: Object.keys(item.metadata),
                    }),
            ),
        path: PATH,
    });
}

/** Fetch metadata with a specific name for multiple resources */
export function bulkMetadata(
    name: string,
    query_params: PlaceMetadataBulkOptions,
): Observable<Record<string, PlaceMetadata>> {
    const q = toQueryString(query_params);
    const url = `${apiEndpoint()}/${PATH}/${encodeURIComponent(name)}/bulk${q ? '?' + q : ''}`;
    return get(url).pipe(
        map((resp: HashMap) =>
            Object.keys(resp || {}).reduce(
                (map, key) => ({ ...map, [key]: process(resp[key]) }),
                {} as Record<string, PlaceMetadata>,
            ),
        ),
    );
}
