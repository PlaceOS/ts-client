import { apiEndpoint } from '../auth/functions';
import { get } from '../http/functions';
import { HttpBlobOptions } from '../http/interfaces';
import { toQueryString } from '../utilities/api';

export type UrlProxyOptions = Omit<
    HttpBlobOptions,
    'response_type' | 'skip_auth'
>;

/**
 * Fetch a remote HTTP resource through PlaceOS.
 *
 * The proxy route is public, so this request does not attach the PlaceOS
 * access token. Pass headers in `options` when the upstream resource needs
 * them.
 */
export function proxyUrl(
    url: string,
    options: UrlProxyOptions = {},
): Promise<Blob> {
    const query = toQueryString({ url });
    return get(`${apiEndpoint()}/proxy?${query}`, {
        ...options,
        response_type: 'blob',
        skip_auth: true,
    });
}
