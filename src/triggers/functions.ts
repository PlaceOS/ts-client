import { Observable } from 'rxjs';
import {
    create,
    query,
    remove,
    show,
    task,
    update,
} from '../resources/functions';
import { PlaceResourceQueryOptions } from '../resources/interface';
import { HashMap } from '../utilities/types';
import { PlaceTrigger } from './trigger';

/**
 * @private
 */
const PATH = 'triggers';

/** Convert raw server data to a trigger object */
function process(item: Partial<PlaceTrigger>) {
    return new PlaceTrigger(item);
}

/**
 * Query the available triggers
 * @param query_params Query parameters to add the to request URL
 */
export function queryTriggers(query_params: PlaceResourceQueryOptions = {}) {
    return query({ query_params, fn: process, path: PATH });
}

/**
 * Get the data for a trigger
 * @param id ID of the trigger to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showTrigger(
    id: string,
    query_params: PlaceResourceQueryOptions = {}
) {
    return show({ id, query_params, fn: process, path: PATH });
}

/**
 * Update the trigger in the database
 * @param id ID of the trigger
 * @param form_data New values for the trigger
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateTrigger(
    id: string,
    form_data: Partial<PlaceTrigger>,
    method: 'put' | 'patch' = 'patch'
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
 * Add a new trigger to the database
 * @param form_data Trigger data
 * @param query_params Query parameters to add the to request URL
 */
export function addTrigger(form_data: Partial<PlaceTrigger>) {
    return create({ form_data, query_params: {}, fn: process, path: PATH });
}

/**
 * Remove an trigger from the database
 * @param id ID of the trigger
 * @param query_params Query parameters to add the to request URL
 */
export function removeTrigger(id: string, query_params: HashMap = {}) {
    return remove({ id, query_params, path: PATH });
}

/**
 * List systems that contain instances of a trigger
 * @param id ID of the trigger to grab system instances for
 */
export function listTriggerInstances(id: string): Observable<PlaceTrigger[]> {
    return task({
        id,
        task_name: `instances`,
        form_data: {},
        method: 'get',
        callback: (data: Partial<PlaceTrigger>[]) =>
            data.map((i) => new PlaceTrigger(i)),
        path: PATH,
    });
}
