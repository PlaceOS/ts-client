import { HashMap } from '../utilities/types';

export const MOCK_AUTHORITY = {
    id: 'mock-authority',
    name: 'localhost:4200',
    description: '',
    domain: 'localhost:4200',
    login_url: `/login?continue={{url}}`,
    logout_url: `/logout`,
    session: true,
    production: false,
    config: {},
    version: `2.0.0`,
};

export interface AuthorizeDetails {
    /** Access token */
    token?: string;
    /** Token generation code */
    code?: string;
    /** TTL of access token */
    expires_in?: string;
}

export interface PlaceAuthority {
    /** Place ID for the Authority */
    readonly id: string;
    /** Authority name */
    readonly name: string;
    /** Description of the authority site */
    readonly description: string;
    /** Domain of the authority */
    readonly domain: string;
    /** URL for user to login for authentication */
    readonly login_url: string;
    /** URL for user to clear authentication details */
    readonly logout_url: string;
    /** Whether the engine instance is a production build */
    readonly production: boolean;
    /** Whether the user has an authentication session */
    readonly session: boolean;
    /** Configuration metadata for the authority */
    readonly config: HashMap;
    /** Version of the PlaceOS API */
    readonly version?: string;
    /** URL to the metrics interface for Place */
    readonly metrics?: string;
    /** DSN for Sentry integration */
    readonly sentry_dsn?: string;
    /** List of email domains associated with the authority */
    readonly email_domains?: string[];
}

export interface PlaceAuthOptions {
    auth_type?: 'auth_code' | 'implicit' | 'password';
    /** Host name and port of the engine server */
    host?: string;
    /** Whether application uses TLS/SSL */
    secure?: boolean;
    /** URI for authorizing the user */
    auth_uri: string;
    /** URI for generating new tokens */
    token_uri: string;
    /** URI for handling authentication redirects. e.g. `/assets/oauth-resp.html` */
    redirect_uri: string;
    /** Scope of the user permissions needed to access the application  */
    scope: string;
    /** Which keystore to use localStorage or sessionStorage. Defaults to `'local'' */
    storage?: 'local' | 'session';
    /** Whether to perform authentication in an iframe */
    use_iframe?: boolean;
    /** Whether service should handling user login. Defaults to `true` */
    handle_login?: boolean;
    /** Whether system is in mock mode */
    mock?: boolean;
    /** Username of the user to be authorised */
    username?: string;
    /** Password for the user being authorised */
    password?: string;
    /** Application secret */
    client_secret?: string;
    /** Whether access tokens should be injected into request headers */
    token_header?: boolean;
    /** Version of the API endpoints to use */
    version?: 'ACA Engine' | 'PlaceOS';
    /** Whether X-API-KEY values should be ignored */
    ignore_api_key?: boolean;
}

export interface PlaceTokenResponse {
    /** New access token */
    access_token: string;
    /** New refresh token */
    refresh_token: string;
    /** Time in seconds with which the token expires */
    expires_in: string;
}
