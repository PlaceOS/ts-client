import { PlaceResourceQueryOptions } from '../resources/interface';

/** Mapping of available query parameters for the grants index endpoint */
export interface PlaceGrantQueryOptions extends PlaceResourceQueryOptions {
    /** `partner`, `organisation` or `authority` */
    scope_type?: 'partner' | 'organisation' | 'authority';
    /** ID of the partner, organisation or domain */
    scope_id?: string;
    /** Grants held by this user */
    user_id?: string;
}

/** Body for creating a grant */
export interface PlaceGrantCreatePayload {
    user_id: string;
    scope_type: 'partner' | 'organisation' | 'authority';
    scope_id: string;
    /** Permission bitmask; defaults to Read */
    permissions?: number;
    /** ISO 8601 time the grant stops applying; omit for a standing grant */
    expires_at?: string;
}
