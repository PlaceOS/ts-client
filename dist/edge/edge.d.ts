import { PlaceResource } from '../resources/resource';
import { HashMap } from '../utilities/types';
export declare class PlaceEdge extends PlaceResource {
    /** ID of the organisation that owns this row; empty when unowned */
    readonly organisation_id: string;
    readonly description: string;
    readonly secret: string;
    readonly x_api_key: string;
    readonly online: boolean;
    readonly last_seen: number;
    constructor(raw_data?: Partial<PlaceEdge>);
    toJSON(): HashMap;
}
