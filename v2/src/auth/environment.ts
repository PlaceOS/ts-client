/**
 * The parts of the browser that the auth session uses. The session gets them as one object, so a
 * test or a native wrapper can replace each part. `browserEnvironment` gives the real ones.
 */
import { assert } from '../core/assert.ts';
import type { FetchFunction } from '../core/client.ts';
import type { Result } from '../core/result.ts';

/** A string store, such as `localStorage`. */
export interface KeyValueStore {
    get(key: string): string | null;
    set(key: string, value: string): void;
    remove(key: string): void;
    keys(): readonly string[];
}

/** Why a login in a hidden frame did not give parameters. */
export type FrameError = 'timeout' | 'frame_error';

export interface AuthEnvironment {
    readonly fetch: FetchFunction;
    /** Keeps the tokens of a trusted application, the nonce and the device settings. */
    readonly storage: KeyValueStore;
    /** Keeps values for one tab only: the PKCE verifier and the parameters of a deep link. */
    readonly sessionStorage: KeyValueStore;
    /** The URL of the page now. */
    readonly currentUrl: () => string;
    /** Changes the URL of the page without a navigation, to remove the parameters of a login. */
    readonly replaceUrl: (url: string) => void;
    /** Goes to a different page, such as the login page. */
    readonly navigate: (url: string) => void;
    /** Milliseconds since the Unix epoch. */
    readonly now: () => number;
    /** Fills the array with cryptographically strong random values. */
    readonly randomValues: (bytes: Uint8Array<ArrayBuffer>) => void;
    /** Waits, for the backoff between attempts. */
    readonly wait: (milliseconds: number) => Promise<void>;
    /**
     * Opens `url` in a hidden frame and gives the parameters that the redirect page of the frame
     * sends back with `postMessage`. See `oauth-resp.html`.
     */
    readonly authorizeInFrame: (
        url: string,
        timeoutMs: number,
    ) => Promise<Result<unknown, FrameError>>;
    /** Calls `listener` when the application comes back to the foreground. Returns the remover. */
    readonly onForeground: (listener: () => void) => () => void;
}

/** The type of the message that `oauth-resp.html` sends from a frame. */
export const FRAME_MESSAGE_TYPE = 'place-os';

/**
 * The real browser parts. `storage` selects `localStorage` or `sessionStorage` for the tokens.
 *
 * A browser can refuse storage, for example in a sandboxed frame. The store then keeps the values
 * in memory, so the login works but is not kept after a reload.
 */
export function browserEnvironment(storage: 'local' | 'session' = 'local'): AuthEnvironment {
    assert(typeof window !== 'undefined', 'browserEnvironment runs in a browser');
    const sessionStore = browserStore(() => window.sessionStorage);
    return {
        fetch: (url, init) => globalThis.fetch(url, init),
        storage: storage === 'session' ? sessionStore : browserStore(() => window.localStorage),
        sessionStorage: sessionStore,
        currentUrl: () => window.location.href,
        replaceUrl: (url) => window.history.replaceState(window.history.state, '', url),
        navigate: (url) => window.location.assign(url),
        now: () => Date.now(),
        randomValues: (bytes) => {
            crypto.getRandomValues(bytes);
        },
        wait: (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
        authorizeInFrame,
        onForeground: (listener) => {
            const onVisible = () => {
                if (document.visibilityState === 'visible') listener();
            };
            window.addEventListener('focus', onVisible);
            document.addEventListener('visibilitychange', onVisible);
            return () => {
                window.removeEventListener('focus', onVisible);
                document.removeEventListener('visibilitychange', onVisible);
            };
        },
    };
}

/** A store in memory. Tests and environments without storage use it. */
export function memoryStore(): KeyValueStore {
    const values = new Map<string, string>();
    return {
        get: (key) => values.get(key) ?? null,
        set: (key, value) => {
            values.set(key, value);
        },
        remove: (key) => {
            values.delete(key);
        },
        keys: () => [...values.keys()],
    };
}

/** Wraps a Web Storage. Each access can throw, so each one falls back to a store in memory. */
function browserStore(getStorage: () => Storage): KeyValueStore {
    const fallback = memoryStore();
    const storageOrNull = (): Storage | null => {
        try {
            return getStorage();
        } catch {
            return null;
        }
    };
    return {
        get: (key) => {
            const store = storageOrNull();
            if (store === null) return fallback.get(key);
            try {
                return store.getItem(key) ?? fallback.get(key);
            } catch {
                return fallback.get(key);
            }
        },
        set: (key, value) => {
            const store = storageOrNull();
            try {
                store?.setItem(key, value);
            } catch {
                // The quota is full or the storage is off. The value stays in memory below.
            }
            fallback.set(key, value);
        },
        remove: (key) => {
            fallback.remove(key);
            try {
                storageOrNull()?.removeItem(key);
            } catch {
                // The storage is off, so it has no value to remove.
            }
        },
        keys: () => {
            const keys = new Set(fallback.keys());
            const store = storageOrNull();
            if (store === null) return [...keys];
            try {
                for (let index = 0; index < store.length; index += 1) {
                    const key = store.key(index);
                    if (key !== null) keys.add(key);
                }
            } catch {
                // The storage is off. The keys in memory are all the keys.
            }
            return [...keys];
        },
    };
}

/**
 * Opens a hidden frame on `url` and waits for the message of `oauth-resp.html`. The frame, the
 * listener and the timer are removed on each path.
 */
function authorizeInFrame(url: string, timeoutMs: number): Promise<Result<unknown, FrameError>> {
    return new Promise((resolve) => {
        const frame = document.createElement('iframe');
        frame.id = 'place-authorize';
        frame.style.cssText =
            'position:absolute;top:0;left:0;width:1px;height:1px;border:0;z-index:-1';
        const finish = (result: Result<unknown, FrameError>) => {
            clearTimeout(timer);
            window.removeEventListener('message', onMessage);
            frame.remove();
            resolve(result);
        };
        const onMessage = (event: MessageEvent<unknown>) => {
            // Only the redirect page on this origin, in this frame, can send the parameters.
            if (event.origin !== window.location.origin) return;
            if (event.source !== frame.contentWindow) return;
            finish({ ok: true, value: event.data });
        };
        const timer = setTimeout(() => finish({ ok: false, error: 'timeout' }), timeoutMs);
        frame.addEventListener('error', () => finish({ ok: false, error: 'frame_error' }));
        window.addEventListener('message', onMessage);
        frame.src = url;
        document.body.appendChild(frame);
    });
}
