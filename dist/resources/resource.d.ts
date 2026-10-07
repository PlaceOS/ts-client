import { HashMap } from '../utilities/types';
export declare abstract class PlaceResource {
    /** Unique Identifier of the object */
    readonly id: string;
    /** Human readable name of the object */
    readonly name: string;
    /** Unix epoch in seconds of the creation time of the object */
    readonly created_at: number;
    /** Unix epoch in seconds of the creation time of the object */
    readonly updated_at: number;
    /** Version of the data */
    readonly version: number;
    constructor(raw_data?: Partial<PlaceResource>);
    /**
     * Convert object into plain object
     */
    toJSON(): HashMap;
}
