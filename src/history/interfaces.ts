/** Mapping of available query parameters for the history index endpoint */
export interface PlaceHistoryQueryOptions {
    /** Only return changes to these resource types (table names) */
    resource_types?: string | string[];
    /** Exclude changes to these resource types (table names) */
    exclude_resource_types?: string | string[];
    /** Only return changes to this resource, usually combined with `resource_types` */
    resource_id?: string;
    /** Only return changes related to this parent, i.e. a group, playlist or booking */
    correlation_id?: string;
    /** Only return changes made by this user */
    user_id?: string;
    /** Only return these kinds of change */
    actions?: string | string[];
    /** Only return changes made at or after this time, as a unix epoch in seconds */
    period_start?: number;
    /** Only return changes made before this time, as a unix epoch in seconds */
    period_end?: number;
    /** Number of results to return. Defaults to `100`. Max `10000` */
    limit?: number;
    /** Offset of the results to return */
    offset?: number;
}
