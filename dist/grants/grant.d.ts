import { PlaceResource } from '../resources/resource';
/** Explicit, revocable, optionally time-boxed reach for a user into a partner, organisation or domain */
export declare class PlaceGrant extends PlaceResource {
    /** ID of the user holding the grant */
    readonly user_id: string;
    /** `partner`, `organisation` or `authority` */
    readonly scope_type: 'partner' | 'organisation' | 'authority';
    /** ID of the partner, organisation or domain */
    readonly scope_id: string;
    /** Permission bitmask (same flags as group memberships) */
    readonly permissions: number;
    /** When the grant stops applying; empty for a standing grant */
    readonly expires_at: string;
    /** ID of the user who issued the grant */
    readonly granted_by: string;
    constructor(raw_data?: Partial<PlaceGrant>);
}
