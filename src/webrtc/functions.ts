import { apiEndpoint } from '../auth';
import { get, post } from '../http/functions';
import { toQueryString } from '../utilities/api';
import { HashMap } from '../utilities/types';
import {
    PlaceGuestParticipant,
    PlaceKickReason,
    PlaceWebrtcMember,
    PlaceWebrtcRoomDetails,
    PlaceWebrtcRoomsQueryOptions,
} from './interfaces';

/**
 * @private
 */
const PATH = 'webrtc';

/**
 * Query the list of public chat rooms for the current domain
 * @param query_params Query parameters to add to the request URL
 */
export function queryWebrtcRooms(
    query_params: PlaceWebrtcRoomsQueryOptions = {},
): Promise<PlaceWebrtcRoomDetails[]> {
    const query = toQueryString(query_params);
    const url = `${apiEndpoint()}${PATH}/rooms${query ? '?' + query : ''}`;
    return get(url).then((resp: HashMap) => resp as PlaceWebrtcRoomDetails[]);
}

/**
 * Get the details of a public chat room
 * @param system_id Either a system ID or a unique permalink
 */
export function showWebrtcRoom(
    system_id: string,
): Promise<PlaceWebrtcRoomDetails> {
    const url = `${apiEndpoint()}${PATH}/room/${encodeURIComponent(system_id)}`;
    return get(url).then((resp: HashMap) => resp as PlaceWebrtcRoomDetails);
}

/**
 * Get a list of connected users in a chat session
 * @param session_id ID of the chat session
 */
export function webrtcSessionMembers(
    session_id: string,
): Promise<PlaceWebrtcMember[]> {
    const url = `${apiEndpoint()}${PATH}/members/${encodeURIComponent(session_id)}`;
    return get(url).then((resp: HashMap) => resp as PlaceWebrtcMember[]);
}

/**
 * Request guest access to an anonymous chat room.
 * The guest participant details will be forwarded to any listening systems.
 * Additional fields provided as part of the guest post will also be forwarded.
 * @param system_id Either a system ID or a unique permalink
 * @param participant Guest participant details
 */
export function webrtcGuestEntry(
    system_id: string,
    participant: PlaceGuestParticipant,
): Promise<void> {
    const url = `${apiEndpoint()}${PATH}/guest_entry/${encodeURIComponent(system_id)}`;
    return post(url, participant).then(() => undefined);
}

/**
 * End a guest call gracefully.
 * This will remove the authentication token and close any open websockets.
 */
export function webrtcGuestExit(): Promise<void> {
    const url = `${apiEndpoint()}${PATH}/guest/exit`;
    return post(url, {}).then(() => undefined);
}

/**
 * Kick a user from a chat session.
 * Similar to guest exit without the token expiration.
 * Other members of the call will stop communicating with them.
 * @param user_id ID of the user to kick
 * @param session_id ID of the chat session
 * @param reason Reason for kicking the user
 */
export function webrtcKickUser(
    user_id: string,
    session_id: string,
    reason: PlaceKickReason,
): Promise<void> {
    const url = `${apiEndpoint()}${PATH}/kick/${encodeURIComponent(user_id)}/${encodeURIComponent(session_id)}`;
    return post(url, reason).then(() => undefined);
}

/**
 * Transfer a user from one chat to another.
 * For authorized users to move people from one chat to another.
 * @param user_id ID of the user to transfer
 * @param session_id ID of the current chat session
 * @param connection_details Optional custom connection details for the transfer
 */
export function webrtcTransferUser(
    user_id: string,
    session_id: string,
    connection_details?: Record<string, unknown>,
): Promise<void> {
    const url = `${apiEndpoint()}${PATH}/transfer/${encodeURIComponent(user_id)}/${encodeURIComponent(session_id)}`;
    return post(url, connection_details || {}).then(() => undefined);
}

/**
 * Get the WebRTC signaller websocket URL.
 * This is the endpoint for managing call participants.
 */
export function webrtcSignallerUrl(): string {
    const endpoint = apiEndpoint();
    const wsProtocol = endpoint.startsWith('https') ? 'wss:' : 'ws:';
    const httpProtocol = endpoint.startsWith('https') ? 'https:' : 'http:';
    return endpoint.replace(httpProtocol, wsProtocol) + `${PATH}/signaller`;
}
