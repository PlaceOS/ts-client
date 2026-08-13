import { HttpJsonOptions } from '../api';
import { HashMap } from '../utilities/types';

/* tslint:disable */

/** Allowable query parameters for basic index endpoints */
export interface PlaceResourceQueryOptions {
    /**
     * Free-text search filter. Words match as prefixes against the resource's
     * searchable fields (PostgreSQL full-text search); all words must match.
     */
    q?: string;
    /** @deprecated Ignored by the server since PlaceOS moved search to PostgreSQL (PPT-2644) */
    fields?: string;
    /** Number of results to return. Defaults to `20`. Max `10000` */
    limit?: number;
    /** Offset of the results to return. Max `1000000` */
    offset?: number;
    /** @deprecated Ignored by the server; pagination follows the `Link` header's offset */
    ref?: string;
    /** Number of milliseconds to cache the query response */
    cache?: number;
    /** Whether the request is a API poll request */
    _poll?: boolean;
}

export interface ResourceService<T = any> {
    query: (fields?: HashMap) => Promise<T[]>;
    show: (id: string, fields?: HashMap) => Promise<T>;
    add: (data: HashMap) => Promise<T>;
    update: (
        id: string,
        data: HashMap,
        fields?: HashMap,
        type?: 'put' | 'patch',
    ) => Promise<T>;
    delete: (id: string) => Promise<void>;
}

export type PlaceDataEventType =
    | 'value_change'
    | 'item_saved'
    | 'reset'
    | 'other';

export interface PlaceDataClassEvent {
    /** Type of event that has occurred on the object */
    type: PlaceDataEventType;
    /** Associated metadata with the event */
    metadata: HashMap;
}

export interface QueryParameters<T> {
    query_params: HashMap;
    fn?: (data: Partial<T>) => T;
    path: string;
    endpoint?: string;
    options?: HttpJsonOptions;
}

export interface ShowParameters<T> extends QueryParameters<T> {
    id: string;
}

export interface CreateParameters<T> extends QueryParameters<T> {
    form_data: Partial<T>;
}

export interface UpdateParameters<T> extends QueryParameters<T> {
    id: string;
    form_data: HashMap;
    method: 'put' | 'patch';
}

export interface RemoveParameters {
    id: string;
    query_params: HashMap;
    path: string;
}

export interface TaskParameters<T> {
    id: string;
    task_name: string;
    form_data?: any;
    method?: 'post' | 'get' | 'del' | 'put' | 'patch';
    callback?: (_: any) => T;
    path: string;
}
