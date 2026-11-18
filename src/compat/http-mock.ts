/**
 * The mock endpoints of 6.x, for the 7.x client. Give `mockFetch` to the client, and the 7.x calls
 * go to the endpoints that `registerMockEndpoint` adds:
 *
 * ```ts
 * registerMockEndpoint({ path: '/api/engine/v2/zones/:id', method: 'GET', callback: (request) => ({
 *     id: request.route_params.id,
 *     name: 'Zone',
 * }) });
 * configure({ baseUrl: '', auth: { kind: 'none' }, fetch: mockFetch });
 * ```
 *
 * The behavior is the same as 6.x: a path segment `:name` is a route parameter, the response comes
 * after a delay (300 ms by default), and an endpoint that is not registered gives a 404. One
 * difference: 7.x parses each response with the schema of the operation, so the mock data must
 * match the API document.
 *
 * @module
 */
import { assert } from '../core/assert.ts';
import type { FetchFunction } from '../core/client.ts';

/** More endpoints is a leak, such as a test that registers in a loop and never removes them. */
export const MOCK_ENDPOINTS_MAX = 10_000;
const DELAY_MS_DEFAULT = 300;
const DELAY_VARIANCE_MS_DEFAULT = 100;
/** 6.x waits at least this long, so that a mock response is never synchronous. */
const DELAY_MS_MIN = 200;

export type HttpVerb = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** A request to a mock endpoint. */
export interface MockHttpRequest {
    /** The URL of the request. */
    readonly url: string;
    /** The path of the endpoint that matched. */
    readonly path: string;
    readonly method: HttpVerb;
    /** The `metadata` of the endpoint. As in 6.x, it has no type. */
    readonly metadata: any;
    /** The values of the `:name` segments of the path. */
    readonly route_params: Record<string, string>;
    readonly query_params: Record<string, string>;
    /** The JSON body. As in 6.x, it has no type. */
    readonly body: any;
}

export interface MockHttpRequestHandlerOptions<T = unknown> {
    /** The path, such as `/api/engine/v2/zones/:id`. A `:name` segment matches each value. */
    path: string;
    method: HttpVerb;
    /** The response body when there is no `callback`. */
    metadata?: any;
    /** Gives the response body. Throw an error with a `status` to send that status. */
    callback?: (request: MockHttpRequest) => T;
    /** Milliseconds before the response. */
    delay?: number;
    /** The delay changes by up to this many milliseconds. */
    delay_variance?: number;
    /** Response headers, such as `x-total-count`. */
    headers?: Record<string, string> | ((request: MockHttpRequest) => Record<string, string>);
}

export interface MockHttpRequestHandler<T = unknown> extends MockHttpRequestHandlerOptions<T> {
    /** The segments of the path. */
    path_parts: string[];
    /** The parameter name of each segment, or `''` for a fixed segment. */
    path_structure: string[];
}

/** The response of a mock endpoint. */
export interface MockHttpResponse {
    readonly body: unknown;
    /** The keys are lowercase. */
    readonly headers: Record<string, string>;
}

type NotFoundHandler = (method: HttpVerb, url: string) => Promise<never> | null;

const handlers = new Map<string, MockHttpRequestHandler>();

let notFound: NotFoundHandler = (method, url) =>
    Promise.reject(
        Object.assign(new Error(`Mock endpoint not found: ${method} ${url}`), { status: 404 }),
    );

/** Adds an endpoint. An endpoint with the same method and path is replaced. */
export function registerMockEndpoint<T>(options: MockHttpRequestHandlerOptions<T>): void {
    const key = handlerKey(options.method, options.path);
    assert(handlers.has(key) || handlers.size < MOCK_ENDPOINTS_MAX, 'fewer mock endpoints');
    const path_parts = pathParts(options.path);
    const path_structure = path_parts.map((part) => (part.startsWith(':') ? part.slice(1) : ''));
    // The map holds handlers of each response type. The callback result is only sent as JSON.
    const handler: MockHttpRequestHandler = { ...options, path_parts, path_structure };
    handlers.set(key, handler);
}

export function deregisterMockEndpoint(method: string, path: string): void {
    handlers.delete(handlerKey(method, path));
}

export function clearMockEndpoints(): void {
    handlers.clear();
}

/** The `method|path` of each endpoint. */
export function listMockedEndpoints(): string[] {
    return [...handlers.keys()];
}

/**
 * Changes what happens for a request that has no endpoint. Return `null` to send the real
 * request with `fetch`.
 */
export function setMockNotFoundHandler(handler: NotFoundHandler): void {
    notFound = handler;
}

