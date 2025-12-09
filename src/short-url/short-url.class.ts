export class PlaceShortUrl {
    readonly id: string;
    readonly name: string;
    readonly uri: string;
    readonly description: string;
    readonly user_id: string;
    readonly user_email: string;
    readonly user_name: string;
    readonly redirect_count: number;
    readonly enabled: boolean;
    readonly valid_from: string;
    readonly valid_until: string;
    readonly authority_id: string;
    readonly created_at: number;
    readonly updated_at: number;

    constructor(data: Partial<PlaceShortUrl>) {
        this.id = data.id || '';
        this.name = data.name || '';
        this.uri = data.uri || '';
        this.description = data.description || '';
        this.user_id = data.user_id || '';
        this.user_email = data.user_email || '';
        this.user_name = data.user_name || '';
        this.redirect_count = data.redirect_count || 0;
        this.enabled = data.enabled ?? true;
        this.valid_from = data.valid_from || '';
        this.valid_until = data.valid_until || '';
        this.authority_id = data.authority_id || '';
        this.created_at = data.created_at || 0;
        this.updated_at = data.updated_at || 0;
    }
}
