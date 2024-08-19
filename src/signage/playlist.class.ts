import { MediaAnimation } from './media.class';

export class SignagePlaylistMedia {
    public readonly id: string;
    public readonly playlist_id: string;
    public readonly items: string[];
    public readonly user_id: string;
    public readonly user_name: string;
    public readonly user_email: string;
    public readonly created_at: number;
    public readonly updated_at: number;

    constructor(data: Partial<SignagePlaylistMedia> = {}) {
        this.id = data.id || '';
        this.playlist_id = data.playlist_id || '';
        this.items = data.items || [];
        this.user_id = data.user_id || '';
        this.user_name = data.user_name || '';
        this.user_email = data.user_email || '';
        this.created_at = data.created_at || 0;
        this.updated_at = data.updated_at || 0;
    }
}

export class SignagePlaylist {
    public readonly id: string;
    public readonly created_at: number;
    public readonly updated_at: number;
    public readonly name: string;
    public readonly description: string;
    public readonly authority_id: string;
    public readonly orientation: string;
    public readonly play_count: number;
    public readonly play_through_count: number;
    public readonly default_animation: MediaAnimation;
    public readonly random: boolean;
    public readonly enabled: boolean;
    public readonly default_duration: number;
    public readonly play_hours: string;
    public readonly play_at: string;
    public readonly play_cron: string;
    public readonly valid_from?: number;
    public readonly valid_until?: number;

    constructor(data: Partial<SignagePlaylist>) {
        this.id = data.id || '';
        this.created_at = data.created_at || 0;
        this.updated_at = data.updated_at || 0;
        this.name = data.name || '';
        this.description = data.description || '';
        this.authority_id = data.authority_id || '';
        this.orientation = data.orientation || '';
        this.play_count = data.play_count || 0;
        this.play_through_count = data.play_through_count || 0;
        this.default_animation = data.default_animation || MediaAnimation.Cut;
        this.random = data.random || false;
        this.enabled = data.enabled ?? true;
        this.default_duration = data.default_duration ?? 15;
        this.valid_from = data.valid_from;
        this.valid_until = data.valid_until;
        this.play_hours = data.play_hours || '';
        this.play_at = data.play_at || '';
        this.play_cron = data.play_cron || '';
    }
}
