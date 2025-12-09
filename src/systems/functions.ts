import { Observable } from 'rxjs';
import { apiEndpoint } from '../auth/functions';
import {
    create,
    query,
    remove,
    show,
    task,
    update,
} from '../resources/functions';
import { PlaceSettings } from '../settings/settings';
import { PlaceTrigger } from '../triggers/trigger';
import { HashMap } from '../utilities/types';
import { PlaceZone } from '../zones/zone';
import {
    PlaceModuleFunctionMap,
    PlaceSystemControlOptions,
    PlaceSystemMetadataOptions,
    PlaceSystemShowOptions,
    PlaceSystemsQueryOptions,
    PlaceSystemsWithEmailsOptions,
    PlaceSystemStartStopOptions,
    PlaceSystemTriggerShowOptions,
    PlaceSystemTriggersQueryOptions,
} from './interfaces';
import { PlaceSystem } from './system';

/**
 * @private
 */
const PATH = 'systems';

/** Convert raw server data to an system object */
function process(item: Partial<PlaceSystem>) {
    return new PlaceSystem(item);
}

/**
 * Query the available systems
 * @param query_params Query parameters to add the to request URL
 */
export function querySystems(query_params: PlaceSystemsQueryOptions = {}) {
    return query({ query_params, fn: process, path: PATH });
}

/**
 * Query the available systems by email addresses
 * @param query_params Query parameters to add the to request URL
 */
export function querySystemsWithEmails(
    query_params: PlaceSystemsWithEmailsOptions,
) {
    return query({ query_params, fn: process, path: `${PATH}/with_emails` });
}

/**
 * Get the data for a system
 * @param id ID of the system to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showSystem(
    id: string,
    query_params: PlaceSystemShowOptions = {},
) {
    return show({ id, query_params, fn: process, path: PATH });
}

/**
 * Update the system in the database
 * @param id ID of the system
 * @param form_data New values for the system
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateSystem(
    id: string,
    form_data: Partial<PlaceSystem>,
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
 * Add a new system to the database
 * @param form_data System data
 * @param query_params Query parameters to add the to request URL
 */
export function addSystem(form_data: Partial<PlaceSystem>) {
    return create({ form_data, query_params: {}, fn: process, path: PATH });
}

/**
 * Remove a system from the database
 * @param id ID of the system
 */
export function removeSystem(id: string) {
    return remove({ id, query_params: {}, path: PATH });
}

/**
 * Add module to the given system
 * @param id System ID
 * @param module_id ID of the module to add
 */
export function addSystemModule(
    id: string,
    module_id: string,
    data: HashMap = {},
): Observable<PlaceSystem> {
    return task({
        id,
        task_name: `module/${module_id}`,
        form_data: data,
        method: 'put',
        callback: (d) => process(d),
        path: PATH,
    });
}

/**
 * Remove module from the given system
 * @param id System ID
 * @param module_id ID of the module to remove
 */
export function removeSystemModule(
    id: string,
    module_id: string,
): Observable<PlaceSystem> {
    return task({
        id,
        task_name: `module/${module_id}`,
        form_data: {},
        method: 'del',
        callback: (d) => process(d),
        path: PATH,
    });
}

/**
 * Start the given system and clears any existing caches
 * @param id System ID
 * @param query_params Query parameters to add the to request URL
 */
export function startSystem(
    id: string,
    query_params: PlaceSystemStartStopOptions = {},
): Observable<void> {
    return task<void>({
        id,
        task_name: 'start',
        form_data: query_params,
        path: PATH,
    });
}

/**
 * Stops all modules in the given system
 * @param id System ID
 * @param query_params Query parameters to add the to request URL
 */
export function stopSystem(
    id: string,
    query_params: PlaceSystemStartStopOptions = {},
): Observable<void> {
    return task<void>({
        id,
        task_name: 'stop',
        form_data: query_params,
        path: PATH,
    });
}

/**
 * Execute a function of the given system module
 * @param id System ID
 * @param method Name of the function to execute
 * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
 * @param index Module index. Defaults to `1`
 * @param args Array of arguments to pass to the executed method
 */
export function executeOnSystem(
    id: string,
    method: string,
    module: string,
    index: number = 1,
    args: any[] = [],
): Observable<HashMap> {
    return task({
        id,
        task_name: `${module}_${index}/${encodeURIComponent(method)}`,
        form_data: args,
        path: PATH,
    });
}

/**
 * Get the state of the given system module
 * @param id System ID
 * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
 * @param index Module index. Defaults to `1`
 * @param lookup Status variable of interest. If set it will return only the state of this variable
 */
export function systemModuleState(
    id: string,
    module: string,
    index: number = 1,
): Observable<HashMap> {
    return task({
        id,
        task_name: `${module}_${index}`,
        method: 'get',
        path: PATH,
    });
}

/**
 * Get the state of the given system module
 * @param id System ID
 * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
 * @param index Module index. Defaults to `1`
 * @param lookup Status variable of interest. If set it will return only the state of this variable
 */
export function lookupSystemModuleState(
    id: string,
    module: string,
    index: number = 1,
    lookup: string,
): Observable<HashMap> {
    return task({
        id,
        task_name: `${module}_${index}/${lookup}`,
        method: 'get',
        path: PATH,
    });
}

