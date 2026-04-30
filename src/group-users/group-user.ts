import { PlaceGroup } from '../groups/group';
import { PlaceUser } from '../users/user';

export type PlaceGroupDetails = PlaceGroup;

/** Group membership details for a user. */
export class PlaceGroupUser {
    /** ISO8601 timestamp of the creation time of the association */
    public readonly created_at: string;
    /** ISO8601 timestamp of the last update time of the association */
    public readonly updated_at: string;
    /** ID of the user associated with the group */
    public readonly user_id: string;
    /** ID of the group associated with the user */
    public readonly group_id: string;
    /** Permission bitmask granted by this association */
    public readonly permissions: number;
    /** Group details included by the API when available */
    public readonly group?: PlaceGroup;
    /** User details included by the API when available */
    public readonly user?: PlaceUser;

    constructor(raw_data: Partial<PlaceGroupUser> = {}) {
        this.created_at = raw_data.created_at || '';
        this.updated_at = raw_data.updated_at || '';
        this.user_id = raw_data.user_id || '';
        this.group_id = raw_data.group_id || '';
        this.permissions = raw_data.permissions || 0;
        this.group = raw_data.group
            ? new PlaceGroup(raw_data.group)
            : undefined;
        this.user = raw_data.user ? new PlaceUser(raw_data.user) : undefined;
    }
}
