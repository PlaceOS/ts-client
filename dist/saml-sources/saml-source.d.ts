import { PlaceResource } from '../resources/resource';
import { HashMap } from '../utilities/types';
export interface PlaceSamlRequestAttribute {
    name: string;
    name_format: string;
    friendly_name: string;
}
export declare class PlaceSAMLSource extends PlaceResource {
    /** Type of auth source */
    readonly type = "saml";
    /** ID of the authority associted with the auth method */
    readonly authority_id: string;
    /** Name of the application requesting auth */
    readonly issuer: string;
    /**
     * Mapping of request params that exist during the request
     * phase of OmniAuth that should to be sent to the IdP
     */
    readonly idp_sso_target_url_runtime_params: HashMap<string>;
    /** Describes the format of the username required by this application */
    readonly name_identifier_format: string;
    /** Attribute that uniquely identifies the user */
    readonly uid_attribute: string;
    /** URL at which the SAML assertion should be received (SSO Service => Place URL) */
    readonly assertion_consumer_service_url: string;
    /** URL to which the authentication request should be sent (Place => SSO Service) */
    readonly idp_sso_target_url: string;
    /** Identity provider's certificate in PEM format (this or fingerprint is required) */
    readonly idp_cert: string;
    /** SHA1 fingerprint of the certificate */
    readonly idp_cert_fingerprint: string;
    /** Name for the attribute service */
    readonly attribute_service_name: string;
    /** Mapping of Attribute Names in a SAMLResponse to entries in the OmniAuth info hash */
    readonly attribute_statements: HashMap<string[]>;
    /** Mapping of Attribute Names in a SAMLResponse to entries in the OmniAuth info hash */
    readonly request_attributes: PlaceSamlRequestAttribute[];
    /** URL to which the single logout request and response should be sent */
    readonly idp_slo_target_url: string;
    /** Value to use as default RelayState for single log outs */
    readonly slo_default_relay_state: string;
    constructor(raw_data?: Partial<PlaceSAMLSource>);
}
