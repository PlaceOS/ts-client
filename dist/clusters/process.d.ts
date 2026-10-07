/**
 * @hidden
 */
export interface PlaceProcessComplete extends Partial<PlaceProcess> {
    driver?: string;
    percentage_cpu?: number;
    local?: {
        status: PlaceProcessComplete;
    };
    edge?: {
        status: PlaceProcessComplete;
    };
}
export declare class PlaceProcess {
    /** ID of the cluster associated with the process */
    readonly cluster_id: string;
    /** Unique identifier of the application */
    readonly id: string;
    /** List of module IDs that are running in this process */
    readonly modules: readonly string[];
    /** Whether the process is running */
    readonly running: boolean;
    /** Number if modules instances running in this process */
    readonly module_instances: number;
    /** Last exit code of the process */
    readonly last_exit_code: number;
    /** Number of times this process has been launched */
    readonly launch_count: number;
    /** Time that the latest instance of the process launched */
    readonly launch_time: number;
    /** Current CPU usage of the process */
    readonly cpu_usage: number;
    /** Total amount of available memory on the host in KB */
    readonly memory_total: number;
    /** Total amount of memory used by the process in KB */
    readonly memory_usage: number;
    /** Display string for the memory usage */
    readonly used_memory: string;
    /** Display string for the memory total */
    readonly total_memory: string;
    constructor(_cluster_id: string, raw_data?: PlaceProcessComplete);
}
