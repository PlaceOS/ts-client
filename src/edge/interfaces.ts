import { HashMap } from '../utilities/types';

export interface PlaceEdgeCreateBody {
    id?: string;
    name?: string;
    description?: string;
}

export interface PlaceEdgeErrorQueryOptions {
    limit?: number;
    type?: string;
}

export interface PlaceEdgeMonitoringCleanupOptions {
    hours?: number;
}

export interface PlaceEdgeError {
    timestamp: number;
    edge_id: string;
    error_type: string;
    message: string;
    context: Record<string, string>;
    severity: string;
}

export interface PlaceEdgeModuleStatus {
    edge_id: string;
    total_modules: number;
    running_modules: number;
    failed_modules: string[];
    initialization_errors: HashMap[];
}

export interface PlaceEdgeHealth {
    edge_id: string;
    connected: boolean;
    last_seen: number;
    connection_uptime: number;
    error_count_24h: number;
    module_count: number;
    failed_modules: string[];
}

export interface PlaceEdgeConnectionMetrics {
    edge_id: string;
    total_connections: number;
    failed_connections: number;
    average_uptime: number;
    last_connection_attempt: number;
    last_successful_connection: number;
}

export interface PlaceEdgeStatistics {
    total_edges: number;
    connected_edges: number;
    edges_with_errors: number;
    total_errors_24h: number;
    total_modules: number;
    failed_modules: number;
    timestamp: string;
}
