import { PlaceResource } from '../resources/resource';
import { HashMap } from '../utilities/types';

export class PlaceDomain extends PlaceResource {
    /** Domain name */
    public readonly domain: string;
    /** Login URL for the domain */
    public readonly login_url: string;
    /** Logout URL for the domain */
    public readonly logout_url: string;
    /** Description of the domain domain */
    public readonly description: string;
    /** Local configuration for the domain */
    public readonly config: HashMap;
    /** Internal settings for the domain */
    public readonly internals: HashMap;
    /** List of email domains associated with the domain */
    public readonly email_domains: string[];

    constructor(raw_data: Partial<PlaceDomain> = {}) {
        super(raw_data);
        this.description = raw_data.description || '';
        this.domain = raw_data.domain || '';
        this.login_url = raw_data.login_url || '';
        this.logout_url = raw_data.logout_url || '';
        this.config = raw_data.config || {};
        this.internals = raw_data.internals || {};
        this.email_domains = raw_data.email_domains || [];
    }
}
