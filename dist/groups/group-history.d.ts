/** Audit entry for changes made to groups and related group resources. */
export declare class PlaceGroupHistory {
    /** Unique identifier of the history entry */
    readonly id: string;
    /** ID of the group associated with the history entry */
    readonly group_id: string;
    /** ID of the user who performed the action */
    readonly user_id: string;
    /** Email of the user who performed the action */
    readonly email: string;
    /** Action that was performed */
    readonly action: string;
    /** Type of resource that was changed */
    readonly resource_type: string;
    /** ID of the resource that was changed */
    readonly resource_id: string;
    /** Fields changed by the action */
    readonly changed_fields: string[];
    /** ISO8601 timestamp of the creation time of the history entry */
    readonly created_at: string;
    constructor(raw_data?: Partial<PlaceGroupHistory>);
}
