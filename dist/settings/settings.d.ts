import { PlaceResource } from '../resources/resource';
import { EncryptionLevel } from './interfaces';
export declare class PlaceSettings extends PlaceResource {
    /** ID of the parent zone/system/module/driver */
    readonly parent_id: string;
    /** Unix timestamp in seconds of when the settings where last updated */
    readonly updated_at: number;
    /** Access level for the settings data */
    readonly encryption_level: EncryptionLevel;
    /** Contents of the settings */
    readonly settings_string: string;
    /** Top level keys for the parsed settings */
    readonly keys: string[];
    /** ID of the user that last modified the metadata */
    readonly modified_by_id: string;
    /** Contents of the settings */
    get value(): string;
    constructor(raw_data?: Partial<PlaceSettings>);
}
