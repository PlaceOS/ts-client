import { PlaceResource } from '../resources/resource';
import { HashMap } from '../utilities/types';

/** An integrator that brings in and manages organisations, or the management partner that is PlaceOS itself */
export class PlacePartner extends PlaceResource {
    /** Description of the partner */
    public readonly description: string;
    /** Whether this is the platform operator's own partner; its staff reach every organisation */
    public readonly management: boolean;
    /** ID of the parent partner, if any */
    public readonly parent_id: string;
    /** Local configuration for the partner */
    public readonly config: HashMap;

    constructor(raw_data: Partial<PlacePartner> = {}) {
        super(raw_data);
        this.description = raw_data.description || '';
        this.management = !!raw_data.management;
        this.parent_id = raw_data.parent_id || '';
        this.config = raw_data.config || {};
    }
}
