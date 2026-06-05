import { apiEndpoint } from '../auth/functions';
import { get, post } from '../http/functions';
import { toQueryString } from '../utilities/api';
import { HashMap } from '../utilities/types';
import {
    PublicEventQueryOptions,
    PublicEventRegistrationRequest,
    PublicEventTokenRequest,
} from './interfaces';

const PATH = 'public_events';

/** Issue a short-lived guest JWT for public event registration */
export function publicEventGuestToken(
    system_id: string,
    body: PublicEventTokenRequest,
): Promise<string> {
    const url = `${apiEndpoint()}/${PATH}/guest_token/${encodeURIComponent(system_id)}`;
    return post(url, body, { skip_auth: true }) as any;
}

/** List cached public events for a system */
export function listPublicEvents(
    system_id: string,
    query_params: PublicEventQueryOptions = {},
): Promise<HashMap[]> {
    const q = toQueryString(query_params);
    const url = `${apiEndpoint()}/${PATH}/${encodeURIComponent(system_id)}/events${q ? '?' + q : ''}`;
    return get(url, { skip_auth_flow: true }).then(
        (resp: HashMap) => (resp || []) as HashMap[],
    );
}

/** Register an external attendee for a public calendar event */
export function registerPublicEvent(
    system_id: string,
    body: PublicEventRegistrationRequest,
): Promise<HashMap> {
    const url = `${apiEndpoint()}/${PATH}/${encodeURIComponent(system_id)}/register`;
    return post(url, body, { skip_auth_flow: true }) as any;
}
