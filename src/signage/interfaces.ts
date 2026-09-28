import { PlaceResourceQueryOptions } from '../resources/interface';
import { SignagePluginType } from './plugin.class';

export interface SignageMetrics {
    play_through_counts: Record<string, number>;
    playlist_counts: Record<string, number>;
    media_counts: Record<string, number>;
}

export interface SignagePlaylistSchedule {
    readonly play_cron: string;
    readonly play_period: number;
    /** One-off play time as unix epoch seconds. Do not set with `play_at_local` */
    readonly play_at?: number;
    /**
     * One-off play time in the local timezone of the display.
     * ISO 8601 with no offset, e.g. `2027-01-01T00:00:00`. Do not set with `play_at`
     */
    readonly play_at_local?: string;
    readonly play_takeover: boolean;
    /** Unix epoch seconds this schedule becomes valid. Required when `mask` is set */
    readonly valid_from?: number;
    /** Ignore when not truthy */
    readonly valid_until?: number;
    /**
     * Bitmask of `0`s and `1`s (max 128 chars). Active when not empty.
     * Requires `valid_from`
     */
    readonly mask?: string;
}

export interface SignagePlaylistApprover {
    id: string;
    name: string;
}

/** Allowable query parameters for the signage display endpoint */
export interface SignageDisplayOptions {
    /** ID of the currently playing item, if the player is playing content */
    item_id?: string;
    /** Ignore state changes to the display. Used by the preview player */
    preview?: boolean;
}

/** Allowable query parameters for signage media index endpoint */
export interface SignageMediaQueryOptions extends PlaceResourceQueryOptions {
    /** ID of the group to scope media to */
    group_id?: string;
    /** Return media carrying any of these tags */
    tags?: string[] | string;
}

/** Allowable query parameters for the signage media tag endpoints */
export interface SignageMediaTagsOptions {
    /** ID of the group to scope media tags to */
    group_id?: string;
}

/** Allowable query parameters when creating signage content */
export interface SignageCreateOptions {
    /** Group to link the new item to */
    group_id?: string;
}

/** Query parameters for renaming a signage media tag */
export interface SignageMediaTagRenameOptions extends SignageMediaTagsOptions {
    /** Existing tag name */
    current_tag: string;
    /** Replacement tag name */
    new_tag: string;
}

/** Query parameters for removing a signage media tag */
export interface SignageMediaTagRemoveOptions extends SignageMediaTagsOptions {
    /** Tag name to remove */
    tag: string;
    /** Remove tagged media instead of removing the tag from each item */
    remove_media?: boolean;
}

/** Allowable query parameters when removing a media item or template */
export interface SignageRemoveOptions {
    /**
     * Unlink the item from this group instead of deleting it outright.
     * Requires `Delete` or `Manage` permission on the group
     */
    group_id?: string;
}

/** Allowable query parameters for signage playlists index endpoint */
export interface SignagePlaylistQueryOptions extends PlaceResourceQueryOptions {
    /** ID of the group to scope playlists to */
    group_id?: string;
}

/** Allowable query parameters for signage playlist media revisions endpoint */
export interface SignagePlaylistRevisionsOptions {
    /** Maximum number of revisions to return */
    limit?: number;
}

/** Allowable query parameters for signage plugins index endpoint */
export interface SignagePluginQueryOptions extends PlaceResourceQueryOptions {
    /** Only return plugins that are enabled */
    enabled?: boolean;
    /** Only return plugins of this type */
    plugin_type?: SignagePluginType;
}

/** Allowable query parameters for signage templates index endpoint */
export interface SignageTemplateQueryOptions extends PlaceResourceQueryOptions {
    /** ID of the group to scope templates to */
    group_id?: string;
    /** Return approved versions instead of pending drafts */
    approved?: boolean;
}

/** Allowable query parameters when creating a signage template */
export type SignageTemplateCreateOptions = SignageCreateOptions;

/** Allowable query parameters for signage template show endpoint */
export interface SignageTemplateShowOptions {
    /** Return the approved template even when a pending draft exists */
    approved?: boolean;
}

/** Allowable query parameters for signage template mappings index endpoint */
export interface SignageTemplateMappingQueryOptions
    extends PlaceResourceQueryOptions {
    /** ID of the display to filter mappings by */
    control_system_id?: string;
    /** ID of the zone to filter mappings by */
    zone_id?: string;
    /** ID of the template to filter mappings by */
    template_id?: string;
}

export interface SignageTemplateApprover {
    id: string;
    name: string;
}

/** Query parameters for the media, playlist and template share endpoints */
export interface SignageShareOptions {
    /** IDs of the items to share into the target group */
    items: string[] | string;
    /** Destination signage group ID */
    to: string;
}

/** Result of sharing media, playlists or templates into a group */
export interface SignageShareResult {
    /** IDs newly linked to the target group */
    linked: string[];
    /** IDs already linked to the target group */
    already_present: string[];
}

/** @deprecated Use {@link SignageShareOptions} */
export type SignageTemplateShareOptions = SignageShareOptions;

/** @deprecated Use {@link SignageShareResult} */
export type SignageTemplateShareResult = SignageShareResult;
