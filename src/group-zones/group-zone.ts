import { PlaceGroup } from '../groups/group';
import { PlaceZone } from '../zones/zone';

/** Group access details for a zone. */
export class PlaceGroupZone {
    /** ISO8601 timestamp of the creation time of the association */
    public readonly created_at: string;
    /** ISO8601 timestamp of the last update time of the association */
    public readonly updated_at: string;
    /** ID of the group associated with the zone */
    public readonly group_id: string;
    /** ID of the zone associated with the group */
    public readonly zone_id: string;
    /** Permission bitmask granted by this association */
    public readonly permissions: number;
    /** Whether this association denies the permission bitmask */
    public readonly deny: boolean;
    /** Group details included by the API when available */
    public readonly group?: PlaceGroup;
    /** Zone details included by the API when available */
    public readonly zone?: PlaceZone;

    constructor(raw_data: Partial<PlaceGroupZone> = {}) {
        this.created_at = raw_data.created_at || '';
        this.updated_at = raw_data.updated_at || '';
        this.group_id = raw_data.group_id || '';
        this.zone_id = raw_data.zone_id || '';
        this.permissions = raw_data.permissions || 0;
        this.deny = !!raw_data.deny;
        this.group = raw_data.group
            ? new PlaceGroup(raw_data.group)
            : undefined;
        this.zone = raw_data.zone ? new PlaceZone(raw_data.zone) : undefined;
    }
}
