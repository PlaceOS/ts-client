/** Mapping of available query parameters for the cluster index endpoint */
export interface PlaceClusterQueryOptions {
    /** Return the detailed status of the node including memory and CPU usage */
    include_status?: boolean;
    /** Number of results to return. Defaults to `20`. Max `500` */
    limit?: number;
    /** Offset the page of results. Max `10000` */
    offset?: number;
}

/** Mapping of available query parameters for the cluster show endpoint */
export interface PlaceClusterShowOptions {
    /** Return the detailed status of the drivers running on the node */
    include_status?: boolean;
}

/** Mapping of available query parameters for the cluster delete endpoint (terminate process) */
export interface PlaceClusterTerminateOptions {
    /** The name of the driver to terminate (required) */
    driver: string;
}
