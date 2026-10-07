import { PlaceResource } from '../resources/resource';
import { HashMap } from '../utilities/types';
export declare class PlaceDomain extends PlaceResource {
    /** ID of the organisation that owns this row; empty when unowned */
    readonly organisation_id: string;
    /** Domain name */
    readonly domain: string;
    /** Login URL for the domain */
    readonly login_url: string;
    /** Logout URL for the domain */
    readonly logout_url: string;
    /** Description of the domain domain */
    readonly description: string;
    /** Local configuration for the domain */
    readonly config: HashMap;
    /** Internal settings for the domain */
    readonly internals: HashMap;
    /** List of email domains associated with the domain */
    readonly email_domains: string[];
    constructor(raw_data?: Partial<PlaceDomain>);
}
