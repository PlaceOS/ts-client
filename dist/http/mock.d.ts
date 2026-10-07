import { HashMap } from '../utilities/types';
import { HttpVerb, MockHttpRequest, MockHttpRequestHandler, MockHttpRequestHandlerOptions } from './interfaces';
/**
 * Change the handler for not found endpoints
 * Return `null` if you want to make the real request
 * @param handler_fn Function to handle not found mocked endpoints
 */
export declare function setMockNotFoundHandler(handler_fn: (method: HttpVerb, url: string) => Promise<never> | null): void;
/**
 * Register handler for http endpoint
 * @param path URL to be handled
 * @param data Data associated with the results of the endpoint
 * @param method HTTP Verb to listen to
 * @param callback Callback for handling request to the given endpoint
 * @param handler_map Handler map to add the endpoint to. Defaults to the global handler map
 */
export declare function registerMockEndpoint<T>(handler_ops: MockHttpRequestHandlerOptions, handler_map?: HashMap<MockHttpRequestHandler>): void;
/**
 * Remove registration of mock endpoint
 * @param method Http Verb
 * @param url URL of the endpoint being mocked
 * @param handler_map Handler map to remove the endpoint from. Defaults to the global handler map
 */
export declare function deregisterMockEndpoint(method: string, url: string, handler_map?: HashMap<MockHttpRequestHandler>): void;
/**
 * @private
 * Remove mapping of handlers for Mock Http requests
 * @param handler_map Handler map to clear. Defaults to the global handler map
 */
export declare function clearMockEndpoints(handler_map?: HashMap<MockHttpRequestHandler>): void;
/**
 * @private
 * Perform mock request for the given method and URL.
 * Returns a 404 error if no handler for URL and method
 * @param method Http Verb for request
 * @param url URL to perform request on
 * @param handler_map Handler map to query for the request handler.
 *  Defaults to the global handler map
 */
export declare function mockRequest(method: HttpVerb, url: string, body?: any, handler_map?: HashMap<MockHttpRequestHandler>): Promise<HashMap | string | void> | null;
/**
 * @private
 * Find a request handler for the given URL and method
 * @param method HTTP verb for the request
 * @param url URL of the request
 * @param handler_map Handler map to clear. Defaults to the global handler map
 */
export declare function findRequestHandler(method: HttpVerb, url: string, handler_map?: HashMap<MockHttpRequestHandler>): MockHttpRequestHandler | null;
/**
 * @private
 * Generate mock HTTP request from the given URL and handler
 * @param url URL to mock
 * @param handler Handler for the given URL
 */
export declare function processRequest<T = any>(url: string, handler: MockHttpRequestHandler<T>, body?: any): MockHttpRequest;
/**
 * @private
 * Perform request and return a promise for the generated response
 * @param handler Request handler
 * @param request Request contents
 */
export declare function onMockRequest(handler: MockHttpRequestHandler, request: MockHttpRequest): Promise<string | void | HashMap<any>>;
/**
 * Get a list of the method + endpoints that have been mocked
 * @returns List of the method + endpoint that have been mocked
 */
export declare function listMockedEndpoints(): string[];
