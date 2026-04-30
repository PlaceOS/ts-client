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

/** Mapping of available query parameters for the users groups endpoint */
export interface PlaceUserGroupsOptions {
    /** List of email addresses */
    emails: string | string[];
}

/** Response for the users groups endpoint */
export interface PlaceUserGroupResponse {
    /** ID of the user */
    id?: string;
    /** Groups associated with the user */
    groups: string[];
}

/** Response for user resource token endpoints */
export interface PlaceUserResourceToken {
    /** Resource access token */
    token: string;
    /** Unix epoch timestamp when the token expires */
    expires?: number;
}

/** Mapping of available query parameters for the users metadata search endpoint */
export interface PlaceUserMetadataSearchOptions {
    /** JSON Path query filter */
    filter: string;
    /** Maximum number of results to return */
    limit?: number;
    /** Offset for pagination */
    offset?: number;
}

/** Mapping of available query parameters for the user metadata endpoint */
export interface PlaceUserMetadataOptions {
    /** Name of the metadata key */
    name?: string;
}
