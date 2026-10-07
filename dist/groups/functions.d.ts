import { PlaceGroupUser } from '../group-users/group-user';
import { PlaceCurrentGroup, PlaceGroup, PlaceGroupFeatures } from './group';
import { PlaceGroupHistory } from './group-history';
import { PlaceGroupInvitation, PlaceGroupInvitationCreatedResponse, PlaceGroupInvitationCreatePayload } from './group-invitation';
import { PlaceCurrentGroupQueryOptions, PlaceGroupFeaturesQueryOptions, PlaceGroupHistoryQueryOptions, PlaceGroupInvitationQueryOptions, PlaceGroupQueryOptions } from './interfaces';
/** Query groups */
export declare function queryGroups(query_params?: PlaceGroupQueryOptions): import('..').QueryResponse<PlaceGroup>;
/** Get the data for a group */
export declare function showGroup(id: string): Promise<PlaceGroup>;
/** Get the current user's groups with effective permissions */
export declare function currentGroups(query_params?: PlaceCurrentGroupQueryOptions): Promise<PlaceCurrentGroup[]>;
/**
 * Get the effective feature flags for a group.
 * The group's own features are merged over its ancestors', deepest group wins
 */
export declare function showGroupFeatures(id: string, query_params?: PlaceGroupFeaturesQueryOptions): Promise<PlaceGroupFeatures>;
/** Add a new group */
export declare function addGroup(form_data: Partial<PlaceGroup>): Promise<PlaceGroup>;
/** Update a group */
export declare function updateGroup(id: string, form_data: Partial<PlaceGroup>, method?: 'put' | 'patch'): Promise<PlaceGroup>;
/** Remove a group */
export declare function removeGroup(id: string): Promise<void>;
/** Query group audit history entries */
export declare function queryGroupHistory(query_params?: PlaceGroupHistoryQueryOptions): import('..').QueryResponse<PlaceGroupHistory>;
/** Get a group audit history entry */
export declare function showGroupHistory(id: string): Promise<PlaceGroupHistory>;
/** Query group invitations */
export declare function queryGroupInvitations(query_params?: PlaceGroupInvitationQueryOptions): import('..').QueryResponse<PlaceGroupInvitation>;
/** Get a group invitation */
export declare function showGroupInvitation(id: string): Promise<PlaceGroupInvitation>;
/** Create a group invitation */
export declare function addGroupInvitation(form_data: PlaceGroupInvitationCreatePayload): Promise<PlaceGroupInvitationCreatedResponse>;
/** Remove a group invitation */
export declare function removeGroupInvitation(id: string): Promise<void>;
/** Accept a group invitation for the current user */
export declare function acceptGroupInvitation(id: string): Promise<PlaceGroupUser>;
