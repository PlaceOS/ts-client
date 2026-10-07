import { HashMap } from '../utilities/types';
import { PublicEventQueryOptions, PublicEventRegistrationRequest, PublicEventTokenRequest } from './interfaces';
/** Issue a short-lived guest JWT for public event registration */
export declare function publicEventGuestToken(system_id: string, body: PublicEventTokenRequest): Promise<string>;
/** List cached public events for a system */
export declare function listPublicEvents(system_id: string, query_params?: PublicEventQueryOptions): Promise<HashMap[]>;
/** Register an external attendee for a public calendar event */
export declare function registerPublicEvent(system_id: string, body: PublicEventRegistrationRequest): Promise<HashMap>;
