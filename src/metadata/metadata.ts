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
    /** Name/ID of the zone metadata */
    public readonly name: string;
    /** Description of what this metadata represents */
    public readonly description: string;
    /** Metadata associated with this key. */
    public readonly details: HashMap | any[];
    /** List user groups allowed to edit the metadata */
    public readonly editors: readonly string [];
    /** JSON schema associated with the metadata details */
    public readonly schema: string;
    /** Unix timestamp that the metadata was last modified at */
    public readonly modified_at: number;
    /** ID of the user that last modified the metadata */
    public readonly modified_by: string;

    constructor(data: PlaceMetadataComplete = {}) {
        this.id = data.id || data.parent_id || '';
        this.name = data.name || '';
        this.description = data.description || '';
        this.details = data.details || {};
        this.editors = data.editors || [];
        this.schema = data.schema || '';
        this.modified_at = (data.modified_at || 0) * 1000 || Date.now();
        this.modified_by = data.modified_by || '';
    }
}
