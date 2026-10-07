import { HttpJsonOptions } from '../http/interfaces';
import { SignageCreateOptions, SignageDisplayOptions, SignageMediaQueryOptions, SignageMediaTagRemoveOptions, SignageMediaTagRenameOptions, SignageMediaTagsOptions, SignageMetrics, SignagePlaylistQueryOptions, SignagePlaylistRevisionsOptions, SignagePluginQueryOptions, SignageRemoveOptions, SignageShareOptions, SignageShareResult, SignageTemplateApprover, SignageTemplateMappingQueryOptions, SignageTemplateQueryOptions, SignageTemplateShowOptions } from './interfaces';
import { SignageMedia } from './media.class';
import { SignagePlaylist, SignagePlaylistItemSchedule, SignagePlaylistMedia } from './playlist.class';
import { SignagePlugin } from './plugin.class';
import { SignageTemplate, SignageTemplateMapping } from './template.class';
/**
 * Get all the details needed to display signage on a system
 * @param id ID of the system to display signage for
 * @param query_params Query parameters to add the to request URL
 */
export declare function showSignage(id: string, query_params?: SignageDisplayOptions, options?: HttpJsonOptions): Promise<unknown>;
/**
 * Post the playback metrics collected by a production player
 * @param id ID of the system the player is running on
 * @param metrics Playback counts collected since the last update
 */
export declare function updateSignageMetrics(id: string, metrics: SignageMetrics): Promise<any>;
/**
 * Query the available media
 * @param query_params Query parameters to add the to request URL
 */
export declare function querySignageMedia(query_params?: SignageMediaQueryOptions): import('..').QueryResponse<SignageMedia>;
/** List the distinct tags in use by signage media */
export declare function listSignageMediaTags(query_params?: SignageMediaTagsOptions): Promise<string[]>;
/** List the distinct tags in use by signage media, with the count of media using each */
export declare function listSignageMediaTagCounts(query_params?: SignageMediaTagsOptions): Promise<Record<string, number>>;
/** Rename a tag on all signage media in the selected scope */
export declare function renameSignageMediaTag(query_params: SignageMediaTagRenameOptions): Promise<void>;
/** Remove a tag, or remove tagged media, in the selected scope */
export declare function removeSignageMediaTag(query_params: SignageMediaTagRemoveOptions): Promise<void>;
/**
 * Get the data for a media item
 * @param id ID of the media item to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showSignageMedia(id: string, query_params?: SignageMediaQueryOptions): Promise<SignageMedia>;
/**
 * Update the media item in the database
 * @param id ID of the media item
 * @param form_data New values for the media item
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateSignageMedia(id: string, form_data: Partial<SignageMedia>, method?: 'put' | 'patch'): Promise<SignageMedia>;
/**
 * Add a new media item to the database
 * @param form_data Media item data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addSignageMedia(form_data: Partial<SignageMedia>, query_params?: SignageCreateOptions): Promise<SignageMedia>;
/**
 * Remove a media item from the library, or unlink it from a single group
 * when `group_id` is set
 * @param id ID of the media item
 * @param query_params Query parameters to add the to request URL
 */
export declare function removeSignageMedia(id: string, query_params?: SignageRemoveOptions): Promise<import('../utilities/types').HashMap<any>>;
/**
 * Get the thumbnail URL for a media item.
 * This is the endpoint resolves to the image for the media item's thumbnail.
 */
export declare function mediaThumbnail(id: string): string;
/** Share one or more media items into another signage group */
export declare function shareSignageMedia(query_params: SignageShareOptions): Promise<SignageShareResult>;
/**
 * Query the available playlists
 * @param query_params Query parameters to add the to request URL
 */
export declare function querySignagePlaylists(query_params?: SignagePlaylistQueryOptions): import('..').QueryResponse<SignagePlaylist>;
/**
 * Get the data for a playlist
 * @param id ID of the playlist to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showSignagePlaylist(id: string, query_params?: SignagePlaylistQueryOptions): Promise<SignagePlaylist>;
/**
 * Update the playlist in the database
 * @param id ID of the playlist
 * @param form_data New values for the playlist
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateSignagePlaylist(id: string, form_data: Partial<SignagePlaylist>, method?: 'put' | 'patch'): Promise<SignagePlaylist>;
/**
 * Add a new playlist to the database
 * @param form_data Playlist data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addSignagePlaylist(form_data: Partial<SignagePlaylist>, query_params?: SignageCreateOptions): Promise<SignagePlaylist>;
/**
 * Remove an playlist from the database
 * @param id ID of the playlist
 * @param query_params Query parameters to add the to request URL
 */
export declare function removeSignagePlaylist(id: string, query_params?: SignageRemoveOptions): Promise<import('../utilities/types').HashMap<any>>;
/**
 * Get the current revision of the media list for a playlist
 * @param id ID of the playlist
 */
export declare function listSignagePlaylistMedia(id: string): Promise<SignagePlaylistMedia>;
/**
 * List all versions of the media lists for a playlist
 * @param id ID of the playlist
 * @param query_params Query parameters to add the to request URL
 */
export declare function listSignagePlaylistMediaRevisions(id: string, query_params?: SignagePlaylistRevisionsOptions): Promise<SignagePlaylistMedia[]>;
/**
 * Approve the latest revision of the media list for a playlist
 * @param id ID of the playlist to approve
 */
