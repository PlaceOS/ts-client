import { PlaceResource } from '../resources/resource';
import { HashMap } from '../utilities/types';
/** An integrator that brings in and manages organisations, or the management partner that is PlaceOS itself */
export declare class PlacePartner extends PlaceResource {
    /** Description of the partner */
    readonly description: string;
    /** Whether this is the platform operator's own partner; its staff reach every organisation */
    readonly management: boolean;
    /** ID of the parent partner, if any */
    readonly parent_id: string;
    /** Local configuration for the partner */
    readonly config: HashMap;
    constructor(raw_data?: Partial<PlacePartner>);
}
