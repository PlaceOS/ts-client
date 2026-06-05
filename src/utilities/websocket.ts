import { Unsubscribe } from './signal';

export interface WebSocketConnection<T> {
    next(value: T): void;
    complete(): void;
    subscribe(
        next: (value: T) => void,
        error?: (error: any) => void,
        complete?: () => void,
    ): Unsubscribe;
}

export interface WebSocketConfig<T> {
    url: string;
    serializer?: (
        value: T,
    ) => string | ArrayBufferLike | Blob | ArrayBufferView;
    deserializer?: (event: MessageEvent) => T;
}

export class MemoryWebSocket<T> implements WebSocketConnection<T> {
    private _listeners = new Set<(value: T) => void>();
    private _error_listeners = new Set<(error: any) => void>();
    private _complete_listeners = new Set<() => void>();
    private _closed = false;

    public next(value: T): void {
        if (this._closed) return;
        for (const listener of [...this._listeners]) listener(value);
    }

    public error(error: any): void {
        if (this._closed) return;
        for (const listener of [...this._error_listeners]) listener(error);
        this._closed = true;
        this._clear();
    }

    public complete(): void {
        if (this._closed) return;
        for (const listener of [...this._complete_listeners]) listener();
        this._closed = true;
        this._clear();
    }

    public subscribe(
        next: (value: T) => void,
        error?: (error: any) => void,
        complete?: () => void,
    ): Unsubscribe {
        if (this._closed) {
            complete?.();
            return () => null;
        }
        this._listeners.add(next);
        if (error) this._error_listeners.add(error);
        if (complete) this._complete_listeners.add(complete);
        return () => {
            this._listeners.delete(next);
            if (error) this._error_listeners.delete(error);
            if (complete) this._complete_listeners.delete(complete);
        };
    }

    private _clear(): void {
        this._listeners.clear();
        this._error_listeners.clear();
        this._complete_listeners.clear();
    }
}

export class BrowserWebSocket<T>
    extends MemoryWebSocket<T>
    implements WebSocketConnection<T>
{
    private _socket: WebSocket;
    private _queue: T[] = [];

    constructor(private _config: WebSocketConfig<T>) {
        super();
        this._socket = new WebSocket(_config.url);
        this._socket.onopen = () => {
            const queue = [...this._queue];
            this._queue = [];
            for (const value of queue) this.next(value);
        };
        this._socket.onmessage = (event) => {
            super.next(this._deserialize(event));
        };
        this._socket.onerror = (event) => this.error(event);
        this._socket.onclose = () => super.complete();
    }

    public override next(value: T): void {
        if (this._socket.readyState === WebSocket.OPEN) {
            this._socket.send(this._serialize(value));
        } else {
            this._queue.push(value);
        }
    }

    public override complete(): void {
        this._socket.close();
        super.complete();
    }

    private _serialize(
        value: T,
    ): string | ArrayBufferLike | Blob | ArrayBufferView {
        return this._config.serializer
            ? this._config.serializer(value)
            : `${value}`;
    }

    private _deserialize(event: MessageEvent): T {
        return this._config.deserializer
            ? this._config.deserializer(event)
            : (event.data as T);
    }
}

export function webSocket<T>(
    config: string | WebSocketConfig<T>,
): WebSocketConnection<T> {
    return new BrowserWebSocket<T>(
        typeof config === 'string' ? { url: config } : config,
    );
}
