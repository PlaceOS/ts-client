import {
    apiKey,
    authority,
    invalidateToken,
    isMock,
    listenForToken,
    refreshAuthority,
    sendToLogin,
    token,
} from '../auth/functions';
import { scoped_log } from '../utilities/general';
import { waitForSignal } from '../utilities/signal';
import { HashMap } from '../utilities/types';
import {
    HttpJsonOptions,
    HttpOptions,
    HttpResponse,
    HttpResponseType,
    HttpTextOptions,
    HttpVerb,
    HttpVoidOptions,
} from './interfaces';
import { mockRequest } from './mock';

const log = scoped_log('HTTP');

/**
 * Method store to allow attaching spies for testing
 * @hidden
 */
export const engine_http: any = { log };

/**
 * @private
 * Map of headers from the last request made
 */
const _response_headers: HashMap<HashMap<string>> = {};

export function responseHeaders(
    url: string,
    /* istanbul ignore next */
    headers: HashMap<HashMap<string>> = _response_headers,
): HashMap<string> {
    return headers[url] || {};
}

/**
 * Perform AJAX HTTP GET request
 * @param url URL of the GET endpoint
 * @param options Options to add to the request
 */
export function get(url: string, options?: HttpJsonOptions): Promise<HashMap>;
export function get(url: string, options?: HttpTextOptions): Promise<string>;
export function get(
    url: string,
    options?: HttpOptions,
    handler: (
        m: HttpVerb,
        url: string,
        opts: HttpOptions,
    ) => Promise<HttpResponse> = request,
): Promise<HttpResponse> {
    /* istanbul ignore else */
    if (!options) {
        options = { response_type: 'json' };
    }
    return handler('GET', url, { response_type: 'json', ...options });
}

/**
 * Perform AJAX HTTP POST request
 * @param url URL of the POST endpoint
 * @param body Body contents of the request
 * @param options Options to add to the request
 */
export function post(
    url: string,
    body: any,
    options?: HttpJsonOptions,
): Promise<HashMap>;
export function post(
    url: string,
    body: any,
    options?: HttpTextOptions,
): Promise<string>;
export function post(
    url: string,
    body: any,
    options?: HttpOptions,
    handler: (
        m: HttpVerb,
        url: string,
        opts: HttpOptions,
    ) => Promise<HttpResponse> = request,
): Promise<HttpResponse> {
    /* istanbul ignore else */
    if (!options) {
        options = { response_type: 'json' };
    }
    return handler('POST', url, { body, response_type: 'json', ...options });
}

/**
 * Perform AJAX HTTP PUT request
 * @param url URL of the PUT endpoint
 * @param body Body contents of the request
 * @param options Options to add to the request
 */
export function put(
    url: string,
    body: any,
    options?: HttpJsonOptions,
): Promise<HashMap>;
export function put(
    url: string,
    body: any,
    options?: HttpTextOptions,
): Promise<string>;
export function put(
    url: string,
    body: any,
    options?: HttpOptions,
    handler: (
        m: HttpVerb,
        url: string,
        opts: HttpOptions,
    ) => Promise<HttpResponse> = request,
): Promise<HttpResponse> {
    /* istanbul ignore else */
    if (!options) {
        options = { response_type: 'json' };
    }
    return handler('PUT', url, { body, response_type: 'json', ...options });
}

/**
 * Perform AJAX HTTP PATCH request
 * @param url URL of the PATCH endpoint
 * @param body Body contents of the request
 * @param options Options to add to the request
 */
export function patch(
    url: string,
    body: any,
    options?: HttpJsonOptions,
): Promise<HashMap>;
export function patch(
    url: string,
    body: any,
    options?: HttpTextOptions,
): Promise<string>;
export function patch(
    url: string,
    body: any,
    options?: HttpOptions,
    handler: (
        m: HttpVerb,
        url: string,
        opts: HttpOptions,
    ) => Promise<HttpResponse> = request,
): Promise<HttpResponse> {
    /* istanbul ignore else */
    if (!options) {
        options = { response_type: 'json' };
    }
    return handler('PATCH', url, { body, response_type: 'json', ...options });
}

/**
 * Perform AJAX HTTP DELETE request
 * @param url URL of the DELETE endpoint
 * @param options Options to add to the request
 */
