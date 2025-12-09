/** Storage type enumeration */
export type StorageType = 's3' | 'azure' | 'google';

export class PlaceStorage {
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

    constructor(data: Partial<PlaceStorage>) {
        this.id = data.id || '';
        this.storage_type = data.storage_type || null;
        this.bucket_name = data.bucket_name || '';
        this.region = data.region || '';
        this.access_key = data.access_key || '';
        this.access_secret = data.access_secret || '';
        this.authority_id = data.authority_id || '';
        this.endpoint = data.endpoint || '';
        this.is_default = data.is_default ?? false;
        this.ext_filter = data.ext_filter || [];
        this.mime_filter = data.mime_filter || [];
        this.created_at = data.created_at || 0;
        this.updated_at = data.updated_at || 0;
    }
}
