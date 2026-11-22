import type { LogEntry, LogFunction, LogLevel, LogScope } from '../core/log.ts';

/** The scope names of the 6.x console logs. */
const SCOPE_NAMES: Readonly<Record<LogScope, string>> = {
    http: 'HTTP',
    auth: 'Auth',
    realtime: 'WS',
    mock: 'HTTP(M)',
};
const COLORS = ['color: #0288D1', 'color: #009688', 'color: default'] as const;

/** The console method of each level. */
const METHODS = {
    error: 'error',
    warn: 'warn',
    info: 'info',
    debug: 'debug',
    print: 'log',
    group: 'group',
    group_end: 'groupEnd',
} as const satisfies Readonly<Record<LogLevel, keyof Console>>;

/**
 * A log function that writes `[PlaceOS][Auth] the authority is loaded` to the console, with the
 * console method of the level, such as `console.warn` for `warn`, and the arguments of the call.
 * As in 6.x, it writes only when `window.debug` is set, so an application can turn it on in the
 * console of the browser.
 *
 * A first argument that is a string joins the prefix, as in `[PlaceOS][Auth] loading`. `colors`
 * colors the prefix with `%c`, as 6.x did. Without colors, the text is plain.
 */
export function createConsoleLog(options: { readonly colors?: boolean } = {}): LogFunction {
    const colors = options.colors ?? true;
    return (entry: LogEntry) => {
        if (!Boolean(Reflect.get(globalThis, 'debug'))) return;
        const method = METHODS[entry.level];
        if (method === 'groupEnd') {
            console.groupEnd();
            return;
        }
        const scope = SCOPE_NAMES[entry.scope];
        const [first, ...rest] = entry.args;
        // A message joins the prefix: `[PlaceOS][WS] the socket closed`. The prefix is the format
        // string of the console, so a message with a `%` goes in with `%s`, and stays text.
        const message = typeof first === 'string' ? first : null;
        const literal = message !== null && !message.includes('%');
        const text = message === null ? '' : literal ? ` ${message}` : ' %s';
        const format = colors ? `%c[PlaceOS]%c[${scope}]%c${text}` : `[PlaceOS][${scope}]${text}`;
        const substituted = message !== null && !literal ? [message] : [];
        const values = message === null ? entry.args : rest;
        console[method](format, ...(colors ? COLORS : []), ...substituted, ...values);
    };
}

/**
 * The log function with the console format of 6.x, with colors:
 *
 * ```ts
 * configure({ base_url: '', auth: session.client_auth, log: consoleLog });
 * const session = createAuthSession({ ..., log: consoleLog });
 * const realtime = createRealtime({ ..., log: consoleLog });
 * // In the console of the browser: window.debug = true
 * ```
 */
export const consoleLog: LogFunction = createConsoleLog({ colors: true });
