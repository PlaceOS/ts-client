import { Signal } from '../utilities/signal';
import { PlaceAuthOptions, PlaceAuthority, PlaceTokenResponse } from './interfaces';
/** API Endpoint for the retrieved version of PlaceOS */
export declare function apiEndpoint(): string;
/** Path of the API endpoint */
export declare function httpRoute(): string;
/**
 * @hidden
 * Whether requests need token in the request URL or as a header
 */
export declare function needsTokenHeader(): boolean;
/** OAuth 2 client ID for the application */
export declare function clientId(): string;
/** Redirect URI for the OAuth flow */
export declare function redirectUri(): string;
/** Manually set an X API key */
export declare function setAPI_Key(api_key: string, trusted?: boolean): void;
/** Get X API Key for application */
export declare function apiKey(): string;
/** Manually set an access token */
export declare function setToken(new_token: string, expires_at?: number): void;
/** Bearer token for authenticating requests to PlaceOS */
export declare function token(return_expired?: boolean): string;
/** Refresh token for renewing the access token */
export declare function refreshToken(): string;
/** Host domain of the PlaceOS server */
export declare function host(): string;
/** Whether the application has an authentication token */
export declare function hasToken(): boolean;
/** Signal for token state */
export declare function listenForToken(): Signal<boolean>;
/** Place Authority details */
export declare function authority(): PlaceAuthority | undefined;
/** Whether PlaceOS is online */
export declare function isOnline(): boolean;
/** Whether requests should use mock handlers */
export declare function isMock(): boolean;
/** Whether PlaceOS connection is secure */
export declare function isSecure(): boolean;
/** Signal for the online state of PlaceOS */
export declare function onlineState(): Signal<boolean>;
/** Whether this application is trusted */
export declare function isTrusted(): boolean;
/** Whether this application is on a fixed location device */
export declare function isFixedDevice(): boolean;
/**
 * @hidden
 * Check for an auth related param in the URL or storage
 * @param name Name of the paramater to look for
 */
export declare function checkStoreForAuthParam(name: string, store?: boolean): string;
/** Initialise authentication for the http and realtime APIs */
export declare function setup(options: PlaceAuthOptions): Promise<void>;
/**
 * Complete authentication with a redirect URL received outside the normal
 * browser navigation flow. Use this from native wrapper applications that
 * perform login in an external browser and receive the OAuth redirect as a
 * deep link, where this context's location never changes.
 * @param url Redirect/deep link URL containing the auth parameters
 * @returns Promise resolving to the new access token
 */
export declare function handleAuthRedirect(url: string): Promise<string>;
export declare function setStorage(type: 'session' | 'local'): void;
/**
 * @private
 */
export declare function cleanupAuth(): void;
/**
 * Refresh authentication
 */
export declare function refreshAuthority(): Promise<void>;
/**
 * Invalidate the current access token
 */
export declare function invalidateToken(): void;
/**
 * Check the users authentication credentials and perform actions
 * required for the user to authenticate
 * @param state Additional state information for auth requests
 */
export declare function authorise(state?: string, api_authority?: PlaceAuthority): Promise<string>;
/**
 * Logout and clear user credentials for the application
 */
export declare function logout(): void;
/**
 * @private
 * Load authority details from engine
 */
export declare function loadAuthority(tries?: number): Promise<void>;
/**
 * @private
 * @param state
 */
export declare function sendToAuthorize(state?: string): Promise<void>;
/**
 * @private
 * @param url Authorization URL
 */
export declare function authorizeWithIFrame(url: string): Promise<void>;
/**
 * @private
 * @param api_authority
 */
export declare function sendToLogin(api_authority: PlaceAuthority): void;
/**
 * @private
 * Check authentication token
 */
export declare function checkToken(): Promise<boolean>;
/**
 * @private
 * Check URL for auth parameters
 */
export declare function checkForAuthParameters(): Promise<boolean>;
/**
 * @private
 * Generate login URL for the user to authenticate
 * @param state State information to send to the server
 */
export declare function createLoginURL(state?: string): string;
/**
 * @private
 * @param length Length of the challenge string
 */
export declare function generateChallenge(length?: number): {
    challenge: string;
    verify: string;
};
/**
 * @private
 * Generate token generation URL
 */
export declare function createRefreshURL(): [string, string];
/**
 * @private
 * Geneate a token URL for basic auth with the given credentials
 * @param options Credentials to add to the token
 */
export declare function createCredentialsURL(options: PlaceAuthOptions): string;
/**
 * @private
 * Revoke the current access token
 */
export declare function revokeToken(): Promise<void>;
/**
 * @private
 * Generate new tokens from a auth code or refresh token
 */
export declare function generateToken(): Promise<void>;
/**
 * @private
 * Generate new tokens from a username and password
 */
export declare function generateTokenWithCredentials(options: PlaceAuthOptions): Promise<void>;
/**
 * Exchange a Microsoft Entra access token for PlaceOS tokens (RFC 8693).
 * Use in apps already signed in to Microsoft, e.g. Outlook add-ins.
 * @param subject_token Entra access token for the user
 */
export declare function exchangeEntraToken(subject_token: string): Promise<void>;
/**
 * @private
 * Make a request to the tokens endpoint with the given URL
 */
export declare function generateTokenWithUrl(url: string, body?: string): Promise<void>;
/**
 * @private
 * @param details
 */
export declare function _storeTokenDetails(details: PlaceTokenResponse): void;
/**
 * @private
 * Create nonce and save it to the set key store
 */
export declare function createAndSaveNonce(): string;
