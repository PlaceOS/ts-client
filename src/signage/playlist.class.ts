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
    public readonly default_animation: string;
    public readonly random: boolean;
    public readonly enabled: boolean;
    public readonly default_duration: number;
    public readonly valid_from: string;
    public readonly valid_until: string;
    public readonly play_hours: string;
    public readonly play_at: string;
    public readonly play_cron: string;

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
        this.default_animation = data.default_animation || '';
        this.random = data.random || false;
        this.enabled = data.enabled || false;
        this.default_duration = data.default_duration ?? 15;
        this.valid_from = data.valid_from || '';
        this.valid_until = data.valid_until || '';
        this.play_hours = data.play_hours || '';
        this.play_at = data.play_at || '';
        this.play_cron = data.play_cron || '';
    }
}
