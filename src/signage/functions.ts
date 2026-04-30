import { create, query, remove, show, update } from '../api';
import { apiEndpoint } from '../auth';
import { post } from '../http/functions';
import { HttpJsonOptions } from '../http/interfaces';
import { task } from '../resources/functions';
import { toQueryString } from '../utilities/api';
import {
    SignageShareOptions,
    SignageMediaQueryOptions,
    SignageMetrics,
    SignagePluginQueryOptions,
} from './interfaces';
import { SignageMedia } from './media.class';
import { SignagePlaylist, SignagePlaylistMedia } from './playlist.class';
import { SignagePlugin } from './plugin.class';

/**
 * @private
 */
const PATH = 'signage';

/**
 * Get the data for a signage item
 * @param id ID of the signage item to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showSignage(
    id: string,
    query_params: SignageMediaQueryOptions = {},
    options?: HttpJsonOptions,
) {
    return show({ id, query_params, fn: (r) => r, path: `${PATH}`, options });
}

/**
 * Get the data for a signage item
 * @param id ID of the signage item to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showSignageMetrics(id: string) {
    return task({
        id,
        task_name: `metrics`,
        form_data: {},
        method: 'post',
        callback: (d) => d as SignageMetrics,
        path: PATH,
    });
}

/**
 * @private
 */
const MEDIA_PATH = 'signage/media';

/** Convert raw server data to an signagemedia object */
function processMedia(item: Partial<SignageMedia>) {
    return new SignageMedia(item);
}

/**
 * Query the available media
 * @param query_params Query parameters to add the to request URL
 */
export function querySignageMedia(query_params: SignageMediaQueryOptions = {}) {
    return query({ query_params, fn: processMedia, path: MEDIA_PATH });
}

/**
 * Get the data for a media item
 * @param id ID of the media item to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showSignageMedia(
    id: string,
    query_params: SignageMediaQueryOptions = {},
) {
    return show({ id, query_params, fn: processMedia, path: MEDIA_PATH });
}

/**
 * Update the media item in the database
 * @param id ID of the media item
 * @param form_data New values for the media item
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateSignageMedia(
    id: string,
    form_data: Partial<SignageMedia>,
    method: 'put' | 'patch' = 'patch',
) {
    return update({
        id,
        form_data,
        query_params: {},
        method,
        fn: processMedia,
        path: MEDIA_PATH,
    });
}

/**
 * Add a new media item to the database
 * @param form_data Media item data
 * @param query_params Query parameters to add the to request URL
 */
export function addSignageMedia(form_data: Partial<SignageMedia>) {
    return create({
        form_data,
        query_params: {},
        fn: processMedia,
        path: MEDIA_PATH,
    });
}

/**
 * Remove an media item from the database
 * @param id ID of the media item
 * @param query_params Query parameters to add the to request URL
 */
export function removeSignageMedia(
    id: string,
    query_params: Record<string, any> = {},
) {
    return remove({ id, query_params, path: MEDIA_PATH });
}

/**
 * Get the thumbnail URL for a media item.
 * This is the endpoint resolves to the image for the media item's thumbnail.
 */
export function mediaThumbnail(id: string): string {
    return `${apiEndpoint()}/${MEDIA_PATH}/${id}/thumbnail`;
}

/** Share one or more media items into another signage group */
export function shareSignageMedia(query_params: SignageShareOptions) {
    const q = toQueryString(query_params);
    return post(`${apiEndpoint()}/${MEDIA_PATH}/share${q ? '?' + q : ''}`, {});
}

/**
 * @private
 */
const PLAYLISTS_PATH = 'signage/playlists';

/** Convert raw server data to an playlist object */
function processPlaylist(item: Partial<SignagePlaylist>) {
    return new SignagePlaylist(item);
}

/**
 * Query the available playlists
 * @param query_params Query parameters to add the to request URL
 */
export function querySignagePlaylists(
    query_params: SignageMediaQueryOptions = {},
) {
    return query({ query_params, fn: processPlaylist, path: PLAYLISTS_PATH });
}

/**
 * Get the data for a playlist
 * @param id ID of the playlist to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showSignagePlaylist(
    id: string,
    query_params: SignageMediaQueryOptions = {},
) {
    return show({
        id,
        query_params,
        fn: processPlaylist,
        path: PLAYLISTS_PATH,
    });
}

/**
 * Update the playlist in the database
 * @param id ID of the playlist
 * @param form_data New values for the playlist
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateSignagePlaylist(
    id: string,
    form_data: Partial<SignagePlaylist>,
    method: 'put' | 'patch' = 'patch',
) {
    return update({
        id,
        form_data,
        query_params: {},
        method,
        fn: processPlaylist,
        path: PLAYLISTS_PATH,
    });
}

/**
 * Add a new playlist to the database
 * @param form_data Playlist data
 * @param query_params Query parameters to add the to request URL
 */
