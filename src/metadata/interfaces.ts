/** Query param options for getting metadata */
export interface PlaceMetadataOptions {
    /** The name of the metadata key to return */
    name?: string;
}

/** Query param options for deleting metadata */
export interface PlaceMetadataDeleteOptions {
    /** The name of the metadata key to delete (required) */
    name: string;
}

/** Query param options for getting child metadata */
export interface PlaceZoneMetadataOptions extends PlaceMetadataOptions {
    /** Include parent metadata in the results (included by default) */
    include_parent?: boolean;
}

/** Query param options for getting metadata history */
export interface PlaceMetadataHistoryOptions {
    /** The name of the metadata key */
    name?: string;
    /** Maximum number of results to return */
    limit?: number;
    /** Starting offset of the result set for pagination */
    offset?: number;
}
