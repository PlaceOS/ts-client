import { PlaceGroup } from '../groups/group';
import { PlaceUser } from '../users/user';
export type PlaceGroupDetails = PlaceGroup;
/** Group membership details for a user. */
export declare class PlaceGroupUser {
    /** ISO8601 timestamp of the creation time of the association */
    readonly created_at: string;
    /** ISO8601 timestamp of the last update time of the association */
    readonly updated_at: string;
    /** ID of the user associated with the group */
    readonly user_id: string;
    /** ID of the group associated with the user */
    readonly group_id: string;
    /** Permission bitmask granted by this association */
    readonly permissions: number;
    /** AD group ID that added this membership. Empty when added manually */
    readonly auto_assigned: string;
    /** Group details included by the API when available */
    readonly group?: PlaceGroup;
    /** User details included by the API when available */
    readonly user?: PlaceUser;
    constructor(raw_data?: Partial<PlaceGroupUser>);
}
