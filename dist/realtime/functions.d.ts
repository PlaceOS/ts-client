import { Signal, Unsubscribe, WritableSignal } from '../utilities/signal';
import { HashMap } from '../utilities/types';
import { MemoryWebSocket, WebSocketConnection } from '../utilities/websocket';
import { PlaceCommandRequest, PlaceDebugEvent, PlaceExecRequestOptions, PlaceRequestOptions, PlaceResponse, SimpleNetworkError } from './interfaces';
/**
 * @private
 * Delay in milliseconds to cancel a request
 */
export declare const REQUEST_TIMEOUT: number;
/** Listener for debugging events */
export declare const debug_events: WritableSignal<PlaceDebugEvent | null>;
/**
 * @private
 * Cleanup websocket connection in tests
 */
export declare function cleanupRealtime(): void;
export declare function websocketRoute(): string;
/** Whether the websocket is connected */
export declare function isConnected(): boolean;
/**
 * Listen to websocket status changes
 */
export declare function status(): Signal<boolean>;
/**
 * Listen to details about the connection status.
 * First value is the number of the current websocket connection.
 * Second value is the time the successful websocket connection was alive.
 * @returns
 */
export declare function connectionState(): Signal<[number, number]>;
/**
 * Listen to binding changes on the given status variable. DOES NOT BIND TO VARIABLE
 * @param binding_details Binding details
 */
export declare function listen<T = any>(binding_details: PlaceRequestOptions): Signal<T>;
/**
 * Get current binding value
 * @param options Binding details
 */
export declare function value<T = any>(options: PlaceRequestOptions): T | undefined;
/**
 * Bind to status variable on the given system module
 * @param options Binding request options
 */
export declare function bind(options: PlaceRequestOptions, timeout_delay?: number): Promise<void>;
/**
 * Unbind from a status variable on the given system module
 * @param options Unbind request options
 */
export declare function unbind(options: PlaceRequestOptions, timeout_delay?: number): Promise<void>;
/**
 * Execute method on the given system module
 * @param options Exec request options
 */
export declare function execute<T = void>(options: PlaceExecRequestOptions, timeout_delay?: number, post?: (_: PlaceCommandRequest, t?: number) => Promise<T>): Promise<T>;
/**
 * Listen to debug logging for on the given system module binding
 * @param options Debug request options
 */
export declare function debug(options: PlaceRequestOptions, timeout_delay?: number): Promise<void>;
/**
 * Stop debug logging on the given system module binding
 * @param options Debug request options
 */
export declare function ignore(options: PlaceRequestOptions, timeout_delay?: number): Promise<void>;
/**
 * @private
 * Send request to engine through the websocket connection
 * @param request New request to post to the server
 */
export declare function send<T = any>(request: PlaceCommandRequest, timeout_delay?: number, tries?: number): Promise<T>;
/**
 * @private
 * Callback for messages from the server
 * @param message Message from the engine server
 */
export declare function onMessage(message: PlaceResponse | 'pong'): void;
/**
 * @private
 * Handle websocket success response
 * @param message Success message
 */
export declare function handleSuccess(message: PlaceResponse): void;
/**
 * @private
 * Handle websocket request error
 * @param message Error response
 */
export declare function handleError(message: PlaceResponse): void;
/**
 * @private
 * Update the current value of the binding
 * @param options Binding details
 * @param updated_value New binding value
 */
export declare function handleNotify<T = any>(options: PlaceRequestOptions, updated_value: T, bindings?: HashMap<WritableSignal<T>>): void;
/**
 * @private
 * Connect to engine websocket
 */
export declare function connect(tries?: number): Promise<void>;
/**
 * @private
 * Create websocket connection
 */
export declare function createWebsocket(): WebSocketConnection<any> | null;
/**
 * @private
 * Close old websocket connect and open a new one
 */
export declare function reconnect(): void;
/**
 * @private
 * Send ping through the websocket
 */
export declare function ping(): void;
/**
 * @private
 * Handle errors on the websocket
 * @param err Network error response
 */
export declare function onWebSocketError(err: SimpleNetworkError): void;
/**
 * @private
 * Clear health check timer
 */
export declare function clearHealthCheck(): void;
/**
 * @private
 * Connect to engine websocket
 */
export declare function createMockWebSocket(): MemoryWebSocket<PlaceCommandRequest | PlaceResponse>;
/**
 * @private
 * Send request to engine through the websocket connection
 * @param request New request to post to the server
 */
export declare function handleMockSend(request: PlaceCommandRequest, websocket: WebSocketConnection<any>, listeners: HashMap<Unsubscribe>): void;
