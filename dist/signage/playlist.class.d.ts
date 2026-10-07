import { SignagePlaylistSchedule } from './interfaces';
import { MediaAnimation, SignageMedia } from './media.class';
export declare class SignagePlaylistMedia {
    readonly id: string;
    readonly playlist_id: string;
    readonly items: string[];
    readonly media: SignageMedia[];
    readonly schedules: SignagePlaylistItemSchedule[];
    readonly created_at: number;
    readonly updated_at: number;
    readonly user_id: string;
    readonly user_name: string;
    readonly user_email: string;
    readonly approved: boolean;
    readonly approval_requested: boolean;
    readonly requested_by_id: string;
    readonly approved_by_id: string;
    readonly approved_by_email: string;
    readonly approved_by_name: string;
    readonly shared_with: {
        id: string;
        name: string;
    }[];
    constructor(data?: Partial<SignagePlaylistMedia>);
}
export declare class SignagePlaylistItemSchedule {
    readonly id: string;
    readonly playlist_id: string;
    readonly item_id: string;
    readonly schedules: SignagePlaylistSchedule[];
    readonly created_at: number;
    readonly updated_at: number;
    readonly media: SignageMedia;
    constructor(data?: Partial<SignagePlaylistItemSchedule>);
}
export declare class SignagePlaylist {
    readonly id: string;
    readonly created_at: number;
    readonly updated_at: number;
    readonly name: string;
    readonly description: string;
    readonly authority_id: string;
    readonly orientation: string;
    readonly play_count: number;
    readonly play_through_count: number;
    readonly default_animation: MediaAnimation;
    readonly random: boolean;
    readonly enabled: boolean;
    readonly distribution: boolean;
    readonly default_duration: number;
    readonly schedules: SignagePlaylistSchedule[];
    readonly valid_from?: number;
    readonly valid_until?: number;
    readonly shared_with: {
        id: string;
        name: string;
    }[];
    constructor(data: Partial<SignagePlaylist>);
}
