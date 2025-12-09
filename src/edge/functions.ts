import { apiEndpoint } from '../auth/functions';
import { PlaceAuthSourceQueryOptions } from '../auth-sources/interfaces';
import {
    create,
    query,
    remove,
    show,
    task,
    update,
} from '../resources/functions';
import { PlaceEdge } from './edge';

/**
 * @private
 */
const PATH = 'edges';

/** Convert raw server data to an Edge object */
function process(item: Partial<PlaceEdge>) {
    return new PlaceEdge(item);
}

/**
 * Query the available Edges
 * @param query_params Query parameters to add the to request URL
 */
export function queryEdges(query_params: PlaceAuthSourceQueryOptions = {}) {
    return query({ query_params, fn: process, path: PATH });
}

/**
 * Get the data for an Edge
 * @param id ID of the Edge to retrieve
 */
export function showEdge(id: string) {
    return show({ id, query_params: {}, fn: process, path: PATH });
}

/**
 * Update the Edge in the database
 * @param id ID of the Edge
 * @param form_data New values for the Edge
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateEdge(
    id: string,
    form_data: Partial<PlaceEdge>,
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
 * Add a new Edge node to the database
 * @param form_data Edge data
 * @param query_params Query parameters to add the to request URL
 */
export function addEdge(form_data: Partial<PlaceEdge>) {
    return create({ form_data, query_params: {}, fn: process, path: PATH });
}

/**
 * Remove an Edge node from the database
 * @param id ID of the Edge
 */
export function removeEdge(id: string) {
    return remove({ id, query_params: {}, path: PATH });
}

/**
 * Generate token for Edge connection
 * @param id ID of the Edge
 */
export function retrieveEdgeToken(id: string) {
    return task<{ token: string }>({
        id,
        task_name: 'token',
        form_data: {},
        method: 'get',
        path: PATH,
    });
}

/**
 * Get the edge control websocket URL.
 * This is the endpoint that edge devices use to connect to the cluster.
 */
export function edgeControlUrl(): string {
    const endpoint = apiEndpoint();
    const wsProtocol = endpoint.startsWith('https') ? 'wss:' : 'ws:';
    const httpProtocol = endpoint.startsWith('https') ? 'https:' : 'http:';
    return endpoint.replace(httpProtocol, wsProtocol) + `${PATH}/control`;
}
