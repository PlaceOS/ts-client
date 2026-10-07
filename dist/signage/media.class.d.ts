import { HashMap } from '../utilities/types';
import { SignagePlaylist } from './playlist.class';
export type MediaType = 'unknown' | 'image' | 'video' | 'audio' | 'plugin' | 'webpage' | 'externalimage' | 'external_image';
export declare enum MediaAnimation {
    Default = "default",
    Cut = "cut",
    CrossFade = "cross_fade",
    SlideTop = "slide_top",
    SlideLeft = "slide_left",
    SlideRight = "slide_right",
    SlideBottom = "slide_bottom"
}
export type MediaOrientation = 'unspecified' | 'portrait' | 'landscape' | 'square';
export declare class SignageMedia {
    readonly id: string;
    readonly created_at: number;
    readonly updated_at: number;
    readonly name: string;
    readonly description: string;
    readonly authority_id: string;
    readonly start_time: number;
    readonly play_time: number;
    readonly video_length: number;
    readonly animation?: MediaAnimation;
    readonly media_type: MediaType;
    readonly orientation: MediaOrientation;
    readonly media_uri: string;
    readonly media_id: string;
    readonly thumbnail_id: string;
    readonly plugin_id: string;
    readonly plugin_params: HashMap;
    readonly play_count: number;
    readonly valid_from?: number;
    readonly valid_until?: number;
    readonly tags: string[];
    /** User groups that the media item is shared with. Only set on the show requests result not the query */
    readonly shared_with: {
        id: string;
        name: string;
    }[];
    /** Playlists that the media item is included within. Only set on the show requests result not the query */
    readonly playlists: SignagePlaylist[];
    get media_url(): string;
    get thumbnail_url(): string;
    constructor(data: Partial<SignageMedia>);
}
