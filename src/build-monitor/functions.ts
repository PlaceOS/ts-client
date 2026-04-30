import { Observable } from 'rxjs';
import { apiEndpoint } from '../auth/functions';
import { del, get } from '../http/functions';
import { toQueryString } from '../utilities/api';
import {
    BuildMonitorCancelStatus,
    BuildMonitorQueryOptions,
    BuildMonitorTaskStatus,
} from './interfaces';

const PATH = 'build';

/** Query current build monitor tasks */
export function buildMonitor(
    query_params: BuildMonitorQueryOptions = {},
): Observable<BuildMonitorTaskStatus[] | string> {
    const q = toQueryString(query_params);
    return get(`${apiEndpoint()}/${PATH}/monitor${q ? '?' + q : ''}`) as any;
}

/** Cancel a queued or running build job */
export function cancelBuildJob(job: string): Observable<BuildMonitorCancelStatus> {
    return del(`${apiEndpoint()}/${PATH}/cancel/${encodeURIComponent(job)}`, {
        response_type: 'json',
    }) as any;
}
