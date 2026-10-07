import { PlaceGroup } from '../groups/group';
import { PlaceZone } from '../zones/zone';
/** Group access details for a zone. */
export declare class PlaceGroupZone {
    /** ISO8601 timestamp of the creation time of the association */
    readonly created_at: string;
    /** ISO8601 timestamp of the last update time of the association */
    readonly updated_at: string;
    /** ID of the group associated with the zone */
    readonly group_id: string;
    /** ID of the zone associated with the group */
    readonly zone_id: string;
    /** Permission bitmask granted by this association */
    readonly permissions: number;
    /** Whether this association denies the permission bitmask */
    readonly deny: boolean;
    /** Group details included by the API when available */
    readonly group?: PlaceGroup;
    /** Zone details included by the API when available */
    readonly zone?: PlaceZone;
    constructor(raw_data?: Partial<PlaceGroupZone>);
}
