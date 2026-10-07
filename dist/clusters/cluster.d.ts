import { HashMap } from '../utilities/types';
interface PlaceClusterRunCounts {
    modules: number;
    drivers: number;
}
export interface PlaceClusterNode {
    hostname: string;
    cpu_count: number;
    core_cpu: number;
    total_cpu: number;
    memory_total: number;
    memory_usage: number;
    core_memory: number;
    run_count?: PlaceClusterRunCounts;
}
interface PlaceClusterComplete extends PlaceCluster {
    core_id?: string;
    status: HashMap;
    load: {
        local: PlaceClusterNode;
        edge: HashMap<PlaceClusterNode>;
    };
}
export declare class PlaceCluster {
    /** Unique identifier of the application */
    readonly id: string;
    /** List of running drivers */
    readonly compiled_drivers: readonly string[];
    /** List of running drivers */
    readonly available_repositories: readonly string[];
    /** Number of actively running drivers */
    readonly running_drivers: number;
    /** Number of actively running drivers */
    readonly module_instances: number;
    /** List of repositories that are unavailable to the cluster */
    readonly unavailable_repositories: readonly string[];
    /** List of drivers that are unavailable to the cluster */
    readonly unavailable_drivers: readonly string[];
    /** Name of the cluster */
    readonly hostname: string;
    /** Number of CPUs available on the host */
    readonly cpu_count: number;
    /** Percentage of CPU usage by the cluster's root process */
    readonly core_cpu: number;
    /** Percentage of CPU usage by the whole cluster */
    readonly total_cpu: number;
    /** Total amount of available memory on the host in KB */
    readonly memory_total: number;
    /** Total amount of memory used by the whole cluster in KB */
    readonly memory_usage: number;
    /** Total amount of memory used by the cluster root process in KB */
    readonly core_memory: number;
    /** Percentage of memory used by the cluster */
    readonly memory_percentage: number;
    /** Display string for the memory usage */
    readonly used_memory: string;
    /** Display string for the memory total */
    readonly total_memory: string;
    /** List of edge nodes within the cluster */
    readonly edge_nodes: PlaceClusterNode[];
    readonly run_counts: PlaceClusterRunCounts;
    constructor(raw_data?: Partial<PlaceClusterComplete>);
}
export {};
