import { PlaceAuthSourceQueryOptions } from '../auth-sources/interfaces';
import { HashMap } from '../utilities/types';
import { PlaceEdge } from './edge';
import { PlaceEdgeConnectionMetrics, PlaceEdgeCreateBody, PlaceEdgeError, PlaceEdgeErrorQueryOptions, PlaceEdgeHealth, PlaceEdgeModuleStatus, PlaceEdgeMonitoringCleanupOptions, PlaceEdgeStatistics } from './interfaces';
/**
 * Query the available Edges
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryEdges(query_params?: PlaceAuthSourceQueryOptions): import('..').QueryResponse<PlaceEdge>;
/**
 * Get the data for an Edge
 * @param id ID of the Edge to retrieve
 */
export declare function showEdge(id: string): Promise<PlaceEdge>;
/**
 * Update the Edge in the database
 * @param id ID of the Edge
 * @param form_data New values for the Edge
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateEdge(id: string, form_data: Partial<PlaceEdge>, method?: 'put' | 'patch'): Promise<PlaceEdge>;
/**
 * Add a new Edge node to the database
 * @param form_data Edge data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addEdge(form_data: PlaceEdgeCreateBody): Promise<PlaceEdge>;
/**
 * Remove an Edge node from the database
 * @param id ID of the Edge
 */
export declare function removeEdge(id: string): Promise<HashMap<any>>;
/**
 * Generate token for Edge connection
 * @param id ID of the Edge
 */
export declare function retrieveEdgeToken(id: string): Promise<{
    token: string;
}>;
/**
 * Get the edge control websocket URL.
 * This is the endpoint that edge devices use to connect to the cluster.
 */
export declare function edgeControlUrl(): string;
/** Get recent errors for all edges */
export declare function edgeErrors(query_params?: PlaceEdgeErrorQueryOptions): Promise<Record<string, PlaceEdgeError[]>>;
/** Get recent errors for a specific edge */
export declare function edgeErrorsFor(id: string, query_params?: PlaceEdgeErrorQueryOptions): Promise<PlaceEdgeError[]>;
/** Get module status for a specific edge */
export declare function edgeModuleStatus(id: string): Promise<PlaceEdgeModuleStatus>;
/** Get health status for all edges */
export declare function edgeHealth(): Promise<Record<string, PlaceEdgeHealth>>;
/** Get health status for a specific edge */
export declare function edgeHealthFor(id: string): Promise<PlaceEdgeHealth | null>;
/** Get connection metrics for all edges */
export declare function edgeConnections(): Promise<Record<string, PlaceEdgeConnectionMetrics>>;
/** Get connection metrics for a specific edge */
export declare function edgeConnectionsFor(id: string): Promise<PlaceEdgeConnectionMetrics | null>;
/** Get failed modules grouped by edge */
export declare function edgeModuleFailures(): Promise<Record<string, HashMap[]>>;
/** Get overall edge statistics */
export declare function edgeStatistics(): Promise<PlaceEdgeStatistics>;
/** Trigger manual edge monitoring cleanup */
export declare function cleanupEdgeMonitoring(query_params?: PlaceEdgeMonitoringCleanupOptions): Promise<void>;
/** Get edge monitoring summary */
export declare function edgeMonitoringSummary(): Promise<HashMap>;
/** URL for real-time error streaming across all edges */
export declare function edgeErrorsStreamUrl(): string;
/** URL for real-time error streaming for a specific edge */
export declare function edgeErrorsStreamUrlFor(id: string): string;
/** URL for real-time module status streaming across all edges */
export declare function edgeModulesStreamUrl(): string;
