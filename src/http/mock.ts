import { from, Observable, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { convertPairStringToMap, log } from '../utilities/general';
import { HashMap } from '../utilities/types';
import {
    HttpVerb,
    MockHttpRequest,
    MockHttpRequestHandler,
    MockHttpRequestHandlerOptions,
} from './interfaces';

/**
 * @private
 */
const _handlers: HashMap<MockHttpRequestHandler> = {};

let _error_handler: (
    method: HttpVerb,
    url: string,
) => Observable<never> | null = (method: HttpVerb, url: string) => {
    const error = new Error(`Mock endpoint not found: ${method} ${url}`);
    (error as any).status = 404;
    log('HTTP(M)', `404 ${method}:`, url);
    return throwError(error);
};

/**
 * Change the handler for not found endpoints
 * Return `null` if you want to make the real request
 * @param handler_fn Function to handle not found mocked endpoints
 */
export function setMockNotFoundHandler(
    handler_fn: (method: HttpVerb, url: string) => Observable<never> | null,
) {
    _error_handler = handler_fn;
}

/**
 * Register handler for http endpoint
 * @param path URL to be handled
 * @param data Data associated with the results of the endpoint
 * @param method HTTP Verb to listen to
 * @param callback Callback for handling request to the given endpoint
 * @param handler_map Handler map to add the endpoint to. Defaults to the global handler map
 */
export function registerMockEndpoint<T>(
    handler_ops: MockHttpRequestHandlerOptions,
    handler_map: HashMap<MockHttpRequestHandler> = _handlers,
) {
    deregisterMockEndpoint(handler_ops.method, handler_ops.path, handler_map);
    const key = `${handler_ops.method}|${handler_ops.path}`;
    const path_parts = handler_ops.path
        .replace(/(http|https):\/\/[a-zA-Z0-9.]*:?([0-9]*)?/g, '') // Remove URL origin
        .replace(/^\//, '')
        .split('/');
    const handler: MockHttpRequestHandler<T> = {
        ...handler_ops,
        path_parts,
        path_structure: path_parts.map((i: string) =>
            i[0] === ':' ? i.replace(':', '') : '',
        ),
    };
    handler_map[key] = handler;
    log('HTTP(M)', `+ ${handler_ops.method} ${handler_ops.path}`);
}

/**
 * Remove registration of mock endpoint
 * @param method Http Verb
 * @param url URL of the endpoint being mocked
 * @param handler_map Handler map to remove the endpoint from. Defaults to the global handler map
 */
export function deregisterMockEndpoint(
    method: string,
    url: string,
    handler_map: HashMap<MockHttpRequestHandler> = _handlers,
) {
    const key = `${method}|${url}`;
    if (handler_map[key]) {
        delete handler_map[key];
        log('HTTP(M)', `- ${method} ${url}`);
    }
}

/**
 * @private
 * Remove mapping of handlers for Mock Http requests
 * @param handler_map Handler map to clear. Defaults to the global handler map
 */
export function clearMockEndpoints(
    handler_map: HashMap<MockHttpRequestHandler> = _handlers,
) {
    for (const key in handler_map) {
        if (handler_map[key]) {
            delete handler_map[key];
        }
    }
}

/**
 * @private
 * Perform mock request for the given method and URL.
 * Returns a 404 error if no handler for URL and method
 * @param method Http Verb for request
 * @param url URL to perform request on
 * @param handler_map Handler map to query for the request handler.
 *  Defaults to the global handler map
 */
export function mockRequest(
    method: HttpVerb,
    url: string,
    body?: any,
    handler_map: HashMap<MockHttpRequestHandler> = _handlers,
): Observable<HashMap | string | void> | null {
    const handler = findRequestHandler(method, url, handler_map);
    if (handler) {
        const request = processRequest(url, handler, body);
        return onMockRequest(handler, request);
    }
    // Return 404 error when no handler is found
    return _error_handler(method, url);
}

/**
 * @private
 * Find a request handler for the given URL and method
 * @param method HTTP verb for the request
 * @param url URL of the request
 * @param handler_map Handler map to clear. Defaults to the global handler map
 */
export function findRequestHandler(
    method: HttpVerb,
    url: string,
    handler_map: HashMap<MockHttpRequestHandler> = _handlers,
): MockHttpRequestHandler | null {
    const path = url
        .replace(/(http|https):\/\/[a-zA-Z0-9.]*:?([0-9]*)?/g, '')
        .replace(/^\//, '')
        .split('?')[0];
    const route_parts = path.split('/');
    const method_handlers: MockHttpRequestHandler[] = Object.keys(
        handler_map,
    ).reduce<MockHttpRequestHandler[]>((l, i) => {
        if (i.indexOf(`${method}|`) === 0) {
            l.push(handler_map[i]);
        }
        return l;
    }, []);
    for (const handler of method_handlers) {
        if (handler.path_structure.length === route_parts.length) {
            // Path lengths match
            let match = true;
            for (let i = 0; i < handler.path_structure.length; i++) {
                if (
                    !handler.path_structure[i] &&
                    handler.path_parts[i] !== route_parts[i]
                ) {
                    // Static path fragments don't match
                    match = false;
                    break;
                }
            }
            if (match) {
                return handler;
            }
        }
    }
    return null;
}

/**
 * @private
 * Generate mock HTTP request from the given URL and handler
 * @param url URL to mock
 * @param handler Handler for the given URL
 */
export function processRequest<T = any>(
    url: string,
    handler: MockHttpRequestHandler<T>,
    body?: any,
): MockHttpRequest {
    const parts = url
        .replace(/(http|https):\/\/[a-zA-Z0-9.]*:?([0-9]*)?/g, '')
        .split('?');
    const path = parts[0].replace(/^\//, '');
    const query = parts[1] || '';
    const query_params = convertPairStringToMap(query);
    // Grab route parameters from URL
    const route_parts = path.split('/');
    const route_params: HashMap = {};
    for (let i = 0; i < handler.path_structure.length; i++) {
        const paramName = handler.path_structure[i];
        if (paramName) {
            route_params[paramName] = route_parts[i];
        }
    }
    const request = {
        url,
        path: handler.path,
        method: handler.method,
        metadata: handler.metadata,
        route_params,
        query_params,
        body,
    };
    log('HTTP(M)', `MATCHED ${request.method}:`, request);
    return request;
}

/**
 * @private
 * Perform request and return an observable for the generated response
 * @param handler Request handler
 * @param request Request contents
 */
export function onMockRequest(
    handler: MockHttpRequestHandler,
    request: MockHttpRequest,
) {
    let result;
    try {
        result = handler.callback
            ? handler.callback(request)
            : handler.metadata;
    } catch (error) {
        log('HTTP(M)', `ERROR ${request.method}:`, [request.url, error]);
        throw error;
    }
    const variance = handler.delay_variance || 100;
    const delay_value = handler.delay || 300;
    const delay_time =
        Math.floor(Math.random() * variance - variance / 2) + delay_value;
    log('HTTP(M)', `RESP ${request.method}:`, [request.url, result]);
    return from([result]).pipe(delay(Math.max(200, delay_time)));
}

/**
 * Get a list of the method + endpoints that have been mocked
 * @returns List of the method + endpoint that have been mocked
 */
export function listMockedEndpoints(): string[] {
    return Object.keys(_handlers);
}
