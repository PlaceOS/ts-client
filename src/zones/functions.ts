import { Observable } from 'rxjs';
import {
    create,
    query,
    remove,
    show,
    task,
    update,
} from '../resources/functions';
import { PlaceTrigger } from '../triggers/trigger';
import { HashMap } from '../utilities/types';
import { PlaceZoneQueryOptions, PlaceZoneShowOptions } from './interfaces';
import { PlaceZone } from './zone';

/**
 * @private
 */
const PATH = 'zones';

/** Convert raw server data to an application object */
function process(item: Partial<PlaceZone>) {
    return new PlaceZone(item);
}

/**
 * Query the available applications
 * @param query_params Query parameters to add the to request URL
 */
export function queryZones(query_params: PlaceZoneQueryOptions = {}) {
    return query({ query_params, fn: process, path: PATH });
}

/**
 * List the set of tags on the existing zones
 * @param query_params
 */
export function listZoneTags(query_params: PlaceZoneQueryOptions = {}) {
    return show<string[]>({
        id: 'tags',
        query_params,
        fn: (i) => i as string[],
        path: PATH,
    });
}

/**
 * Get the data for an application
 * @param id ID of the application to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showZone(id: string, query_params: PlaceZoneShowOptions = {}) {
    return show({ id, query_params, fn: process, path: PATH });
}

/**
 * Update the application in the database
 * @param id ID of the application
 * @param form_data New values for the application
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateZone(
    id: string,
    form_data: Partial<PlaceZone>,
    method: 'put' | 'patch' = 'patch',
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

/**
 * Add a new application to the database
 * @param form_data Application data
 * @param query_params Query parameters to add the to request URL
 */
export function addZone(form_data: Partial<PlaceZone>) {
    return create({ form_data, query_params: {}, fn: process, path: PATH });
}

/**
 * Remove an application from the database
 * @param id ID of the application
 * @param query_params Query parameters to add the to request URL
 */
export function removeZone(id: string, query_params: HashMap = {}) {
    return remove({ id, query_params, path: PATH });
}

/**
 * Query the triggers for a zone
 * @param id ID of the zone
 * @param query_params Query parameters to add the to request URL
 */
export function listZoneTriggers(id: string, query_params: HashMap = {}) {
    return query({
        query_params,
        fn: (i: Partial<PlaceTrigger>) => new PlaceTrigger(i),
        path: `${PATH}/${id}/triggers`,
    });
}

/**
 * Execute a function of the system's module under a given zone
 * @param id Zone ID
 * @param method Name of the function to execute
 * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
 * @param index Module index. Defaults to `1`
 * @param args Array of arguments to pass to the executed method
 */
export function executeOnZone(
    id: string,
    method: string,
    module: string,
    index: number = 1,
    args: any[] = [],
): Observable<HashMap> {
    return task({
        id,
        task_name: `exec/${encodeURIComponent(
            module + '_' + index,
        )}/${encodeURIComponent(method)}`,
        form_data: args,
        path: PATH,
    });
}
