import { getUnixTime } from 'date-fns';

export type MediaType = 'unknown' | 'image' | 'video' | 'audio' | 'text';
export type MediaOrientation =
    | 'portrait'
    | 'landscape'
    | 'square'
    | 'unspecified';

export class SignageMedia {
    public readonly id: string;
    public readonly created_at: number;
    public readonly updated_at: number;
    public readonly name: string;
    public readonly description: string;
    public readonly authority_id: string;
    public readonly start_time: number;
    public readonly play_time: number;
    public readonly animation: string;
    public readonly media_type: MediaType;
    public readonly orientation: string;
    public readonly media_uri: string;
    public readonly media_id: string;
    public readonly thumbnail_id: string;
    public readonly play_count: number;
    public readonly valid_from: string;
    public readonly valid_until: string;

    constructor(data: Partial<SignageMedia>) {
        this.id = data.id || '';
        this.created_at = data.created_at || getUnixTime(Date.now());
        this.updated_at = data.updated_at || getUnixTime(Date.now());
        this.name = data.name || '';
        this.description = data.description || '';
        this.authority_id = data.authority_id || '';
        this.start_time = data.start_time || 0;
        this.play_time = data.play_time || 0;
        this.animation = data.animation || '';
        this.media_type = data.media_type || 'unknown';
        this.orientation = data.orientation || 'unspecified';
        this.media_uri = data.media_uri || '';
        this.media_id = data.media_id || '';
        this.thumbnail_id = data.thumbnail_id || '';
        this.play_count = data.play_count || 0;
        this.valid_from = data.valid_from || '';
        this.valid_until = data.valid_until || '';
    }
}
