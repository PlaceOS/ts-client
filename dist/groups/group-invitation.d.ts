/** Invitation for a user to join a group. */
export declare class PlaceGroupInvitation {
    /** ISO8601 timestamp of the creation time of the invitation */
    readonly created_at: string;
    /** ISO8601 timestamp of the last update time of the invitation */
    readonly updated_at: string;
    /** Unique identifier of the invitation */
    readonly id: string;
    /** Email address the invitation was sent to */
    readonly email: string;
    /** Digest of the invitation secret */
    readonly secret_digest: string;
    /** Permission bitmask granted when accepted */
    readonly permissions: number;
    /** ISO8601 timestamp when the invitation expires */
    readonly expires_at: string;
    /** ID of the group associated with the invitation */
    readonly group_id: string;
    constructor(raw_data?: Partial<PlaceGroupInvitation>);
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
