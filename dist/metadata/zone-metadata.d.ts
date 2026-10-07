import { HashMap } from '../utilities/types';
import { PlaceZone } from '../zones/zone';
import { PlaceMetadata } from './metadata';
export declare class PlaceZoneMetadata {
    /** Zone associated with the metadata */
    readonly zone: PlaceZone;
    /** Metadata for zone */
    readonly metadata: HashMap<PlaceMetadata>;
    /** List of the root keys in the metadata */
    readonly keys: string[];
    constructor(data?: Partial<PlaceZoneMetadata>);
}
