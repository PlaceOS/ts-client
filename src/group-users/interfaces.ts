import { PlaceResourceQueryOptions } from '../resources/interface';

/** Mapping of available query parameters for the group users index endpoint */
export interface PlaceGroupUserQueryOptions extends PlaceResourceQueryOptions {
    /** ID of the group to filter memberships by */
    group_id?: string;
    /** ID of the user to filter memberships by. Use `me` for the current user. */
    user_id?: string;
}
