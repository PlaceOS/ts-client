import { HashMap } from '../utilities/types';
/**
 * @hidden
 */
export interface PlaceMetadataComplete extends Partial<PlaceMetadata> {
    parent_id?: string;
}
export declare class PlaceMetadata {
    /** ID of the parent resource associated with the metadata */
    readonly id: string;
    /** ID of the parent resource associated with the metadata */
    readonly parent_id: string;
    /** Name/ID of the zone metadata */
    readonly name: string;
    /** Description of what this metadata represents */
    readonly description: string;
    /** Metadata associated with this key. */
    readonly details: HashMap | any[];
    /** List user groups allowed to edit the metadata */
    readonly editors: readonly string[];
    /** JSON schema associated with the metadata details */
    readonly schema: string;
    /** ID of the schema associated with the metadata details */
    readonly schema_id: string;
    /** Unix timestamp that the metadata was created at */
    readonly created_at: number;
    /** Unix timestamp that the metadata was last modified at */
    readonly updated_at: number;
    /** ID of the user that last modified the metadata */
    readonly modified_by_id: string;
    /** Version of the data */
    readonly version: number;
    constructor(data?: PlaceMetadataComplete);
}
