import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiEndpoint } from '../auth/functions';
import { PlaceGroupUser } from '../group-users/group-user';
import { del, get, patch, post, put } from '../http/functions';
import { query } from '../resources/functions';
import { toQueryString } from '../utilities/api';
import { HashMap } from '../utilities/types';
import { PlaceCurrentGroup, PlaceGroup } from './group';
import { PlaceGroupHistory } from './group-history';
import {
    PlaceGroupInvitation,
    PlaceGroupInvitationCreatedResponse,
    PlaceGroupInvitationCreatePayload,
} from './group-invitation';
import {
    PlaceCurrentGroupQueryOptions,
    PlaceGroupHistoryQueryOptions,
    PlaceGroupInvitationQueryOptions,
    PlaceGroupQueryOptions,
} from './interfaces';

const PATH = 'groups';
const HISTORY_PATH = 'group_history';
const INVITATION_PATH = 'group_invitations';

/** Convert raw server data to a group object */
function process(item: Partial<PlaceGroup>) {
    return new PlaceGroup(item);
}

/** Convert raw server data to a group history object */
function processHistory(item: Partial<PlaceGroupHistory>) {
    return new PlaceGroupHistory(item);
}

/** Convert raw server data to a group invitation object */
function processInvitation(item: Partial<PlaceGroupInvitation>) {
    return new PlaceGroupInvitation(item);
}

/** Query groups */
export function queryGroups(query_params: PlaceGroupQueryOptions = {}) {
    return query({ query_params, fn: process, path: PATH });
}

/** Get the data for a group */
export function showGroup(id: string): Observable<PlaceGroup> {
    const url = `${apiEndpoint()}/${PATH}/${encodeURIComponent(id)}`;
    return get(url).pipe(map((resp: HashMap) => process(resp)));
}

/** Get the current user's groups with effective permissions */
export function currentGroups(
    query_params: PlaceCurrentGroupQueryOptions = {},
): Observable<PlaceCurrentGroup[]> {
    const q = toQueryString(query_params);
    const url = `${apiEndpoint()}/${PATH}/current${q ? '?' + q : ''}`;
    return get(url).pipe(
        map((resp: HashMap) =>
            ((resp || []) as HashMap[]).map((item) => ({
                group: process(item.group || {}),
                permissions: item.permissions || 0,
            })),
        ),
    );
}

/** Add a new group */
export function addGroup(
    form_data: Partial<PlaceGroup>,
): Observable<PlaceGroup> {
    const url = `${apiEndpoint()}/${PATH}`;
    return post(url, form_data).pipe(map((resp: HashMap) => process(resp)));
}

/** Update a group */
export function updateGroup(
    id: string,
    form_data: Partial<PlaceGroup>,
    method: 'put' | 'patch' = 'patch',
): Observable<PlaceGroup> {
    const url = `${apiEndpoint()}/${PATH}/${encodeURIComponent(id)}`;
    return (method === 'put' ? put : patch)(url, form_data).pipe(
        map((resp: HashMap) => process(resp)),
    );
}

/** Remove a group */
export function removeGroup(id: string): Observable<void> {
    const url = `${apiEndpoint()}/${PATH}/${encodeURIComponent(id)}`;
    return del(url, { response_type: 'void' });
}

/** Query group audit history entries */
export function queryGroupHistory(
    query_params: PlaceGroupHistoryQueryOptions = {},
) {
    return query({ query_params, fn: processHistory, path: HISTORY_PATH });
}

/** Get a group audit history entry */
export function showGroupHistory(id: string): Observable<PlaceGroupHistory> {
    const url = `${apiEndpoint()}/${HISTORY_PATH}/${encodeURIComponent(id)}`;
    return get(url).pipe(map((resp: HashMap) => processHistory(resp)));
}

/** Query group invitations */
export function queryGroupInvitations(
    query_params: PlaceGroupInvitationQueryOptions = {},
) {
    return query({
        query_params,
        fn: processInvitation,
        path: INVITATION_PATH,
    });
}

/** Get a group invitation */
export function showGroupInvitation(
    id: string,
): Observable<PlaceGroupInvitation> {
    const url = `${apiEndpoint()}/${INVITATION_PATH}/${encodeURIComponent(id)}`;
    return get(url).pipe(map((resp: HashMap) => processInvitation(resp)));
}

/** Create a group invitation */
export function addGroupInvitation(
    form_data: PlaceGroupInvitationCreatePayload,
): Observable<PlaceGroupInvitationCreatedResponse> {
    const url = `${apiEndpoint()}/${INVITATION_PATH}`;
    return post(url, form_data).pipe(
        map((resp: HashMap) => ({
            invitation: processInvitation(resp.invitation || {}),
            plaintext_secret: resp.plaintext_secret || '',
        })),
    );
}

/** Remove a group invitation */
export function removeGroupInvitation(id: string): Observable<void> {
    const url = `${apiEndpoint()}/${INVITATION_PATH}/${encodeURIComponent(id)}`;
    return del(url, { response_type: 'void' });
}

/** Accept a group invitation for the current user */
export function acceptGroupInvitation(id: string): Observable<PlaceGroupUser> {
    const url = `${apiEndpoint()}/${INVITATION_PATH}/${encodeURIComponent(id)}/accept`;
    return post(url, {}).pipe(map((resp: HashMap) => new PlaceGroupUser(resp)));
}
