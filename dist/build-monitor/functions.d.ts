import { BuildMonitorCancelStatus, BuildMonitorQueryOptions, BuildMonitorTaskStatus } from './interfaces';
/** Query current build monitor tasks */
export declare function buildMonitor(query_params?: BuildMonitorQueryOptions): Promise<BuildMonitorTaskStatus[] | string>;
/** Cancel a queued or running build job */
export declare function cancelBuildJob(job: string): Promise<BuildMonitorCancelStatus>;
