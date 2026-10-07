import { HashMap } from '../utilities/types';
import { PlaceCluster } from './cluster';
import { PlaceClusterQueryOptions, PlaceClusterShowOptions, PlaceClusterTerminateOptions, PlaceClusterVersions } from './interfaces';
/**
 * Query the available clusters
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryClusters(query_params?: PlaceClusterQueryOptions): import('..').QueryResponse<PlaceCluster>;
/**
 * Get the details for a specified cluster
 * @param id ID of the cluster to query
 * @param query_params Query parameters to add the to request URL
 */
export declare function showCluster(id: string, query_params?: PlaceClusterShowOptions): Promise<PlaceCluster>;
/**
 * Query the available processes for a cluster
 * @param id ID of the cluster to query
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryProcesses(id: string, query_params?: PlaceClusterShowOptions): Promise<any>;
/**
 * Terminate a process in a cluster
 * @param id ID of the cluster associated with the process
 * @param query_params Query parameters including driver name (required)
 */
export declare function terminateProcess(id: string, query_params: PlaceClusterTerminateOptions): Promise<HashMap<any>>;
/**
 * Force the core nodes to perform a cluster rebalance
 */
export declare function clusterRebalance(): Promise<void>;
/**
 * Get the core node versions
 */
export declare function clusterVersions(): Promise<PlaceClusterVersions>;
