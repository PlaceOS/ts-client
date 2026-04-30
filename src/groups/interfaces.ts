import { PlaceResourceQueryOptions } from '../resources/interface';

/** Mapping of available query parameters for the groups index endpoint */
export interface PlaceGroupQueryOptions extends PlaceResourceQueryOptions {
    /** ID of the parent group to filter by. Use `root` for root-level groups. */
    parent_id?: string;
    /** Whether groups should include a count of their children */
    include_children_count?: boolean;
}

/** Mapping of available query parameters for the current groups endpoint */
export interface PlaceCurrentGroupQueryOptions {
    /** Filter to groups participating in this subsystem */
    subsystem?: string;
}

/** Mapping of available query parameters for the group history index endpoint */
export interface PlaceGroupHistoryQueryOptions
    extends PlaceResourceQueryOptions {
    /** ID of the group to filter audit entries by */
    group_id?: string;
}

/** Mapping of available query parameters for the group invitations index endpoint */
export interface PlaceGroupInvitationQueryOptions
    extends PlaceResourceQueryOptions {
    /** ID of the group to filter invitations by */
    group_id?: string;
}