/** A `fetch` for the 7.x client that answers from the mock endpoints. */
export const mockFetch: FetchFunction = async (url, init) => {
    const method = verb(init.method);
    const handler = findHandler(method, url);
    if (handler === null) {
        const fallback = notFound(method, url);
        if (fallback === null) return fetch(url, init);
        return fallback.then(
            () => errorResponse(404, 'not found'),
            (error: unknown) => thrownResponse(error),
        );
    }
    const request = makeRequest(url, handler, method, init.body);
    let body: unknown;
    let headers: Record<string, string>;
    try {
        body = await (handler.callback === undefined
            ? handler.metadata
            : handler.callback(request));
        const raw =
            typeof handler.headers === 'function' ? handler.headers(request) : handler.headers;
        headers = lowerKeys(raw ?? {});
    } catch (error) {
        return thrownResponse(error);
    }
    await delay(handler, init.signal ?? null);
    if (body === undefined) return new Response(null, { status: 204, headers });
    // 6.x gave the value of the callback as it was, also a string. A JSON response has the string
    // as JSON. A handler with another `content-type`, such as `text/plain`, sends its text.
    const contentType = headers['content-type'] ?? 'application/json';
    const text =
        typeof body === 'string' && !contentType.includes('json') ? body : JSON.stringify(body);
    return new Response(text, {
        status: 200,
        headers: { 'content-type': contentType, ...headers },
    });
};

function handlerKey(method: string, path: string): string {
    return `${method}|${path}`;
}

/** The path segments, without the origin, the query and the first `/`. */
function pathParts(url: string): string[] {
    const path = url.replace(/^https?:\/\/[^/]*/, '').split('?')[0] ?? '';
    return path.replace(/^\//, '').split('/');
}

function verb(method: string | undefined): HttpVerb {
    const upper = (method ?? 'GET').toUpperCase();
    assert(
        upper === 'GET' ||
            upper === 'POST' ||
            upper === 'PUT' ||
            upper === 'PATCH' ||
            upper === 'DELETE',
        `the mock supports the method ${upper}`,
    );
    return upper;
}

function findHandler(method: HttpVerb, url: string): MockHttpRequestHandler | null {
    const parts = pathParts(url);
    for (const handler of handlers.values()) {
        if (handler.method !== method || handler.path_parts.length !== parts.length) continue;
        const matches = handler.path_structure.every(
            (parameter, index) => parameter !== '' || handler.path_parts[index] === parts[index],
        );
        if (matches) return handler;
    }
    return null;
}

function makeRequest(
    url: string,
    handler: MockHttpRequestHandler,
    method: HttpVerb,
    body: RequestInit['body'],
): MockHttpRequest {
    const parts = pathParts(url);
    const route_params: Record<string, string> = {};
    for (const [index, name] of handler.path_structure.entries()) {
        if (name !== '') route_params[name] = decodeURIComponent(parts[index] ?? '');
    }
    const query_params: Record<string, string> = {};
    const query = url.split('?')[1] ?? '';
    for (const [key, value] of new URLSearchParams(query)) {
        // 6.x leaves out the parameters with no value.
        if (value !== '') query_params[key] = value;
    }
    return {
        url,
        path: handler.path,
        method,
        metadata: handler.metadata,
        route_params,
        query_params,
        body: typeof body === 'string' ? parseJson(body) : undefined,
    };
}

function parseJson(text: string): unknown {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function lowerKeys(headers: Record<string, string>): Record<string, string> {
    const lower: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) lower[key.toLowerCase()] = value;
    return lower;
}

/** A thrown value with a `status` gives that status. Another one is a network error, as in 6.x. */
function thrownResponse(error: unknown): Response {
    const status =
        typeof error === 'object' && error !== null ? Reflect.get(error, 'status') : undefined;
    if (typeof status !== 'number' || status < 400 || status > 599) throw error;
    return errorResponse(status, error instanceof Error ? error.message : String(status));
}

function errorResponse(status: number, message: string): Response {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'content-type': 'application/json' },
    });
}

function delay(handler: MockHttpRequestHandler, signal: AbortSignal | null): Promise<void> {
    const variance = handler.delay_variance ?? DELAY_VARIANCE_MS_DEFAULT;
    const base = handler.delay ?? DELAY_MS_DEFAULT;
    const ms = Math.max(DELAY_MS_MIN, Math.floor(Math.random() * variance - variance / 2) + base);
    return new Promise((resolve, reject) => {
        const aborted = () => {
            clearTimeout(timer);
            reject(new DOMException('The request was aborted.', 'AbortError'));
        };
        const timer = setTimeout(() => {
            signal?.removeEventListener('abort', aborted);
            resolve();
        }, ms);
        if (signal?.aborted === true) aborted();
        else signal?.addEventListener('abort', aborted, { once: true });
    });
}