/**
 * Get the list of functions for the given system module
 * @param id System ID
 * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
 * @param index Module index. Defaults to `1`
 */
export function functionList(
    id: string,
    module: string,
    index: number = 1,
): Observable<PlaceModuleFunctionMap> {
    return task({
        id,
        task_name: `functions/${module}_${index}`,
        method: 'get',
        path: PATH,
    });
}

/**
 * Occurances of a particular type of module in the given system
 * @param id System ID
 * @param module Class name of the Module e.g. `Display`, `Lighting` etc.
 */
export function moduleCount(
    id: string,
    module: string,
): Observable<{ count: number }> {
    return task({
        id,
        task_name: 'count',
        form_data: { module },
        method: 'get',
        path: PATH,
    });
}

/**
 * List types of modules and counts in the given system
 * @param id System ID
 */
export function moduleTypes(id: string): Observable<HashMap<number>> {
    return task({ id, task_name: 'count', method: 'get', path: PATH });
}

/**
 * Get list of Zones for system
 * @param id System ID
 */
export function listSystemZones(id: string) {
    return query({
        query_params: {},
        fn: (i: HashMap) => new PlaceZone(i),
        path: `${PATH}/${id}/zones`,
    });
}

/**
 * Get list of triggers for system
 * @param id System ID
 * @param query_params Query parameters to add the to request URL
 */
export function listSystemTriggers(
    id: string,
    query_params: PlaceSystemTriggersQueryOptions = {},
) {
    return query({
        query_params,
        fn: (i: HashMap) => new PlaceTrigger(i),
        path: `${PATH}/${id}/triggers`,
    });
}

/**
 * Get list of triggers for system
 * @param id System ID
 * @param data Values for trigger properties
 */
export function addSystemTrigger(
    id: string,
    data: Partial<PlaceTrigger>,
): Observable<PlaceTrigger> {
    return task({
        id,
        task_name: 'triggers',
        form_data: data,
        method: 'post',
        callback: (item: Partial<PlaceTrigger>) => new PlaceTrigger(item),
        path: PATH,
    });
}

/**
 * Remove trigger from system
 * @param id System ID
 * @param trigger_id ID of the trigger
 */
export function removeSystemTrigger(
    id: string,
    trigger_id: string,
): Observable<void> {
    return task({
        id,
        task_name: `triggers/${trigger_id}`,
        method: 'del',
        path: PATH,
    });
}

/**
 * Fetch settings of modules, zones and drivers associated with the system
 * @param id System ID
 */
export function systemSettings(id: string): Observable<PlaceSettings[]> {
    return task({
        id,
        task_name: 'settings',
        method: 'get',
        callback: (list) =>
            list.map((item: Partial<PlaceSettings>) => new PlaceSettings(item)),
        path: PATH,
    });
}

/**
 * Get the websocket API endpoint URL for system control.
 * @param query_params Query parameters to add to the URL
 */
export function systemControlUrl(query_params: PlaceSystemControlOptions = {}): string {
    const endpoint = apiEndpoint();
    const wsProtocol = endpoint.startsWith('https') ? 'wss:' : 'ws:';
    const httpProtocol = endpoint.startsWith('https') ? 'https:' : 'http:';
    let url = endpoint.replace(httpProtocol, wsProtocol) + `${PATH}/control`;
    if (query_params.fixed_device) {
        url += `?fixed_device=${encodeURIComponent(String(query_params.fixed_device))}`;
    }
    return url;
}

/**
 * Get metadata for the system
 * @param id System ID
 * @param query_params Query parameters to add to the request
 */
export function systemMetadata(
    id: string,
    query_params: PlaceSystemMetadataOptions = {},
): Observable<HashMap> {
    return task({
        id,
        task_name: 'metadata',
        form_data: query_params,
        method: 'get',
        path: PATH,
    });
}

/**
 * Get a particular trigger instance
 * @param sys_id System ID
 * @param trig_id Trigger ID
 * @param query_params Query parameters to add to the request
 */
export function showSystemTrigger(
    sys_id: string,
    trig_id: string,
    query_params: PlaceSystemTriggerShowOptions = {},
): Observable<PlaceTrigger> {
    return task({
        id: sys_id,
        task_name: `triggers/${encodeURIComponent(trig_id)}`,
        form_data: query_params,
        method: 'get',
        callback: (item: Partial<PlaceTrigger>) => new PlaceTrigger(item),
        path: PATH,
    });
}

/**
 * Update the details of a trigger instance
 * @param sys_id System ID
 * @param trig_id Trigger ID
 * @param data Values for trigger properties
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateSystemTrigger(
    sys_id: string,
    trig_id: string,
    data: Partial<PlaceTrigger>,
    method: 'put' | 'patch' = 'patch',
): Observable<PlaceTrigger> {
    return task({
        id: sys_id,
        task_name: `triggers/${encodeURIComponent(trig_id)}`,
        form_data: data,
        method,
        callback: (item: Partial<PlaceTrigger>) => new PlaceTrigger(item),
        path: PATH,
    });
}
