import { PlaceResource } from '../resources/resource';
import { HashMap } from '../utilities/types';

/** A customer organisation: the owner of domains and estate on a shared instance */
export class PlaceOrganisation extends PlaceResource {
    /** Description of the organisation */
    public readonly description: string;
    /** ID of the partner that manages this organisation; empty when self managed */
    public readonly partner_id: string;
    /** Who is invoiced: the partner or the organisation */
    public readonly payer: 'partner' | 'organisation';
    /** Whether this is the partner's own staff organisation, whose admins reach every organisation under the partner */
    public readonly partner_staff: boolean;
    /** Local configuration for the organisation */
    public readonly config: HashMap;

    constructor(raw_data: Partial<PlaceOrganisation> = {}) {
        super(raw_data);
        this.description = raw_data.description || '';
        this.partner_id = raw_data.partner_id || '';
        this.payer = raw_data.payer || 'organisation';
        this.partner_staff = !!raw_data.partner_staff;
        this.config = raw_data.config || {};
    }
}
