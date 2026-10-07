import { PlaceGuestParticipant, PlaceKickReason, PlaceWebrtcMember, PlaceWebrtcRoomDetails, PlaceWebrtcRoomsQueryOptions } from './interfaces';
/**
 * Query the list of public chat rooms for the current domain
 * @param query_params Query parameters to add to the request URL
 */
export declare function queryWebrtcRooms(query_params?: PlaceWebrtcRoomsQueryOptions): Promise<PlaceWebrtcRoomDetails[]>;
/**
 * Get the details of a public chat room
 * @param system_id Either a system ID or a unique permalink
 */
export declare function showWebrtcRoom(system_id: string): Promise<PlaceWebrtcRoomDetails>;
/**
 * Get a list of connected users in a chat session
 * @param session_id ID of the chat session
 */
export declare function webrtcSessionMembers(session_id: string): Promise<PlaceWebrtcMember[]>;
/**
 * Request guest access to an anonymous chat room.
 * The guest participant details will be forwarded to any listening systems.
 * Additional fields provided as part of the guest post will also be forwarded.
 * @param system_id Either a system ID or a unique permalink
 * @param participant Guest participant details
 */
export declare function webrtcGuestEntry(system_id: string, participant: PlaceGuestParticipant): Promise<void>;
/**
 * End a guest call gracefully.
 * This will remove the authentication token and close any open websockets.
 */
export declare function webrtcGuestExit(): Promise<void>;
/**
 * Kick a user from a chat session.
 * Similar to guest exit without the token expiration.
 * Other members of the call will stop communicating with them.
 * @param user_id ID of the user to kick
 * @param session_id ID of the chat session
 * @param reason Reason for kicking the user
 */
export declare function webrtcKickUser(user_id: string, session_id: string, reason: PlaceKickReason): Promise<void>;
/**
 * Transfer a user from one chat to another.
 * For authorized users to move people from one chat to another.
 * @param user_id ID of the user to transfer
 * @param session_id ID of the current chat session
 * @param connection_details Optional custom connection details for the transfer
 */
export declare function webrtcTransferUser(user_id: string, session_id: string, connection_details?: Record<string, unknown>): Promise<void>;
/**
 * Get the WebRTC signaller websocket URL.
 * This is the endpoint for managing call participants.
 */
export declare function webrtcSignallerUrl(): string;
