import { PlaceResource } from '../resources/resource';
export declare class PlaceLDAPSource extends PlaceResource {
    /** Type of auth source */
    readonly type = "ldap";
    /** ID of the authority associted with the auth method */
    readonly authority_id: string;
    /** HTTP URL of the SSO provider */
    readonly host: string;
    /** Application ID from the SSO provider providing the Ldap services */
    readonly port: number;
    /** Application secret from the SSO provider providing the Ldap services */
    readonly auth_method: 'plain' | 'ssl' | 'tls';
    /** Mapping of engine values to SSO provider values */
    readonly uid: string;
    /** URL from the SSO provider for authorisation */
    readonly base: string;
    /** Default DN to user when performing a user lookup */
    readonly bind_dn: string;
    /** Password to access LDAP service */
    readonly password: string;
    /**
     * LDAP Filter. Can be used instead of `uid`.
     * e.g. (&(uid=%{username})(memberOf=cn=myapp-users,ou=groups,dc=example,dc=com))
     */
    readonly filter: string;
    constructor(raw_data?: Partial<PlaceLDAPSource>);
}
