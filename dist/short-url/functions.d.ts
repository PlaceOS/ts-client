import { PlaceShortUrl } from './short-url.class';
import { PlaceQrCodeOptions, PlaceShortUrlPngQrOptions, PlaceShortUrlQueryOptions } from './interfaces';
/**
 * Query the available short URLs
 * @param query_params Query parameters to add to the request URL
 */
export declare function queryShortUrls(query_params?: PlaceShortUrlQueryOptions): import('..').QueryResponse<PlaceShortUrl>;
/**
 * Get the data for a short URL
 * @param id ID of the short URL to retrieve
 * @param query_params Query parameters to add to the request URL
 */
export declare function showShortUrl(id: string, query_params?: Record<string, any>): Promise<PlaceShortUrl>;
/**
 * Update a short URL in the database
 * @param id ID of the short URL
 * @param form_data New values for the short URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateShortUrl(id: string, form_data: Partial<PlaceShortUrl>, method?: 'put' | 'patch'): Promise<PlaceShortUrl>;
/**
 * Add a new short URL to the database
 * @param form_data Short URL data
 */
export declare function addShortUrl(form_data: Partial<PlaceShortUrl>): Promise<PlaceShortUrl>;
/**
 * Remove a short URL from the database
 * @param id ID of the short URL
 * @param query_params Query parameters to add to the request URL
 */
export declare function removeShortUrl(id: string, query_params?: Record<string, any>): Promise<import('../utilities/types').HashMap<any>>;
/**
 * Get the redirect URL for a short URL.
 * Returns the full redirect URL that can be used to navigate to the short URL destination.
 * @param id ID of the short URL
 */
export declare function shortUrlRedirectUrl(id: string): string;
/**
 * Get an SVG QR code for a short URL
 * @param id ID of the short URL
 */
export declare function getShortUrlQrCodeSvg(id: string): Promise<string>;
/**
 * Get the URL for a PNG QR code for a short URL.
 * Use this URL directly in an img tag or fetch it separately.
 * @param id ID of the short URL
 * @param options Options including size (between 72px and 512px)
 */
export declare function shortUrlQrCodePngUrl(id: string, options?: PlaceShortUrlPngQrOptions): string;
/**
 * Get the URL for generating a QR code with user-defined content.
 * @param options Options for QR code generation including content, format, and size
 */
export declare function qrCodeUrl(options: PlaceQrCodeOptions): string;
/**
 * Generate an SVG QR code with user-defined content.
 * For PNG format, use qrCodeUrl() and fetch the URL directly.
 * @param options Options for QR code generation including content and size
 */
export declare function generateQrCode(options: Omit<PlaceQrCodeOptions, 'format'>): Promise<string>;
