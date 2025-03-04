import { PlaceResourceQueryOptions } from '../resources/interface';

export interface SignageMetrics {
    play_through_counts: Record<string, number>;
    playlist_counts: Record<string, number>;
    media_counts: Record<string, number>;
}

/** Allowable query parameters for systems index endpoint */
export interface SignageMediaQueryOptions extends PlaceResourceQueryOptions {
    /** ID of the authority to filter the returned values on */
    authority_id?: string;
}
