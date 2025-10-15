import { query, remove, show } from '../resources/functions';
import { HashMap } from '../utilities/types';
import { PlaceCluster } from './cluster';
import { PlaceClusterQueryOptions } from './interfaces';
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
    query_params: PlaceClusterQueryOptions = {},
) {
    return show({ id, query_params, fn: process, path: PATH });
}

/**
 * Query the available process for a cluster
 * @param id ID of the cluster to query
 * @param query_params Query parameters to add the to request URL
 */
export function queryProcesses(id: string, query_params: HashMap = {}) {
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
 * Terminal a process in a cluster
 * @param id ID of the cluster associated with the process
 * @param driver Name of the process to kill
 */
export function terminateProcess(id: string, driver: string) {
    return remove({ id, query_params: { driver }, path: PATH });
}
