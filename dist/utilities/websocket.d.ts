import { Unsubscribe } from './signal';
export interface WebSocketConnection<T> {
    next(value: T): void;
    complete(): void;
    subscribe(next: (value: T) => void, error?: (error: any) => void, complete?: () => void): Unsubscribe;
}
export interface WebSocketConfig<T> {
    url: string;
    serializer?: (value: T) => string | ArrayBufferLike | Blob | ArrayBufferView;
    deserializer?: (event: MessageEvent) => T;
}
export declare class MemoryWebSocket<T> implements WebSocketConnection<T> {
    private _listeners;
    private _error_listeners;
    private _complete_listeners;
    private _closed;
    next(value: T): void;
    error(error: any): void;
    complete(): void;
    subscribe(next: (value: T) => void, error?: (error: any) => void, complete?: () => void): Unsubscribe;
    private _clear;
}
export declare class BrowserWebSocket<T> extends MemoryWebSocket<T> implements WebSocketConnection<T> {
    private _config;
    private _socket;
    private _queue;
    constructor(_config: WebSocketConfig<T>);
    next(value: T): void;
    complete(): void;
    private _serialize;
    private _deserialize;
}
export declare function webSocket<T>(config: string | WebSocketConfig<T>): WebSocketConnection<T>;
