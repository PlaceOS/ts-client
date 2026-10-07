import { PlaceResource } from '../resources/resource';
import { HashMap } from '../utilities/types';
/** A customer organisation: the owner of domains and estate on a shared instance */
export declare class PlaceOrganisation extends PlaceResource {
    /** Description of the organisation */
    readonly description: string;
    /** ID of the partner that manages this organisation; empty when self managed */
    readonly partner_id: string;
    /** Who is invoiced: the partner or the organisation */
    readonly payer: 'partner' | 'organisation';
    /** Whether this is the partner's own staff organisation, whose admins reach every organisation under the partner */
    readonly partner_staff: boolean;
    /** Local configuration for the organisation */
    readonly config: HashMap;
    constructor(raw_data?: Partial<PlaceOrganisation>);
}
