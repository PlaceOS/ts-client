import type { PlaceSystem } from '../systems/system';
import { PlaceResourceQueryOptions } from '../resources/interface';

/** Mapping of available query parameters for the webrtc rooms index endpoint */
export interface PlaceWebrtcRoomsQueryOptions extends PlaceResourceQueryOptions {}

/** Guest participant details for joining an anonymous chat room */
export interface PlaceGuestParticipant {
    /** Captcha token for verification (required) */
    captcha: string;
    /** Display name for the guest (required) */
    name: string;
    /** User ID for the guest (required) */
    user_id: string;
    /** Session ID for the chat (required) */
    session_id: string;
    /** Email address of the guest */
    email?: string;
    /** Phone number of the guest */
    phone?: string;
    /** Type of participant */
    type?: string;
    /** User ID of the person to chat with directly */
    chat_to_user_id?: string;
}

/** Reason for kicking a user from a chat */
export interface PlaceKickReason {
    /** Reason for ending the call (required) */
    reason: string;
}

/** Details of a WebRTC public chat room */
export interface PlaceWebrtcRoomDetails {
    /** System information for the room */
    system?: Partial<PlaceSystem>;
}

/** Member details in a WebRTC chat session */
export interface PlaceWebrtcMember {
    /** User ID of the member */
    user_id?: string;
    /** Display name of the member */
    name?: string;
    /** Email of the member */
    email?: string;
    /** Whether the member is a guest */
    is_guest?: boolean;
}
