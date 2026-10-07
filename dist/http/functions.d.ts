import { HashMap } from '../utilities/types';
import { HttpBlobOptions, HttpJsonOptions, HttpOptions, HttpResponse, HttpResponseType, HttpTextOptions, HttpVerb, HttpVoidOptions } from './interfaces';
/**
 * Method store to allow attaching spies for testing
 * @hidden
 */
export declare const engine_http: any;
export declare function responseHeaders(url: string, headers?: HashMap<HashMap<string>>): HashMap<string>;
/**
 * Perform AJAX HTTP GET request
 * @param url URL of the GET endpoint
 * @param options Options to add to the request
 */
export declare function get(url: string, options?: HttpJsonOptions): Promise<HashMap>;
export declare function get(url: string, options: HttpBlobOptions): Promise<Blob>;
export declare function get(url: string, options?: HttpTextOptions): Promise<string>;
/**
 * Perform AJAX HTTP POST request
 * @param url URL of the POST endpoint
 * @param body Body contents of the request
 * @param options Options to add to the request
 */
export declare function post(url: string, body: any, options?: HttpJsonOptions): Promise<HashMap>;
export declare function post(url: string, body: any, options?: HttpTextOptions): Promise<string>;
/**
 * Perform AJAX HTTP PUT request
 * @param url URL of the PUT endpoint
 * @param body Body contents of the request
 * @param options Options to add to the request
 */
export declare function put(url: string, body: any, options?: HttpJsonOptions): Promise<HashMap>;
export declare function put(url: string, body: any, options?: HttpTextOptions): Promise<string>;
/**
 * Perform AJAX HTTP PATCH request
 * @param url URL of the PATCH endpoint
 * @param body Body contents of the request
 * @param options Options to add to the request
 */
export declare function patch(url: string, body: any, options?: HttpJsonOptions): Promise<HashMap>;
export declare function patch(url: string, body: any, options?: HttpTextOptions): Promise<string>;
export declare function patch(url: string, body: any, options?: HttpVoidOptions): Promise<void>;
/**
 * Perform AJAX HTTP DELETE request
 * @param url URL of the DELETE endpoint
 * @param options Options to add to the request
 */
export declare function del(url: string, options?: HttpJsonOptions): Promise<HashMap>;
export declare function del(url: string, options?: HttpTextOptions): Promise<string>;
export declare function del(url: string, options?: HttpVoidOptions): Promise<void>;
/**
 * @private
 * Convert response into the format requested
 * @param response Request response contents
 * @param type Type of data to return
 */
export declare function transform(resp: Response, type: HttpResponseType, headers?: HashMap<HashMap<string>>): Promise<HttpResponse>;
/**
 * @private
 * Perform fetch request
 * @param method Request verb. `GET`, `POST`, `PUT`, `PATCH`, or `DELETE`
 * @param url URL of the request endpoint
 * @param options Options to add to the request
 */
export declare function request(method: HttpVerb, url: string, options: HttpOptions, is_mock?: () => boolean, mock_handler?: (m: HttpVerb, url: string, body?: any) => Promise<HashMap | string | void> | null, success?: (e: Response, t: HttpResponseType) => Promise<HttpResponse>): Promise<HttpResponse>;
