/** Storage type enumeration */
export type StorageType = 's3' | 'azure' | 'google';
export declare class PlaceStorage {
    readonly id: string;
    readonly storage_type: StorageType | null;
    readonly bucket_name: string;
    readonly region: string;
    readonly access_key: string;
    readonly access_secret: string;
    readonly authority_id: string;
    readonly endpoint: string;
    readonly is_default: boolean;
    readonly ext_filter: string[];
    readonly mime_filter: string[];
    readonly created_at: number;
    readonly updated_at: number;
    constructor(data: Partial<PlaceStorage>);
}