export declare function approveSignagePlaylist(id: string): Promise<any>;
/**
 * Request an approval for the latest revision of the media list for a playlist
 * @param id ID of the playlist to approve
 * @param group_id ID of the user group to message for approvals
 * @param message Optional message to send to the approver
 */
export declare function requestApprovalSignagePlaylist(id: string, group_id: string, message?: string, approver_id?: string): Promise<any>;
/**
 * List the approvers for the selected group of media list for a playlist
 * @param group_id ID of the user group to list approvers for
 */
export declare function listSignagePlaylistApprovers(group_id: string): Promise<unknown>;
/**
 * Update the media for a playlist
 * @param id ID of the playlist
 * @param form_data New list of media IDs for the playlist
 */
export declare function updateSignagePlaylistMedia(id: string, form_data: string[]): Promise<SignagePlaylistMedia>;
/** Add scheduled media to a distribution playlist */
export declare function scheduleSignagePlaylistMedia(id: string, form_data: Partial<SignagePlaylistItemSchedule>): Promise<SignagePlaylistMedia>;
/** Update scheduled media on a playlist */
export declare function updateSignagePlaylistMediaSchedule(id: string, item_id: string, form_data: Partial<SignagePlaylistItemSchedule>): Promise<SignagePlaylistItemSchedule>;
/** Share one or more playlists into another signage group */
export declare function shareSignagePlaylists(query_params: SignageShareOptions): Promise<SignageShareResult>;
/**
 * Query the available signage plugins
 * @param query_params Query parameters to add the to request URL
 */
export declare function querySignagePlugins(query_params?: SignagePluginQueryOptions): import('..').QueryResponse<SignagePlugin>;
/**
 * Get the data for a signage plugin
 * @param id ID of the signage plugin to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export declare function showSignagePlugin(id: string, query_params?: SignagePluginQueryOptions): Promise<SignagePlugin>;
/**
 * Update the signage plugin in the database
 * @param id ID of the signage plugin
 * @param form_data New values for the signage plugin
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateSignagePlugin(id: string, form_data: Partial<SignagePlugin>, method?: 'put' | 'patch'): Promise<SignagePlugin>;
/**
 * Add a new signage plugin to the database
 * @param form_data Signage plugin data
 */
export declare function addSignagePlugin(form_data: Partial<SignagePlugin>): Promise<SignagePlugin>;
/**
 * Remove a signage plugin from the database
 * @param id ID of the signage plugin
 * @param query_params Query parameters to add the to request URL
 */
export declare function removeSignagePlugin(id: string, query_params?: Record<string, any>): Promise<import('../utilities/types').HashMap<any>>;
/** Query the approved signage templates available to the current authority */
export declare function querySignageTemplates(query_params?: SignageTemplateQueryOptions): import('..').QueryResponse<SignageTemplate>;
/** Get a signage template, resolving a pending draft by default */
export declare function showSignageTemplate(id: string, query_params?: SignageTemplateShowOptions): Promise<SignageTemplate>;
/** Add a new signage template */
export declare function addSignageTemplate(form_data: Partial<SignageTemplate>, query_params?: SignageCreateOptions): Promise<SignageTemplate>;
/** Update a signage template */
export declare function updateSignageTemplate(id: string, form_data: Partial<SignageTemplate>, method?: 'put' | 'patch'): Promise<SignageTemplate>;
/**
 * Remove a signage template, or unlink it from a single group when
 * `group_id` is set. Pending drafts and group links cascade
 */
export declare function removeSignageTemplate(id: string, query_params?: SignageRemoveOptions): Promise<import('../utilities/types').HashMap<any>>;
/** Discard the pending draft for a signage template */
export declare function removeSignageTemplateDraft(id: string): Promise<any>;
/** Share one or more templates into another signage group */
export declare function shareSignageTemplates(query_params: SignageShareOptions): Promise<SignageShareResult>;
/** Approve the pending changes for a signage template */
export declare function approveSignageTemplate(id: string): Promise<SignageTemplate>;
/** List users who can approve signage templates for a group */
export declare function listSignageTemplateApprovers(group_id: string): Promise<SignageTemplateApprover[]>;
/** Request approval for a signage template's pending changes */
export declare function requestApprovalSignageTemplate(id: string, group_id: string, message?: string, approver_id?: string): Promise<any>;
/** Query signage template mappings in the current authority */
export declare function querySignageTemplateMappings(query_params?: SignageTemplateMappingQueryOptions): import('..').QueryResponse<SignageTemplateMapping>;
/** Get the details of a signage template mapping */
export declare function showSignageTemplateMapping(id: string): Promise<SignageTemplateMapping>;
/** Apply a signage template to a display or zone */
export declare function addSignageTemplateMapping(form_data: Partial<SignageTemplateMapping>): Promise<SignageTemplateMapping>;
/** Update the schedule of a signage template mapping */
export declare function updateSignageTemplateMapping(id: string, form_data: Partial<SignageTemplateMapping>, method?: 'put' | 'patch'): Promise<SignageTemplateMapping>;
/** Remove a signage template mapping */
export declare function removeSignageTemplateMapping(id: string): Promise<import('../utilities/types').HashMap<any>>;
