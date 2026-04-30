import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiEndpoint } from '../auth/functions';
import { del, get, post } from '../http/functions';
import {
    create,
    query,
    remove,
    show,
    task,
    update,
} from '../resources/functions';
import { toQueryString } from '../utilities/api';
import { HashMap } from '../utilities/types';
import {
    PlaceUserDeleteOptions,
    PlaceUserGroupResponse,
    PlaceUserGroupsOptions,
    PlaceUserMetadataOptions,
    PlaceUserMetadataSearchOptions,
    PlaceUserQueryOptions,
    PlaceUserResourceToken,
    PlaceUserShowOptions,
} from './interfaces';
import { PlaceUser } from './user';

/**
 * @private
 */
const PATH = 'users';

/** Convert raw server data to a trigger object */
function process(item: Partial<PlaceUser>) {
    return new PlaceUser(item);
}

/**
 * Query the available triggers
 * @param query_params Query parameters to add the to request URL
 */
export function queryUsers(query_params: PlaceUserQueryOptions = {}) {
    return query({ query_params, fn: process, path: PATH });
}

/**
 * Get the data for a user
 * @param id ID of the user to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showUser(id: string, query_params: PlaceUserShowOptions = {}) {
    return show({ id, query_params, fn: process, path: PATH });
}

/**
 * Get the data for the currently logged in user
 * @param query_params Query parameters to add the to request URL
 */
export function currentUser(query_params: PlaceUserShowOptions = {}) {
    return show({ id: 'current', query_params, fn: process, path: PATH });
}

/**
 * Update the trigger in the database
 * @param id ID of the trigger
 * @param form_data New values for the trigger
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateUser(
    id: string,
    form_data: Partial<PlaceUser>,
    method: 'put' | 'patch' = 'patch',
) {
    return update({
        id,
        form_data,
        query_params: {},
        method,
        fn: process,
        path: PATH,
    });
}

/**
 * Add a new trigger to the database
 * @param form_data Trigger data
 * @param query_params Query parameters to add the to request URL
 */
export function addUser(form_data: Partial<PlaceUser>) {
    return create({ form_data, query_params: {}, fn: process, path: PATH });
}

/**
 * Remove a user from the database
 * @param id ID of the user
 * @param query_params Query parameters to add the to request URL
 */
export function removeUser(
    id: string,
    query_params: PlaceUserDeleteOptions = {},
) {
    return remove({ id, query_params, path: PATH });
}

/**
 * Get the groups that users are in
 * @param query_params Query parameters including email addresses
 */
export function queryUserGroups(
    query_params: PlaceUserGroupsOptions,
): Observable<PlaceUserGroupResponse[]> {
    const q = toQueryString(query_params);
    const url = `${apiEndpoint()}${PATH}/groups${q ? '?' + q : ''}`;
    return get(url).pipe(
        map((resp: HashMap) => resp as PlaceUserGroupResponse[]),
    );
}

/**
 * Search user metadata with provided JSON Path query
 * @param query_params Query parameters including filter
 */
export function searchUserMetadata(
    query_params: PlaceUserMetadataSearchOptions,
): Observable<PlaceUser[]> {
    const q = toQueryString(query_params);
    const url = `${apiEndpoint()}${PATH}/metadata/search${q ? '?' + q : ''}`;
    return get(url).pipe(
        map((resp: HashMap) =>
            ((resp || []) as HashMap[]).map((item) => process(item)),
        ),
    );
}

/**
 * Obtain a token to the current user's SSO resources
 */
export function currentUserResourceToken(): Observable<PlaceUserResourceToken> {
    const url = `${apiEndpoint()}${PATH}/resource_token`;
    return post(url, {}).pipe(
        map((resp: HashMap) => resp as PlaceUserResourceToken),
    );
}

/**
 * Get a user's metadata
 * @param id User ID
 * @param query_params Query parameters to add to the request
 */
export function userMetadata(
    id: string,
    query_params: PlaceUserMetadataOptions = {},
): Observable<HashMap> {
    return task({
        id,
        task_name: 'metadata',
        form_data: query_params,
        method: 'get',
        path: PATH,
    });
}

/**
 * Remove the saved resource token of a user
 * @param id User ID
 */
export function removeUserResourceToken(id: string): Observable<void> {
    const url = `${apiEndpoint()}${PATH}/${encodeURIComponent(id)}/resource_token`;
    return del(url, { response_type: 'void' });
}

/**
 * Obtain a token to the specified user's SSO resources
 * @param id User ID
 */
export function userResourceToken(
    id: string,
): Observable<PlaceUserResourceToken> {
    const url = `${apiEndpoint()}${PATH}/${encodeURIComponent(id)}/resource_token`;
    return post(url, {}).pipe(
        map((resp: HashMap) => resp as PlaceUserResourceToken),
    );
}

/**
 * Undelete a user
 * @param id User ID
 */
export function reviveUser(id: string): Observable<PlaceUser> {
    return task({
        id,
        task_name: 'revive',
        form_data: {},
        method: 'post',
        callback: (item: Partial<PlaceUser>) => process(item),
        path: PATH,
    });
}
