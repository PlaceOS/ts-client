import { PlaceResourceQueryOptions } from '../resources/interface';

/** Mapping of available query parameters for the zones index endpoint */
export interface PlaceZoneQueryOptions extends PlaceResourceQueryOptions {
    /** ID of the parent zone to filter the results (supports comma-separated list) */
    parent_id?: string;
    /** List of space separated tags to filter the results */
    tags?: string;
    /** ID of the system to filter the results */
    control_system_id?: string;
}

/** Mapping of available query parameters for the zones show endpoint */
export interface PlaceZoneShowOptions {
    /** Includes trigger data in the response (must have support or admin permissions) */
    complete?: boolean;
    /**
     * Returns the specified settings key if the key exists
     * in the zone (available to all authenticated users)
     */
    data?: string;
}

/** Mapping of available query parameters for the zone metadata endpoint */
export interface PlaceZoneMetadataQueryOptions {
    /** The name of the metadata key to retrieve */
    name?: string;
}
