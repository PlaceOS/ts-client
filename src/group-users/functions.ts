import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiEndpoint } from '../auth/functions';
import { del, get, patch, post, put } from '../http/functions';
import { query } from '../resources/functions';
import { HashMap } from '../utilities/types';
import { PlaceGroupUser } from './group-user';
import { PlaceGroupUserQueryOptions } from './interfaces';

const PATH = 'group_users';

/** Convert raw server data to a group user object */
function process(item: Partial<PlaceGroupUser>) {
    return new PlaceGroupUser(item);
}

function pathFor(user_id: string, group_id: string) {
    return `${PATH}/${encodeURIComponent(user_id)}/${encodeURIComponent(group_id)}`;
}

/** Query user group memberships */
export function queryGroupUsers(query_params: PlaceGroupUserQueryOptions = {}) {
    return query({ query_params, fn: process, path: PATH });
}

/** Get a user group membership */
export function showGroupUser(
    user_id: string,
    group_id: string,
): Observable<PlaceGroupUser> {
    const url = `${apiEndpoint()}/${pathFor(user_id, group_id)}`;
    return get(url).pipe(map((resp: HashMap) => process(resp)));
}

/** Add a user to a group */
export function addGroupUser(
    form_data: Partial<PlaceGroupUser>,
): Observable<PlaceGroupUser> {
    const url = `${apiEndpoint()}/${PATH}`;
    return post(url, form_data).pipe(map((resp: HashMap) => process(resp)));
}

/** Update a user's group membership */
export function updateGroupUser(
    user_id: string,
    group_id: string,
    form_data: Partial<PlaceGroupUser>,
    method: 'put' | 'patch' = 'patch',
): Observable<PlaceGroupUser> {
    const url = `${apiEndpoint()}/${pathFor(user_id, group_id)}`;
    return (method === 'put' ? put : patch)(url, form_data).pipe(
        map((resp: HashMap) => process(resp)),
    );
}

/** Remove a user from a group */
export function removeGroupUser(
    user_id: string,
    group_id: string,
): Observable<void> {
    const url = `${apiEndpoint()}/${pathFor(user_id, group_id)}`;
    return del(url, { response_type: 'void' });
}
