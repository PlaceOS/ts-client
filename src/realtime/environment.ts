/**
 * The parts of the platform that the realtime client uses: the WebSocket, timers and cookies. The
 * client gets them as one object, so a test can drive the socket. `browserRealtimeEnvironment`
 * gives the real ones.
 */
import { assert } from '../core/assert.ts';

/** The events of one socket. The client gives these to `createSocket`. */
export interface SocketHandlers {
    open(): void;
    /** A text frame. The client ignores other frames. */
    message(data: unknown): void;
    /** The socket closed, or did not open. A browser also gives `error` before `close`. */
    close(): void;
}

export interface RealtimeSocket {
    send(text: string): void;
    close(): void;
}

/** How the socket sends the token. A browser WebSocket cannot set an `Authorization` header. */
export type TokenTransport =
    /** A cookie on the path of the socket. The token is not in the URL. */
    | 'cookie'
    /** A `bearer_token` or `api-key` query parameter. The server removes these from its logs. */
    | 'query';

export interface RealtimeEnvironment {
    readonly createSocket: (url: string, handlers: SocketHandlers) => RealtimeSocket;
    /** The URL of the page now. A `base_url` of `''` uses its origin. */
    readonly currentUrl: () => string;
    readonly token_transport: TokenTransport;
    /** Sets a cookie, as `document.cookie = cookie` does. */
    readonly setCookie: (cookie: string) => void;
    /** Milliseconds since the Unix epoch. */
    readonly now: () => number;
    /** Calls `callback` after `milliseconds`. Returns the function that cancels it. */
    readonly setTimer: (milliseconds: number, callback: () => void) => () => void;
}

/**
 * The real browser parts. The token goes in a cookie, except in a frame and on mobile Safari,
 * where the cookie does not reach the socket. There it goes in the query, as in 6.x.
 */
export function browserRealtimeEnvironment(): RealtimeEnvironment {
    assert(typeof window !== 'undefined', 'browserRealtimeEnvironment runs in a browser');
    return {
        createSocket,
        currentUrl: () => window.location.href,
        token_transport: isNestedFrame() || isMobileSafari() ? 'query' : 'cookie',
        setCookie: (cookie) => {
            document.cookie = cookie;
        },
        now: () => Date.now(),
        setTimer: (milliseconds, callback) => {
            const timer = setTimeout(callback, milliseconds);
            return () => clearTimeout(timer);
        },
    };
}

function createSocket(url: string, handlers: SocketHandlers): RealtimeSocket {
    const socket = new WebSocket(url);
    socket.addEventListener('open', () => handlers.open());
    socket.addEventListener('message', (event: MessageEvent<unknown>) =>
        handlers.message(event.data),
    );
    socket.addEventListener('close', () => handlers.close());
    return {
        send: (text) => socket.send(text),
        close: () => socket.close(),
    };
}

function isNestedFrame(): boolean {
    return window.parent !== window;
}

/** iOS browsers, and an iPad that says that it is a Mac. */
function isMobileSafari(): boolean {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return true;
    return navigator.userAgent.includes('Mac') && 'ontouchend' in document;
}
