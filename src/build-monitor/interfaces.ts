export type BuildMonitorTaskState =
    | 'pending'
    | 'running'
    | 'cancelled'
    | 'error'
    | 'done';

export interface BuildMonitorTaskStatus {
    state: BuildMonitorTaskState;
    id: string;
    message: string;
    driver: string;
    repo: string;
    branch: string;
    commit: string;
    timestamp: string;
}

export interface BuildMonitorCancelStatus {
    status: string;
    message: string;
}

export interface BuildMonitorQueryOptions {
    state?: BuildMonitorTaskState;
}
