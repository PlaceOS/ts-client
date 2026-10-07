import { PlaceResource } from '../resources/resource';
import { HashMap } from '../utilities/types';
export declare class PlaceOAuthSource extends PlaceResource {
    /** Type of auth source */
    readonly type = "oauth";
    /** ID of the authority associted with the auth method */
    readonly authority_id: string;
    /** Application ID from the SSO provider providing the OAuth services */
    readonly client_id: string;
    /** Application secret from the SSO provider providing the OAuth services */
    readonly client_secret: string;
    /** Mapping of engine values to SSO provider values */
    readonly info_mappings: HashMap<string>;
    /** HTTP URL of the SSO provider */
    readonly site: string;
    /** URL from the SSO provider for authorisation */
    readonly authorize_url: string;
    /** HTTP Method used to generating tokens */
    readonly token_method: 'get' | 'post' | 'put';
    /** URL for generating user tokens */
    readonly token_url: string;
    /** Scheme used to authenticate the user */
    readonly auth_scheme: 'request_body' | 'basic_auth';
    /** Space seperated access scopes for the user */
    readonly scope: string;
    /** URL to grab user's profile details with a valid token */
    readonly raw_info_url: string;
    /** Additional params to be sent as part of the authorization reqest */
    readonly authorize_params: HashMap<string>;
    /** Security checks to be made on the returned data */
    readonly ensure_matching: HashMap<string[]>;
    constructor(raw_data?: Partial<PlaceOAuthSource>);
}
