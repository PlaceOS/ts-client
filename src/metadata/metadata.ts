import { HashMap } from '../utilities/types';

/**
 * @hidden
 */
export interface PlaceMetadataComplete extends Partial<PlaceMetadata> {
    parent_id?: string;
}

export class PlaceMetadata {
    /** ID of the parent resource associated with the metadata */
    public readonly id: string;
    /** ID of the parent resource associated with the metadata */
    public readonly parent_id: string;
    /** Name/ID of the zone metadata */
    public readonly name: string;
    /** Description of what this metadata represents */
    public readonly description: string;
    /** Metadata associated with this key. */
    public readonly details: HashMap | any[];
    /** List user groups allowed to edit the metadata */
    public readonly editors: readonly string[];
    /** JSON schema associated with the metadata details */
    public readonly schema: string;
    /** ID of the schema associated with the metadata details */
    public readonly schema_id: string;
    /** Unix timestamp that the metadata was created at */
    public readonly created_at: number;
    /** Unix timestamp that the metadata was last modified at */
    public readonly updated_at: number;
    /** ID of the user that last modified the metadata */
    public readonly modified_by_id: string;
    /** Version of the data */
    public readonly version: number;

    constructor(data: PlaceMetadataComplete = {}) {
        this.parent_id = data.parent_id || data.id || '';
        this.id = this.parent_id;
        this.name = data.name || '';
        this.description = data.description || '';
        try {
            this.details =
                (typeof data.details === 'string'
                    ? JSON.parse(data.details)
                    : data.details) || {};
        } catch {
            this.details = data.details || {};
        }
        this.editors = data.editors || [];
        this.schema_id = data.schema_id || data.schema || '';
        this.schema = this.schema_id;
        this.created_at = (data.created_at || 0) * 1000 || Date.now();
        this.updated_at = (data.updated_at || 0) * 1000 || Date.now();
        this.modified_by_id = data.modified_by_id || '';
        this.version = data.version || 0;
    }
}
