import { HttpBlobOptions } from '../http/interfaces';
export type UrlProxyOptions = Omit<HttpBlobOptions, 'response_type' | 'skip_auth'>;
/**
 * Fetch a remote HTTP resource through PlaceOS.
 *
 * The proxy route is public, so this request does not attach the PlaceOS
 * access token. Pass headers in `options` when the upstream resource needs
 * them.
 */
export declare function proxyUrl(url: string, options?: UrlProxyOptions): Promise<Blob>;
