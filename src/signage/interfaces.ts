import { PlaceResourceQueryOptions } from '../resources/interface';

export interface SignageMetrics {
    play_through_counts: Record<string, number>;
    playlist_counts: Record<string, number>;
    media_counts: Record<string, number>;
}

export interface SignagePlaylistSchedule {
    readonly play_cron: string;
    readonly play_period: number;
    readonly play_at?: number;
    readonly play_takeover: boolean;
}

export interface SignagePlaylistApprover {
    id: string;
    name: string;
}

/** Allowable query parameters for signage media index endpoint */
export interface SignageMediaQueryOptions extends PlaceResourceQueryOptions {
    /** ID of the authority to filter the returned values on */
    authority_id?: string;
    /** ID of the group to scope media to */
    group_id?: string;
    /** Tags to filter media by */
    tags?: string[] | string;
    /** Ignore state changes to the display media is requested for */
    preview?: boolean;
    /** ID of the currently playing item */
    item_id?: string;
}

/** Allowable query parameters for signage media tags endpoint */
export interface SignageMediaTagsOptions {
    /** ID of the group to scope media tags to */
    group_id?: string;
}

/** Allowable query parameters for signage playlists index endpoint */
export interface SignagePlaylistQueryOptions
    extends PlaceResourceQueryOptions {}

/** Allowable query parameters for signage playlist media revisions endpoint */
export interface SignagePlaylistRevisionsOptions {
    /** Maximum number of revisions to return */
    limit?: number;
}

/** Allowable query parameters for signage plugins index endpoint */
export interface SignagePluginQueryOptions extends PlaceResourceQueryOptions {}

/** Allowable query parameters for signage templates index endpoint */
export interface SignageTemplateQueryOptions extends PlaceResourceQueryOptions {
    /** ID of the group to scope templates to */
    group_id?: string;
}

/** Allowable query parameters when creating a signage template */
export interface SignageTemplateCreateOptions {
    /** ID of the group to link the new template to */
    group_id?: string;
}

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

export interface SignageTemplateShareOptions {
    /** Template IDs to share into the target group */
    items: string[] | string;
    /** Destination signage group ID */
    to: string;
}

export interface SignageTemplateShareResult {
    linked: string[];
    already_present: string[];
}

export interface SignageShareOptions {
    /** Comma separated list of media or playlist IDs */
    items: string;
    /** Destination signage group ID */
    to: string;
}
