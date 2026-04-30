/** Audit entry for changes made to groups and related group resources. */
export class PlaceGroupHistory {
    /** Unique identifier of the history entry */
    public readonly id: string;
    /** ID of the group associated with the history entry */
    public readonly group_id: string;
    /** ID of the user who performed the action */
    public readonly user_id: string;
    /** Email of the user who performed the action */
    public readonly email: string;
    /** Action that was performed */
    public readonly action: string;
    /** Type of resource that was changed */
    public readonly resource_type: string;
    /** ID of the resource that was changed */
    public readonly resource_id: string;
    /** Fields changed by the action */
    public readonly changed_fields: string[];
    /** ISO8601 timestamp of the creation time of the history entry */
    public readonly created_at: string;

    constructor(raw_data: Partial<PlaceGroupHistory> = {}) {
        this.id = raw_data.id || '';
        this.group_id = raw_data.group_id || '';
        this.user_id = raw_data.user_id || '';
        this.email = raw_data.email || '';
        this.action = raw_data.action || '';
        this.resource_type = raw_data.resource_type || '';
        this.resource_id = raw_data.resource_id || '';
        this.changed_fields = raw_data.changed_fields || [];
        this.created_at = raw_data.created_at || '';
    }
}
