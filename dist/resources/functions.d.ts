import { HashMap } from '../utilities/types';
import { CreateParameters, QueryParameters, RemoveParameters, ShowParameters, TaskParameters, UpdateParameters } from './interface';
/** Total number of items returned by the last basic index query */
export declare function requestTotal(name: string): number;
/** Total number of items returned by the last basic index query */
export declare function lastRequestTotal(name: string): number;
/** URL for the next query page */
export declare function next(): string;
/**
 * @private
 */
export declare function cleanupAPI(): void;
export type QueryResponse<T> = Promise<{
    total: number;
    next: () => QueryResponse<T> | null;
    data: T[];
}>;
/**
 * @hidden
 * Query the index of the API route associated with this service
 * @param query_params Map of query paramaters to add to the request URL
 */
export declare function query<T>(q: QueryParameters<T>): QueryResponse<T>;
/**
 * @hidden
 * Query the API route for a sepecific item
 * @param id ID of the item
 * @param query_params Map of query paramaters to add to the request URL
 */
export declare function show<T>(details: ShowParameters<T>): Promise<T>;
/**
 * @hidden
 * Make post request for a new item to the service
 * @param form_data Data to post to the server
 * @param query_params Map of query paramaters to add to the request URL
 */
export declare function create<T>(details: CreateParameters<T>): Promise<T>;
/**
 * @hidden
 * Perform API task for the given item ID
 * @param id ID of the item
 * @param task_name Name of the task
 * @param form_data Map of data to pass to the API
 * @param method Verb to use for request
 */
export declare function task<T = any>(details: TaskParameters<T>): Promise<T>;
/**
 * @hidden
 * Make put request for changes to the item with the given id
 * @param id ID of the item being updated
 * @param form_data New values for the item
 * @param query_params Map of query paramaters to add to the request URL
 */
export declare function update<T>(details: UpdateParameters<T>): Promise<T>;
/**
 * @hidden
 * Make delete request for the given item
 * @param id ID of item
 */
export declare function remove(details: RemoveParameters): Promise<HashMap>;
/**
 * @private
 * @param url
 * @param query_str
 * @param name
 */
export declare function handleHeaders(url: string, query_str: string, name: string): {
    total: number;
    next: HashMap<string> | null;
};
