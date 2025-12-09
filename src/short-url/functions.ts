import { create, query, remove, show, update } from '../api';
import { apiEndpoint } from '../auth';
import { get } from '../http/functions';
import { toQueryString } from '../utilities/api';
import { PlaceShortUrl } from './short-url.class';
import {
    PlaceQrCodeOptions,
    PlaceShortUrlPngQrOptions,
    PlaceShortUrlQueryOptions,
} from './interfaces';

/**
 * @private
 */
const PATH = 'short_url';

/** Convert raw server data to a short URL object */
function processShortUrl(item: Partial<PlaceShortUrl>) {
    return new PlaceShortUrl(item);
}

/**
 * Query the available short URLs
 * @param query_params Query parameters to add to the request URL
 */
export function queryShortUrls(query_params: PlaceShortUrlQueryOptions = {}) {
    return query({
        query_params,
        fn: processShortUrl,
        path: PATH,
    });
}

/**
 * Get the data for a short URL
 * @param id ID of the short URL to retrieve
 * @param query_params Query parameters to add to the request URL
 */
export function showShortUrl(
    id: string,
    query_params: Record<string, any> = {},
) {
    return show({
        id,
        query_params,
        fn: processShortUrl,
        path: PATH,
    });
}

/**
 * Update a short URL in the database
 * @param id ID of the short URL
 * @param form_data New values for the short URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateShortUrl(
    id: string,
    form_data: Partial<PlaceShortUrl>,
    method: 'put' | 'patch' = 'patch',
) {
    return update({
        id,
        form_data,
        query_params: {},
        method,
        fn: processShortUrl,
        path: PATH,
    });
}

/**
 * Add a new short URL to the database
 * @param form_data Short URL data
 */
export function addShortUrl(form_data: Partial<PlaceShortUrl>) {
    return create({
        form_data,
        query_params: {},
        fn: processShortUrl,
        path: PATH,
    });
}

/**
 * Remove a short URL from the database
 * @param id ID of the short URL
 * @param query_params Query parameters to add to the request URL
 */
export function removeShortUrl(
    id: string,
    query_params: Record<string, any> = {},
) {
    return remove({ id, query_params, path: PATH });
}

/**
 * Get the redirect URL for a short URL.
 * Returns the full redirect URL that can be used to navigate to the short URL destination.
 * @param id ID of the short URL
 */
export function shortUrlRedirectUrl(
    id: string,
): string {
    return `${apiEndpoint()}${PATH}/${encodeURIComponent(id)}/redirect`;
}

/**
 * Get an SVG QR code for a short URL
 * @param id ID of the short URL
 */
export function getShortUrlQrCodeSvg(id: string) {
    return get(
        `${apiEndpoint()}${PATH}/${encodeURIComponent(id)}/qr_code.svg`,
        { response_type: 'text' },
    );
}

/**
 * Get the URL for a PNG QR code for a short URL.
 * Use this URL directly in an img tag or fetch it separately.
 * @param id ID of the short URL
 * @param options Options including size (between 72px and 512px)
 */
export function shortUrlQrCodePngUrl(
    id: string,
    options: PlaceShortUrlPngQrOptions = {},
): string {
    const q = toQueryString(options);
    return `${apiEndpoint()}${PATH}/${encodeURIComponent(id)}/qr_code.png${q ? '?' + q : ''}`;
}

/**
 * Get the URL for generating a QR code with user-defined content.
 * @param options Options for QR code generation including content, format, and size
 */
export function qrCodeUrl(options: PlaceQrCodeOptions): string {
    const { format = 'svg', ...params } = options;
    const query_params = { ...params, format };
    const q = toQueryString(query_params);
    return `${apiEndpoint()}${PATH}/qr_code${q ? '?' + q : ''}`;
}

/**
 * Generate an SVG QR code with user-defined content.
 * For PNG format, use qrCodeUrl() and fetch the URL directly.
 * @param options Options for QR code generation including content and size
 */
export function generateQrCode(options: Omit<PlaceQrCodeOptions, 'format'>) {
    const query_params = { ...options, format: 'svg' };
    const q = toQueryString(query_params);
    return get(`${apiEndpoint()}${PATH}/qr_code${q ? '?' + q : ''}`, {
        response_type: 'text',
    });
}