export function addSignagePlaylist(form_data: Partial<SignagePlaylist>) {
    return create({
        form_data,
        query_params: {},
        fn: processPlaylist,
        path: PLAYLISTS_PATH,
    });
}

/**
 * Remove an playlist from the database
 * @param id ID of the playlist
 * @param query_params Query parameters to add the to request URL
 */
export function removeSignagePlaylist(
    id: string,
    query_params: Record<string, any> = {},
) {
    return remove({ id, query_params, path: PLAYLISTS_PATH });
}

/**
 * Get media for a playlist
 * @param id ID of the playlist
 * @param query_params Query parameters to add the to request URL
 */
export function listSignagePlaylistMedia(
    id: string,
    query_params: SignageMediaQueryOptions = {},
) {
    return task({
        id,
        task_name: 'media',
        form_data: query_params,
        method: 'get',
        callback: (value: SignagePlaylistMedia) =>
            new SignagePlaylistMedia(value),
        path: PLAYLISTS_PATH,
    });
}

/**
 * List all versions of the media lists for a playlist
 * @param id ID of the playlist
 * @param query_params Query parameters to add the to request URL
 */
export function listSignagePlaylistMediaRevisions(
    id: string,
    query_params: SignageMediaQueryOptions = {},
) {
    return task({
        id,
        task_name: 'media/revisions',
        form_data: query_params,
        method: 'get',
        callback: (list: SignagePlaylistMedia[]) =>
            list.map(
                (item: SignagePlaylistMedia) => new SignagePlaylistMedia(item),
            ),
        path: PLAYLISTS_PATH,
    });
}

/**
 * Approve the latest revision of the media list for a playlist
 * @param id ID of the playlist to approve
 */
export function approveSignagePlaylist(id: string) {
    return task({
        id,
        task_name: 'media/approve',
        method: 'post',
        path: PLAYLISTS_PATH,
    });
}

/**
 * Update the media for a playlist
 * @param id ID of the playlist
 * @param form_data New list of media IDs for the playlist
 */
export function updateSignagePlaylistMedia(id: string, form_data: string[]) {
    return task({
        id,
        task_name: 'media',
        form_data,
        method: 'post',
        path: PLAYLISTS_PATH,
        callback: (value: SignagePlaylistMedia) =>
            new SignagePlaylistMedia(value),
    });
}

/** Share one or more playlists into another signage group */
export function shareSignagePlaylists(query_params: SignageShareOptions) {
    const q = toQueryString(query_params);
    return post(`${apiEndpoint()}/${PLAYLISTS_PATH}/share${q ? '?' + q : ''}`, {});
}

/**
 * @private
 */
const PLUGINS_PATH = 'signage/plugins';

/** Convert raw server data to a signage plugin object */
function processPlugin(item: Partial<SignagePlugin>) {
    return new SignagePlugin(item);
}

/**
 * Query the available signage plugins
 * @param query_params Query parameters to add the to request URL
 */
export function querySignagePlugins(
    query_params: SignagePluginQueryOptions = {},
) {
    return query({ query_params, fn: processPlugin, path: PLUGINS_PATH });
}

/**
 * Get the data for a signage plugin
 * @param id ID of the signage plugin to retrieve
 * @param query_params Query parameters to add the to request URL
 */
export function showSignagePlugin(
    id: string,
    query_params: SignagePluginQueryOptions = {},
) {
    return show({
        id,
        query_params,
        fn: processPlugin,
        path: PLUGINS_PATH,
    });
}

/**
 * Update the signage plugin in the database
 * @param id ID of the signage plugin
 * @param form_data New values for the signage plugin
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateSignagePlugin(
    id: string,
    form_data: Partial<SignagePlugin>,
    method: 'put' | 'patch' = 'patch',
) {
    return update({
        id,
        form_data,
        query_params: {},
        method,
        fn: processPlugin,
        path: PLUGINS_PATH,
    });
}

/**
 * Add a new signage plugin to the database
 * @param form_data Signage plugin data
 */
export function addSignagePlugin(form_data: Partial<SignagePlugin>) {
    return create({
        form_data,
        query_params: {},
        fn: processPlugin,
        path: PLUGINS_PATH,
    });
}

/**
 * Remove a signage plugin from the database
 * @param id ID of the signage plugin
 * @param query_params Query parameters to add the to request URL
 */
export function removeSignagePlugin(
    id: string,
    query_params: Record<string, any> = {},
) {
    return remove({ id, query_params, path: PLUGINS_PATH });
}