export function del(url: string, options?: HttpJsonOptions): Promise<HashMap>;
export function del(url: string, options?: HttpTextOptions): Promise<string>;
export function del(url: string, options?: HttpVoidOptions): Promise<void>;
export function del(
    url: string,
    options?: HttpOptions,
    handler: (
        m: HttpVerb,
        url: string,
        opts: HttpOptions,
    ) => Promise<HttpResponse> = request,
): Promise<HttpResponse> {
    /* istanbul ignore else */
    if (!options) {
        options = { response_type: 'void' };
    }
    return handler('DELETE', url, { response_type: 'void', ...options });
}

/**
 * @private
 * Convert response into the format requested
 * @param response Request response contents
 * @param type Type of data to return
 */
export async function transform(
    resp: Response,
    type: HttpResponseType,
    headers: HashMap<HashMap<string>> = _response_headers,
): Promise<HttpResponse> {
    /* istanbul ignore else */
    if (resp.headers) {
        const map: HashMap<string> = {};
        if (resp.headers.forEach) {
            resp.headers.forEach((v, k) => (map[k.toLowerCase()] = v));
        } else {
            Object.keys(resp.headers).forEach(
                (k) => (map[k.toLowerCase()] = (resp as any).headers[k]),
            );
        }
        headers[resp.url || ''] = map;
    }
    switch (type) {
        case 'json':
            return await resp.json().catch(() => ({}));
        case 'text':
            return await resp.text();
        case 'void':
            return;
        default:
            return await resp.json().catch(() => ({}));
    }
}

/**
 * @private
 */
const reloadAuth = (): Promise<void> => {
    invalidateToken();
    return refreshAuthority().then(
        () => Promise.resolve(),
        () =>
            new Promise<void>((resolve) => {
                setTimeout(() => {
                    reloadAuth().then(() => resolve());
                }, 1000);
            }),
    );
};

/**
 * @private
 * Perform fetch request
 * @param method Request verb. `GET`, `POST`, `PUT`, `PATCH`, or `DELETE`
 * @param url URL of the request endpoint
 * @param options Options to add to the request
 */
export function request(
    method: HttpVerb,
    url: string,
    options: HttpOptions,
    is_mock: () => boolean = isMock,
    mock_handler: (
        m: HttpVerb,
        url: string,
        body?: any,
    ) => Promise<HashMap | string | void> | null = mockRequest,
    success: (
        e: Response,
        t: HttpResponseType,
    ) => Promise<HttpResponse> = transform,
): Promise<HttpResponse> {
    if (is_mock()) {
        const mock_request = mock_handler(method, url, options?.body);
        if (mock_request) return mock_request;
    }
    options.headers = options.headers || {};
    if (!options.headers['Content-Type'] && !options.headers['content-type']) {
        options.headers['Content-Type'] = `application/json`;
    }
    const fetchRequest = () => {
        const fetchOptions: any = {
            ...options,
            method,
            credentials: 'same-origin',
        };
        delete fetchOptions.response_type;
        delete fetchOptions.skip_auth;
        delete fetchOptions.skip_auth_flow;

        // Only add body for methods that support it and when body exists
        if (
            ['POST', 'PUT', 'PATCH'].includes(method) &&
            options.body !== undefined
        ) {
            fetchOptions.body =
                typeof options.body === 'string'
                    ? options.body
                    : JSON.stringify(options.body);
        }

        return fetch(url, fetchOptions);
    };

    const performRequest = async () => {
        if (!options.skip_auth) {
            await waitForSignal(listenForToken(), Boolean);
            if (token() === 'x-api-key') {
                options.headers!['X-API-Key'] = apiKey();
            } else {
                options.headers!.Authorization = `Bearer ${token()}`;
            }
        }
        const resp = await fetchRequest();
        if (resp.ok) return success(resp, options.response_type as any);
        throw resp;
    };

    const retry_count = 4;
    const attempt = async (count: number): Promise<HttpResponse> => {
        try {
            return await performRequest();
        } catch (error: any) {
            if (count >= retry_count) throw error || {};
            if (options.skip_auth || options.skip_auth_flow) throw error || {};
            if (error.status === 511) {
                sendToLogin(authority()!);
                throw error;
            }
            if (error.status !== 401) throw error || {};
            log.warn('Auth error:', error);
            await reloadAuth().catch(() => {
                throw error;
            });
            return attempt(count + 1);
        }
    };

    return attempt(0);
}
