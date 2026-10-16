import { PlaceResource } from '../resources/resource';

/** Explicit, revocable, optionally time-boxed reach for a user into a partner, organisation or domain */
export class PlaceGrant extends PlaceResource {
    /** ID of the user holding the grant */
    public readonly user_id: string;
    /** `partner`, `organisation` or `authority` */
    public readonly scope_type: 'partner' | 'organisation' | 'authority';
    /** ID of the partner, organisation or domain */
    public readonly scope_id: string;
    /** Permission bitmask (same flags as group memberships) */
    public readonly permissions: number;
    /** When the grant stops applying; empty for a standing grant */
    public readonly expires_at: string;
    /** ID of the user who issued the grant */
    public readonly granted_by: string;

    constructor(raw_data: Partial<PlaceGrant> = {}) {
        super(raw_data);
        this.user_id = raw_data.user_id || '';
        this.scope_type = raw_data.scope_type || 'organisation';
        this.scope_id = raw_data.scope_id || '';
        this.permissions = raw_data.permissions || 0;
        this.expires_at = raw_data.expires_at || '';
        this.granted_by = raw_data.granted_by || '';
    }
}
