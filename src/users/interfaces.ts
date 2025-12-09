import { PlaceResourceQueryOptions } from '../resources/interface';

/** Mapping of available query parameters for the users index endpoint */
export interface PlaceUserQueryOptions extends PlaceResourceQueryOptions {
    /** Include soft deleted users in the results */
    include_deleted?: boolean;
    /** Include user metadata in the response */
    include_metadata?: boolean;
    /** Admin users can view other domains (ignored for other users) */
    authority_id?: string;
}

/** Mapping of available query parameters for the users show endpoint */
export interface PlaceUserShowOptions {
    /** Include user metadata in the response */
    include_metadata?: boolean;
}

/** Mapping of available query parameters for the users delete endpoint */
export interface PlaceUserDeleteOptions {
    /** Force permanent removal of user */
    force_removal?: boolean;
}
