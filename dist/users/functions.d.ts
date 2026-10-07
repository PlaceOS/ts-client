import { HashMap } from '../utilities/types';
import { PlaceUserDeleteOptions, PlaceUserGroupResponse, PlaceUserGroupsOptions, PlaceUserMetadataOptions, PlaceUserMetadataSearchOptions, PlaceUserQueryOptions, PlaceUserResourceToken, PlaceUserShowOptions } from './interfaces';
import { PlaceUser } from './user';
/**
 * Query the available triggers
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryUsers(query_params?: PlaceUserQueryOptions): import('..').QueryResponse<PlaceUser>;
/**
 * Get the data for a user
 * @param id ID of the user to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showUser(id: string, query_params?: PlaceUserShowOptions): Promise<PlaceUser>;
/**
 * Get the data for the currently logged in user
 * @param query_params Query parameters to add the to request URL
 */
export declare function currentUser(query_params?: PlaceUserShowOptions): Promise<PlaceUser>;
/**
 * Update the trigger in the database
 * @param id ID of the trigger
 * @param form_data New values for the trigger
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateUser(id: string, form_data: Partial<PlaceUser>, method?: 'put' | 'patch'): Promise<PlaceUser>;
/**
 * Add a new trigger to the database
 * @param form_data Trigger data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addUser(form_data: Partial<PlaceUser>): Promise<PlaceUser>;
/**
 * Remove a user from the database
 * @param id ID of the user
 * @param query_params Query parameters to add the to request URL
 */
export declare function removeUser(id: string, query_params?: PlaceUserDeleteOptions): Promise<HashMap<any>>;
/**
 * Get the groups that users are in
 * @param query_params Query parameters including email addresses
 */
export declare function queryUserGroups(query_params: PlaceUserGroupsOptions): Promise<PlaceUserGroupResponse[]>;
/**
 * Search user metadata with provided JSON Path query
 * @param query_params Query parameters including filter
 */
export declare function searchUserMetadata(query_params: PlaceUserMetadataSearchOptions): Promise<PlaceUser[]>;
/**
 * Obtain a token to the current user's SSO resources
 */
export declare function currentUserResourceToken(): Promise<PlaceUserResourceToken>;
/**
 * Get a user's metadata
 * @param id User ID
 * @param query_params Query parameters to add to the request
 */
export declare function userMetadata(id: string, query_params?: PlaceUserMetadataOptions): Promise<HashMap>;
/**
 * Remove the saved resource token of a user
 * @param id User ID
 */
export declare function removeUserResourceToken(id: string): Promise<void>;
/**
 * Obtain a token to the specified user's SSO resources
 * @param id User ID
 */
export declare function userResourceToken(id: string): Promise<PlaceUserResourceToken>;
/**
 * Undelete a user
 * @param id User ID
 */
export declare function reviveUser(id: string): Promise<PlaceUser>;
