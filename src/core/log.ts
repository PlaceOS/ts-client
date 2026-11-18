/**
 * Optional debug logs of the client, the login and the realtime client. Without a `log` function
 * they log nothing. Give `consoleLog` of `@placeos/ts-client/compat` for the console format of
 * 6.x, or a function of your own:
 *
 * ```ts
 * configure({ base_url: '', auth, log: (entry) => console.debug(entry.scope, entry.message) });
 * ```
 *
 * An entry has no tokens, API keys, cookies, request bodies or input values.
 *
 * Inside the library, each part logs through a scoped logger. The log function of the application
 * decides where the entries go:
 *
 * ```ts
 * const log = scopedLog('auth', { sink: config.log ?? null });
 * log.info('the authority is loaded', { name });
 * ```
 *
 * @module
 */

/** The part that logs: the REST client, the login, the realtime client or the mock endpoints. */
export type LogScope = 'http' | 'auth' | 'realtime' | 'mock';

/**
 * The level of an entry. `print` is a line without a level, as `console.log`. `group` starts a
 * group of the entries that follow, and `group_end` ends it.
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'print' | 'group' | 'group_end';

export interface LogEntry {
    readonly scope: LogScope;
    readonly level: LogLevel;
    /**
     * The arguments of the call, as a console method gets them: often a message, then values that
     * help to find a problem, such as a status. Never a secret. Empty for `group_end`.
     */
    readonly args: readonly unknown[];
}

export type LogFunction = (entry: LogEntry) => void;

/**
 * The logger of one scope. The methods have the arguments of the console methods of the same
 * name: `log.warn('the socket closed', { attempt })` as `console.warn(...)`. `print` is
 * `console.log`. Each call gives one entry to the sink.
 */
export interface ScopedLog {
    error(...data: unknown[]): void;
    warn(...data: unknown[]): void;
    info(...data: unknown[]): void;
    debug(...data: unknown[]): void;
    print(...data: unknown[]): void;
    group(...label: unknown[]): void;
    groupEnd(): void;
}

/**
 * A logger for `scope` that gives its entries to `sink`. A `null` sink logs nothing. A sink that
 * throws does not change what the caller does, because a log is for debugging only.
 */
export function scopedLog(
    scope: LogScope,
    options: { readonly sink: LogFunction | null },
): ScopedLog {
    const sink = options.sink;
    const write = (level: LogLevel, args: readonly unknown[]) => {
        if (sink === null) return;
        try {
            sink({ scope, level, args });
        } catch {
            // The error is in the log function of the application, not in the client.
        }
    };
    return {
        error: (...data) => write('error', data),
        warn: (...data) => write('warn', data),
        info: (...data) => write('info', data),
        debug: (...data) => write('debug', data),
        print: (...data) => write('print', data),
        group: (...label) => write('group', label),
        groupEnd: () => write('group_end', []),
    };
}
