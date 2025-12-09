import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiEndpoint } from '../auth/functions';
import { get, post } from '../http/functions';
import { query, remove, show } from '../resources/functions';
import { HashMap } from '../utilities/types';
import { PlaceCluster } from './cluster';
import {
    PlaceClusterQueryOptions,
    PlaceClusterShowOptions,
    PlaceClusterTerminateOptions,
    PlaceClusterVersions,
} from './interfaces';
import { PlaceProcess } from './process';

/**
 * @private
 */
const PATH = 'cluster';

/** Convert raw server data to a cluster object */
function process(item: Partial<PlaceCluster>) {
    return new PlaceCluster(item);
}

/**
 * Query the available clusters
 * @param query_params Query parameters to add the to request URL
 */
export function queryClusters(query_params: PlaceClusterQueryOptions = {}) {
    return query({ query_params, fn: process, path: PATH });
}

/**
 * Get the details for a specified cluster
 * @param id ID of the cluster to query
 * @param query_params Query parameters to add the to request URL
 */
export function showCluster(
    id: string,
    query_params: PlaceClusterShowOptions = {},
) {
    return show({ id, query_params, fn: process, path: PATH });
}

/**
 * Query the available processes for a cluster
 * @param id ID of the cluster to query
 * @param query_params Query parameters to add the to request URL
 */
export function queryProcesses(
    id: string,
    query_params: PlaceClusterShowOptions = {},
) {
    return show({
        id,
        query_params,
        fn: (list: any) =>
            list.map(
                (item: Partial<PlaceProcess>) => new PlaceProcess(id, item),
            ),
        path: PATH,
    });
}

/**
 * Terminate a process in a cluster
 * @param id ID of the cluster associated with the process
 * @param query_params Query parameters including driver name (required)
 */
export function terminateProcess(
    id: string,
    query_params: PlaceClusterTerminateOptions,
) {
    return remove({ id, query_params, path: PATH });
}

/**
 * Force the core nodes to perform a cluster rebalance
 */
export function clusterRebalance(): Observable<void> {
    const url = `${apiEndpoint()}${PATH}/rebalance`;
    return post(url, {}).pipe(map(() => undefined));
}

/**
 * Get the core node versions
 */
export function clusterVersions(): Observable<PlaceClusterVersions> {
    const url = `${apiEndpoint()}${PATH}/versions`;
    return get(url).pipe(map((resp: HashMap) => resp as PlaceClusterVersions));
}
