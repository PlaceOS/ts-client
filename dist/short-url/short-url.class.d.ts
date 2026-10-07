export declare class PlaceShortUrl {
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
    constructor(data: Partial<PlaceShortUrl>);
}
