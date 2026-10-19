import { HashMap } from '../utilities/types';

/** Kind of change recorded in the history */
export type PlaceHistoryAction =
    | 'create'
    | 'update'
    | 'delete'
    | 'approve'
    | 'restore';

/** Who made a change and from where */
export interface PlaceHistoryMetadata {
    /** ID of the user that made the change */
    user_id?: string;
    /** Email of the user that made the change */
    user_email?: string;
    /** Name of the user that made the change */
    user_name?: string;
    /** ID of the API key used to make the change */
    api_key_id?: string;
    /** Name of the API key used to make the change */
    api_key_name?: string;
    /** `X-App-Id` header of the client that made the change */
    app_id?: string;
    /** `X-App-Name` header of the client that made the change */
    app_name?: string;
    /** `X-App-Date` header of the client that made the change */
    app_date?: string;
    /** `X-App-Build` header of the client that made the change */
    app_build?: string;
    /** User agent of the client that made the change */
    user_agent?: string;
    /** IP address of the client that made the change */
    ip?: string;
    /** ID of the request that made the change */
    request_id?: string;
}

/** A change made to a PlaceOS resource */
export class PlaceHistory {
    /** Unique identifier of the history entry */
    public readonly id: string;
    /** Type of resource that was changed, its table name i.e. `zone`, `sys`, `groups` */
    public readonly resource_type: string;
    /** ID of the resource that was changed. Composite keys are joined with `:` */
    public readonly resource_id: string;
    /** ID of a parent of the resource, i.e. its group, playlist or booking */
    public readonly correlation_id: string;
    /** Kind of change */
    public readonly action: PlaceHistoryAction | string;
    /** Fields changed */
    public readonly changed_fields: string[];
    /** Changed fields as `{ field: [previous, current] }`, secrets are redacted */
    public readonly diff: HashMap<[unknown, unknown]>;
    /** Full copy of the resource for `delete` and `approve` entries */
    public readonly snapshot: HashMap | null;
    /** ID of the user that made the change */
    public readonly user_id: string;
    /** Email of the user that made the change */
    public readonly user_email: string;
    /** Who made the change and from where */
    public readonly context: PlaceHistoryMetadata;
    /** Unix epoch, in seconds, of when the change was made */
    public readonly created_at: number;

    constructor(raw_data: Partial<PlaceHistory> = {}) {
        this.id = raw_data.id || '';
        this.resource_type = raw_data.resource_type || '';
        this.resource_id = raw_data.resource_id || '';
        this.correlation_id = raw_data.correlation_id || '';
        this.action = raw_data.action || '';
        this.changed_fields = raw_data.changed_fields || [];
        this.diff = raw_data.diff || {};
        this.snapshot = raw_data.snapshot || null;
        this.user_id = raw_data.user_id || '';
        this.user_email = raw_data.user_email || '';
        this.context = raw_data.context || {};
        this.created_at = raw_data.created_at || 0;
    }
}
