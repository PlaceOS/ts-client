import { PlaceResourceQueryOptions } from '../resources/interface';

export interface SignageMetrics {
    play_through_counts: Record<string, number>;
    playlist_counts: Record<string, number>;
    media_counts: Record<string, number>;
}

/** Allowable query parameters for signage media index endpoint */
export interface SignageMediaQueryOptions extends PlaceResourceQueryOptions {
    /** ID of the authority to filter the returned values on */
    authority_id?: string;
    /** Ignore state changes to the display media is requested for */
    preview?: boolean;
    /** ID of the currently playing item */
    item_id?: string;
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
