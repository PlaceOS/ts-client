import { PlaceGroupUser } from './group-user';
import { PlaceGroupUserQueryOptions } from './interfaces';
/** Query user group memberships */
export declare function queryGroupUsers(query_params?: PlaceGroupUserQueryOptions): import('..').QueryResponse<PlaceGroupUser>;
/** Get a user group membership */
export declare function showGroupUser(user_id: string, group_id: string): Promise<PlaceGroupUser>;
/** Add a user to a group */
export declare function addGroupUser(form_data: Partial<PlaceGroupUser>): Promise<PlaceGroupUser>;
/** Update a user's group membership */
export declare function updateGroupUser(user_id: string, group_id: string, form_data: Partial<PlaceGroupUser>, method?: 'put' | 'patch'): Promise<PlaceGroupUser>;
/** Remove a user from a group */
export declare function removeGroupUser(user_id: string, group_id: string): Promise<void>;
