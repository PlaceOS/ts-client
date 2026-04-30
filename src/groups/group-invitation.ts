/** Invitation for a user to join a group. */
export class PlaceGroupInvitation {
    /** ISO8601 timestamp of the creation time of the invitation */
    public readonly created_at: string;
    /** ISO8601 timestamp of the last update time of the invitation */
    public readonly updated_at: string;
    /** Unique identifier of the invitation */
    public readonly id: string;
    /** Email address the invitation was sent to */
    public readonly email: string;
    /** Digest of the invitation secret */
    public readonly secret_digest: string;
    /** Permission bitmask granted when accepted */
    public readonly permissions: number;
    /** ISO8601 timestamp when the invitation expires */
    public readonly expires_at: string;
    /** ID of the group associated with the invitation */
    public readonly group_id: string;

    constructor(raw_data: Partial<PlaceGroupInvitation> = {}) {
        this.created_at = raw_data.created_at || '';
        this.updated_at = raw_data.updated_at || '';
        this.id = raw_data.id || '';
        this.email = raw_data.email || '';
        this.secret_digest = raw_data.secret_digest || '';
        this.permissions = raw_data.permissions || 0;
        this.expires_at = raw_data.expires_at || '';
        this.group_id = raw_data.group_id || '';
    }
}

/** Payload used to create a group invitation. */
export interface PlaceGroupInvitationCreatePayload {
    /** ID of the group to invite the user to */
    group_id: string;
    /** Email address to invite */
    email: string;
    /** Permission bitmask to grant when accepted */
    permissions: number;
    /** Optional ISO8601 timestamp when the invitation expires */
    expires_at?: string;
}

/** Response returned when creating a group invitation. */
export interface PlaceGroupInvitationCreatedResponse {
    /** Created invitation */
    invitation: PlaceGroupInvitation;
    /** One-time plaintext invitation secret. Capture immediately. */
    plaintext_secret: string;
}
