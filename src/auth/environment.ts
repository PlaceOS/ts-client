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
    readonly session_storage: KeyValueStore;
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
        timeout_ms: number,
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
    const session_store = webStorageStore(() => window.sessionStorage);
    return {
        fetch: (url, init) => globalThis.fetch(url, init),
        storage: storage === 'session' ? session_store : webStorageStore(() => window.localStorage),
        session_storage: session_store,
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

/**
 * Wraps a Web Storage, such as `localStorage`. The storage is the one source of truth, so a change
 * in a different tab, such as a logout, is seen here. Each access can throw, for example in a
 * sandboxed frame or with a full quota. Then the value stays in memory, so the login works but is
 * not kept after a reload.
 */
export function webStorageStore(getStorage: () => Storage): KeyValueStore {
    /** Only the values that the storage refused. */
    const refused = memoryStore();
    const storageOrNull = (): Storage | null => {
        try {
            return getStorage();
        } catch {
            return null;
        }
    };
    return {
        get: (key) => {
            const kept = refused.get(key);
            if (kept !== null) return kept;
            const store = storageOrNull();
            if (store === null) return null;
            try {
                return store.getItem(key);
            } catch {
                return null;
            }
        },
        set: (key, value) => {
            const store = storageOrNull();
            if (store !== null && trySetItem(store, key, value)) {
                refused.remove(key);
                return;
            }
            refused.set(key, value);
        },
        remove: (key) => {
            refused.remove(key);
            try {
                storageOrNull()?.removeItem(key);
            } catch {
                // The storage is off, so it has no value to remove.
            }
        },
        keys: () => {
            const keys = new Set(refused.keys());
            const store = storageOrNull();
            if (store === null) return [...keys];
            try {
                for (let index = 0; index < store.length; index += 1) {
                    const key = store.key(index);
                    if (key !== null) keys.add(key);
                }
            } catch {
                // The storage is off. The refused keys are all the keys.
            }
            return [...keys];
        },
    };
}

function trySetItem(store: Storage, key: string, value: string): boolean {
    try {
        store.setItem(key, value);
        return true;
    } catch {
        return false;
    }
}

/**
 * Opens a hidden frame on `url` and waits for the message of `oauth-resp.html`. The frame, the
 * listener and the timer are removed on each path.
 */
function authorizeInFrame(url: string, timeout_ms: number): Promise<Result<unknown, FrameError>> {
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
        const timer = setTimeout(() => finish({ ok: false, error: 'timeout' }), timeout_ms);
        frame.addEventListener('error', () => finish({ ok: false, error: 'frame_error' }));
        window.addEventListener('message', onMessage);
        frame.src = url;
        document.body.appendChild(frame);
    });
}
