import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiEndpoint } from '../auth/functions';
import { PlaceAuthSourceQueryOptions } from '../auth-sources/interfaces';
import { get, post } from '../http/functions';
import {
    create,
    query,
    remove,
    show,
    task,
    update,
} from '../resources/functions';
import { toQueryString } from '../utilities/api';
import { HashMap } from '../utilities/types';
import { PlaceEdge } from './edge';
import {
    PlaceEdgeConnectionMetrics,
    PlaceEdgeCreateBody,
    PlaceEdgeError,
    PlaceEdgeErrorQueryOptions,
    PlaceEdgeHealth,
    PlaceEdgeModuleStatus,
    PlaceEdgeMonitoringCleanupOptions,
    PlaceEdgeStatistics,
} from './interfaces';

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
export function addEdge(form_data: PlaceEdgeCreateBody) {
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
    return `${endpoint.replace(httpProtocol, wsProtocol).replace(/\/$/, '')}/${PATH}/control`;
}

/** Get recent errors for all edges */
export function edgeErrors(
    query_params: PlaceEdgeErrorQueryOptions = {},
): Observable<Record<string, PlaceEdgeError[]>> {
    const q = toQueryString(query_params);
    return get(`${apiEndpoint()}/${PATH}/errors${q ? '?' + q : ''}`) as any;
}

/** Get recent errors for a specific edge */
export function edgeErrorsFor(
    id: string,
    query_params: PlaceEdgeErrorQueryOptions = {},
): Observable<PlaceEdgeError[]> {
    const q = toQueryString(query_params);
    return get(`${apiEndpoint()}/${PATH}/${encodeURIComponent(id)}/errors${q ? '?' + q : ''}`) as any;
}

/** Get module status for a specific edge */
export function edgeModuleStatus(id: string): Observable<PlaceEdgeModuleStatus> {
    return get(
        `${apiEndpoint()}/${PATH}/${encodeURIComponent(id)}/modules/status`,
    ) as any;
}

/** Get health status for all edges */
export function edgeHealth(): Observable<Record<string, PlaceEdgeHealth>> {
    return get(`${apiEndpoint()}/${PATH}/health`) as any;
}

/** Get health status for a specific edge */
export function edgeHealthFor(id: string): Observable<PlaceEdgeHealth | null> {
    return get(`${apiEndpoint()}/${PATH}/${encodeURIComponent(id)}/health`) as any;
}

/** Get connection metrics for all edges */
export function edgeConnections(): Observable<
    Record<string, PlaceEdgeConnectionMetrics>
> {
    return get(`${apiEndpoint()}/${PATH}/connections`) as any;
}

/** Get connection metrics for a specific edge */
export function edgeConnectionsFor(
    id: string,
): Observable<PlaceEdgeConnectionMetrics | null> {
    return get(
        `${apiEndpoint()}/${PATH}/${encodeURIComponent(id)}/connections`,
    ) as any;
}

/** Get failed modules grouped by edge */
export function edgeModuleFailures(): Observable<Record<string, HashMap[]>> {
    return get(`${apiEndpoint()}/${PATH}/modules/failures`) as any;
}

/** Get overall edge statistics */
export function edgeStatistics(): Observable<PlaceEdgeStatistics> {
    return get(`${apiEndpoint()}/${PATH}/statistics`) as any;
}

/** Trigger manual edge monitoring cleanup */
export function cleanupEdgeMonitoring(
    query_params: PlaceEdgeMonitoringCleanupOptions = {},
): Observable<void> {
    const q = toQueryString(query_params);
    return post(`${apiEndpoint()}/${PATH}/monitoring/cleanup${q ? '?' + q : ''}`, {}).pipe(
        map(() => undefined),
    );
}

/** Get edge monitoring summary */
export function edgeMonitoringSummary(): Observable<HashMap> {
    return get(`${apiEndpoint()}/${PATH}/monitoring/summary`) as any;
}

/** URL for real-time error streaming across all edges */
export function edgeErrorsStreamUrl(): string {
    return `${apiEndpoint()}/${PATH}/errors/stream`;
}

/** URL for real-time error streaming for a specific edge */
export function edgeErrorsStreamUrlFor(id: string): string {
    return `${apiEndpoint()}/${PATH}/${encodeURIComponent(id)}/errors/stream`;
}

/** URL for real-time module status streaming across all edges */
export function edgeModulesStreamUrl(): string {
    return `${apiEndpoint()}/${PATH}/modules/stream`;
}
