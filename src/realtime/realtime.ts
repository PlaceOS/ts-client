/**
 * The realtime API of PlaceOS: one WebSocket to `systems/control`, with bindings to the status
 * variables of modules, function calls and module logs.
 *
 * ```ts
 * const realtime = createRealtime({ base_url: '', auth: session.client_auth });
 * const release = realtime.bind({ sys: 'sys-1', mod: 'Display', name: 'power' }, (state) => {
 *     if (state.kind === 'value') console.log(state.value);
 * });
 * const result = await realtime.exec({ sys: 'sys-1', mod: 'Display', name: 'power' }, [true]);
 * ```
 *
 * The client connects when the first binding or call needs it. It binds each variable again after
 * a new connection, so a binding stays live across network drops.
 *
 * Incoming messages go into a bounded inbox, and the client handles them in batches. In one batch,
 * many notifications for one variable give one call to its listeners, with the last value.
 */
import { assert, unreachable } from '../core/assert.ts';
import { resolveCredential, type Auth, type Credential } from '../core/client.ts';
import type { Result } from '../core/result.ts';
import {
    integer,
    json,
    literal,
    nullable,
    object,
    parseResponse,
    string,
    type JsonValue,
} from '../core/schema.ts';
import {
    browserRealtimeEnvironment,
    type RealtimeEnvironment,
    type RealtimeSocket,
} from './environment.ts';

export const CONTROL_PATH = '/api/engine/v2/systems/control';
export const REQUEST_TIMEOUT_MS = 10_000;
export const KEEP_ALIVE_MS = 15_000;
/** A socket without a message for this long is dead: four keep-alives, as in 6.x. */
export const STALE_MS = 4 * KEEP_ALIVE_MS;
/** The time limit for a new socket to open. */
export const CONNECT_TIMEOUT_MS = 30_000;
/** The wait before reconnect attempt `n` is `n * RECONNECT_DELAY_STEP_MS`, to the maximum. */
export const RECONNECT_DELAY_STEP_MS = 300;
export const RECONNECT_DELAY_MAX_MS = 5_000;
/** About three minutes of attempts. Then the status is `failed`, and `start` tries again. */
export const RECONNECT_ATTEMPTS_MAX = 40;
/** After this many sockets in a row that did not open, ask the auth for a new credential. */
export const RENEW_AFTER_FAILURES = 3;
/** The calls of the application that wait for a response: `exec`. */
export const PENDING_MAX = 1024;
export const BINDINGS_MAX = 4096;
/**
 * The bind, unbind, debug and ignore commands that wait for a response. Each binding and each
 * debugger has at most two at a time in normal use, so they have their own limit and a full
 * `PENDING_MAX` cannot stop a rebind after a reconnect.
 */
export const BINDING_REQUESTS_MAX = 4 * BINDINGS_MAX;
export const BINDING_LISTENERS_MAX = 64;
export const STATUS_LISTENERS_MAX = 64;
/** At the limit, the client opens a new socket. The bindings then get their values again. */
export const INBOX_MAX = 4096;
export const COOKIE_MAX_AGE_SECONDS = 120;
const INDEX_MAX = 2 ** 31 - 1;

/** The error codes of the server, by value (`Driver::Proxy::RemoteDriver::ErrorCode`). */
export const ERROR_CODE_NAMES = [
    'parse_error',
    'bad_request',
    'access_denied',
    'request_failed',
    'unknown_command',
    'system_not_found',
    'module_not_found',
    'unexpected_failure',
] as const;

/** A status variable or a function of a module in a system. */
export interface RealtimeTarget {
    readonly sys: string;
    /** The module name, such as `Display`. */
    readonly mod: string;
    /** The index of the module in the system. The default is 1. */
    readonly index?: number;
    /** The name of the status variable or the function. */
    readonly name: string;
    /** `mod` is an interface, such as `Interface::Sensor`. */
    readonly iface?: boolean;
}

/** A module to get the logs of. The server needs the module ID, not its name. */
export interface DebugTarget {
    readonly sys: string;
    readonly module_id: string;
}

export type RealtimeError =
    | { readonly kind: 'timeout'; readonly timeout_ms: number }
    /** The socket closed after the server got the request. The result is not known. */
    | { readonly kind: 'disconnected' }
    /** `stop` ran before the response. */
    | { readonly kind: 'stopped' }
    /** The client could not connect `RECONNECT_ATTEMPTS_MAX` times. */
    | { readonly kind: 'unavailable' }
    | { readonly kind: 'too_many_requests'; readonly pending_max: number }
    /** The server refused the request. `status` is the HTTP style code, such as 404. */
    | {
          readonly kind: 'server';
          readonly code: (typeof ERROR_CODE_NAMES)[number] | 'unknown';
          readonly status: number | null;
          readonly message: string | null;
      };

/** What a binding knows about its variable. */
export type BindingState =
    | { readonly kind: 'unknown' }
    | { readonly kind: 'value'; readonly value: JsonValue }
    | { readonly kind: 'error'; readonly error: RealtimeError };

export interface DebugMessage {
    readonly level: string | null;
    readonly message: string;
    /** When the client got the message, in milliseconds since the Unix epoch. */
    readonly received_at_ms: number;
}

export type RealtimeStatus =
    | { readonly kind: 'idle' }
    | { readonly kind: 'connecting'; readonly attempt: number }
    | { readonly kind: 'open'; readonly since_ms: number }
    | { readonly kind: 'waiting'; readonly attempt: number; readonly delay_ms: number }
    /** `RECONNECT_ATTEMPTS_MAX` attempts failed. `start` tries again. */
    | { readonly kind: 'failed' }
    | { readonly kind: 'stopped' };

export interface RealtimeConfig {
    /** The origin of the server, such as `https://placeos.example.com`. `''` is this origin. */
    readonly base_url: string;
    readonly auth: Auth;
    /** Tells the server that this is a device in a fixed location. */
    readonly fixed_device?: boolean;
    readonly environment?: RealtimeEnvironment;
}

export interface Realtime {
    /** Connects now. A binding or a call also connects. */
    start(): void;
    /** Closes the socket. Pending calls give `stopped`. The bindings stay for the next `start`. */
    stop(): void;
    status(): RealtimeStatus;
    /** Calls `listener` on each change of the status. Returns the remover. */
    subscribe(listener: (status: RealtimeStatus) => void): () => void;
    /** Calls a function of a module. The value is the return value of the function. */
    exec(
        target: RealtimeTarget,
        args?: readonly JsonValue[],
        options?: { readonly timeout_ms?: number },
    ): Promise<Result<JsonValue, RealtimeError>>;
    /**
     * Binds to a status variable. `listener` gets each new state, and the current one at once if
     * it is known. The returned function releases this binding. The last release unbinds.
     *
     * A listener must not throw.
     */
    bind(target: RealtimeTarget, listener: (state: BindingState) => void): () => void;
    /** The state of a variable that has a binding now. */
    value(target: RealtimeTarget): BindingState;
    /** Gets the logs of a module. The returned function stops this listener. */
    debug(target: DebugTarget, listener: (message: DebugMessage) => void): () => void;
}

/** `Display_2` is the module `Display` with index 2. A name without an index has index 1. */
export function splitModuleId(module_id: string): { readonly mod: string; readonly index: number } {
    // `lastIndexOf` is linear. A regular expression such as `^(.+)_(\d+)$` backtracks.
    const separator = module_id.lastIndexOf('_');
    const digits = module_id.slice(separator + 1);
    if (separator <= 0 || !/^\d+$/.test(digits)) return { mod: module_id, index: 1 };
    const index = Number(digits);
    assert(Number.isSafeInteger(index), 'the module index is an integer');
    return { mod: module_id.slice(0, separator), index: Math.max(1, index) };
}

const Meta = object({ sys: string(), mod: string(), index: integer('Int32'), name: string() }, [
    'sys',
    'mod',
    'index',
    'name',
]);

/** A message of the server (`PlaceOS::Api::WebSocket::Session::Response`). */
const ServerMessage = object(
    {
        id: integer(),
        type: literal(['success', 'notify', 'error', 'debug']),
        msg: nullable(string()),
        /** The value of a notification, or the return value of a function. */
        value: json(),
        error_code: nullable(integer('Int32')),
        meta: nullable(Meta),
        level: nullable(string()),
        /** An HTTP style status of an error, such as 404. */
        code: nullable(integer('Int32')),
    },
    ['id', 'type'],
);

type Command = 'bind' | 'unbind' | 'exec' | 'debug' | 'ignore';

interface Pending {
    readonly text: string;
    /** A call of the application, which counts to `PENDING_MAX`. Else a binding command. */
    readonly call: boolean;
    /** The server got the request. A close then makes its result unknown. */
    sent: boolean;
    readonly resolve: (result: Result<JsonValue, RealtimeError>) => void;
    readonly cancelTimer: () => void;
}

interface Binding {
    readonly target: Required<RealtimeTarget>;
    /** One holder for each `bind`. The binding ends when the last holder releases it. */
    readonly holders: Set<{ readonly listener: (state: BindingState) => void }>;
    state: BindingState;
}

interface Debugger {
    readonly target: DebugTarget;
    readonly holders: Set<{ readonly listener: (message: DebugMessage) => void }>;
}

/** Makes a realtime client. It connects when it first needs to. */
export function createRealtime(config: RealtimeConfig): Realtime {
    assert(!config.base_url.endsWith('/'), 'the base_url has no trailing slash');
    const environment = config.environment ?? browserRealtimeEnvironment();

    let status: RealtimeStatus = { kind: 'idle' };
    let socket: RealtimeSocket | null = null;
    /** Each socket has a generation. The client ignores the events of an old socket. */
    let generation = 0;
    /** Each connect attempt has an ID. `stop` and a new attempt make an older one stop. */
    let connect_attempt = 0;
    let calls_pending = 0;
    /** The connect attempts since the last open. */
    let attempt = 0;
    let failures_before_open = 0;
    let renew_before_connect = false;
    let last_credential: Credential | null = null;
    let last_message_at_ms = 0;
    let cancelConnectTimer: (() => void) | null = null;
    let cancelKeepAlive: (() => void) | null = null;
    let cancelReconnect: (() => void) | null = null;
    let drain_scheduled = false;
    let status_notify_scheduled = false;
    let next_id = 1;
    const pending = new Map<number, Pending>();
    /** The pending requests that wait for a socket, in the order of the calls. */
    const queue: number[] = [];
    const bindings = new Map<string, Binding>();
    const debuggers = new Map<string, Debugger>();
    const inbox: unknown[] = [];
    const status_listeners = new Set<(status: RealtimeStatus) => void>();

    return {
        start,
        stop,
        status: () => status,
        subscribe,
        exec,
        bind,
        value,
        debug,
    };

    function start(): void {
        const kind = status.kind;
        if (kind === 'open' || kind === 'connecting' || kind === 'waiting') return;
        attempt = 0;
        failures_before_open = 0;
        // A rejection of `connect` is a bug, and the platform reports it as unhandled.
        void connect();
    }

    function stop(): void {
        connect_attempt += 1;
        setStatus({ kind: 'stopped' });
        cancelTimers();
        cancelReconnect?.();
        cancelReconnect = null;
        closeSocket();
        for (const id of [...pending.keys()]) settle(id, { ok: false, error: { kind: 'stopped' } });
        queue.length = 0;
    }

    function exec(
        target: RealtimeTarget,
        args: readonly JsonValue[] = [],
        options: { readonly timeout_ms?: number } = {},
    ): Promise<Result<JsonValue, RealtimeError>> {
        const timeout_ms = options.timeout_ms ?? REQUEST_TIMEOUT_MS;
        assert(
            Number.isSafeInteger(timeout_ms) && timeout_ms > 0,
            'timeout_ms is a positive integer',
        );
        return request('exec', normalize(target), args, timeout_ms);
    }

    function bind(target: RealtimeTarget, listener: (state: BindingState) => void): () => void {
        const normalized = normalize(target);
        const key = variableKey(normalized);
        let binding = bindings.get(key);
        if (binding === undefined) {
            assert(bindings.size < BINDINGS_MAX, 'the client has less than BINDINGS_MAX bindings');
            binding = { target: normalized, holders: new Set(), state: { kind: 'unknown' } };
            bindings.set(key, binding);
        }
        assert(
            binding.holders.size < BINDING_LISTENERS_MAX,
            'a binding has less than BINDING_LISTENERS_MAX listeners',
        );
        const holder = { listener };
        binding.holders.add(holder);
        if (binding.holders.size === 1) sendBind(binding);
        const current = binding.state;
        if (current.kind !== 'unknown') listener(current);

        let released = false;
        const owner = binding;
        return () => {
            if (released) return;
            released = true;
            owner.holders.delete(holder);
            if (owner.holders.size > 0) return;
            bindings.delete(key);
            // Without a socket, the server has no binding to remove.
            if (status.kind === 'open') {
                void request('unbind', owner.target, null, REQUEST_TIMEOUT_MS);
            }
        };
    }

    function value(target: RealtimeTarget): BindingState {
        return bindings.get(variableKey(normalize(target)))?.state ?? { kind: 'unknown' };
    }

    function debug(target: DebugTarget, listener: (message: DebugMessage) => void): () => void {
        assert(target.sys.length > 0, 'the system ID is not empty');
        assert(target.module_id.length > 0, 'the module ID is not empty');
        const key = debugKey(target.sys, target.module_id);
        let entry = debuggers.get(key);
        if (entry === undefined) {
            assert(
                debuggers.size < BINDINGS_MAX,
                'the client has less than BINDINGS_MAX debuggers',
            );
            entry = { target, holders: new Set() };
            debuggers.set(key, entry);
        }
        assert(entry.holders.size < BINDING_LISTENERS_MAX, 'a debugger has room for a listener');
        const holder = { listener };
        entry.holders.add(holder);
        if (entry.holders.size === 1) sendDebug(entry, 'debug');

        let released = false;
        const owner = entry;
        return () => {
            if (released) return;
            released = true;
            owner.holders.delete(holder);
            if (owner.holders.size > 0) return;
            debuggers.delete(key);
            if (status.kind === 'open') sendDebug(owner, 'ignore');
        };
    }

    /** Sends a request now, or queues it until the socket opens. */
    function request(
        command: Command,
        target: Required<RealtimeTarget>,
        args: readonly JsonValue[] | null,
        timeout_ms: number,
    ): Promise<Result<JsonValue, RealtimeError>> {
        if (status.kind === 'stopped') return Promise.resolve(failure({ kind: 'stopped' }));
        if (status.kind === 'failed') return Promise.resolve(failure({ kind: 'unavailable' }));
        const call = command === 'exec';
        const limit = call ? PENDING_MAX : BINDING_REQUESTS_MAX;
        const count = call ? calls_pending : pending.size - calls_pending;
        if (count >= limit) {
            return Promise.resolve(failure({ kind: 'too_many_requests', pending_max: limit }));
        }
        const id = next_id;
        next_id += 1;
        assert(Number.isSafeInteger(id), 'the request ID is a safe integer');
        // The server parses the request strictly, so send only the fields that it knows.
        const text = JSON.stringify({
            id,
            cmd: command,
            sys: target.sys,
            mod: target.mod,
            index: target.index,
            name: target.name,
            ...(args === null ? {} : { args }),
            ...(target.iface ? { iface: true } : {}),
        });
        return new Promise((resolve) => {
            const cancelTimer = environment.setTimer(timeout_ms, () =>
                settle(id, failure({ kind: 'timeout', timeout_ms })),
            );
            const entry: Pending = { text, call, sent: false, resolve, cancelTimer };
            pending.set(id, entry);
            if (call) calls_pending += 1;
            if (socket !== null && status.kind === 'open') {
                socket.send(text);
                entry.sent = true;
            } else {
                queue.push(id);
                if (status.kind === 'idle') start();
            }
        });
    }

    function settle(id: number, result: Result<JsonValue, RealtimeError>): void {
        const entry = pending.get(id);
        if (entry === undefined) return;
        pending.delete(id);
        if (entry.call) calls_pending -= 1;
        assert(calls_pending >= 0, 'the count of calls is not negative');
        // A request that times out before the socket opens leaves the queue, so it stays bounded.
        if (!entry.sent) {
            const queued = queue.indexOf(id);
            if (queued >= 0) queue.splice(queued, 1);
        }
        entry.cancelTimer();
        entry.resolve(result);
    }

    /** Binds on the server when the socket is open. `onOpen` binds the others. */
    function sendBind(binding: Binding): void {
        if (status.kind !== 'open') {
            if (status.kind === 'idle') start();
            return;
        }
        const key = variableKey(binding.target);
        void request('bind', binding.target, null, REQUEST_TIMEOUT_MS).then((result) => {
            if (result.ok) return;
            // A newer binding for the same variable has its own request.
            if (bindings.get(key) !== binding) return;
            setBindingState(binding, { kind: 'error', error: result.error });
        });
    }

    function sendDebug(entry: Debugger, command: 'debug' | 'ignore'): void {
        if (status.kind !== 'open') {
            if (status.kind === 'idle') start();
            return;
        }
        // The server reads the module ID from `mod` for logs. It does not use `index` or `name`.
        const target = { sys: entry.target.sys, mod: entry.target.module_id, index: 1, name: '' };
        void request(command, { ...target, iface: false }, null, REQUEST_TIMEOUT_MS);
    }

    async function connect(): Promise<void> {
        connect_attempt += 1;
        const this_attempt = connect_attempt;
        attempt += 1;
        setStatus({ kind: 'connecting', attempt });
        if (renew_before_connect && config.auth.kind === 'credential' && last_credential !== null) {
            renew_before_connect = false;
            await config.auth.rejected(401, last_credential);
            if (this_attempt !== connect_attempt) return;
        }
        const credential = await resolveCredential(config.auth);
        // `stop`, or `stop` then `start`, can run while the credential is pending.
        if (this_attempt !== connect_attempt) return;
        if (status.kind !== 'connecting') return;
        if (credential === null) {
            scheduleReconnect();
            return;
        }
        last_credential = credential;
        const url = socketUrl(credential);
        generation += 1;
        const socket_generation = generation;
        const current = () => socket_generation === generation;
        socket = environment.createSocket(url, {
            open: () => {
                if (current()) onOpen();
            },
            message: (data) => {
                if (current()) onMessage(data);
            },
            close: () => {
                if (current()) onDisconnect();
            },
        });
        cancelConnectTimer = environment.setTimer(CONNECT_TIMEOUT_MS, () => {
            cancelConnectTimer = null;
            if (current() && status.kind === 'connecting') dropSocket();
        });
    }

    function onOpen(): void {
        cancelConnectTimer?.();
        cancelConnectTimer = null;
        attempt = 0;
        failures_before_open = 0;
        last_message_at_ms = environment.now();
        setStatus({ kind: 'open', since_ms: last_message_at_ms });
        const opened = socket;
        assert(opened !== null, 'an open socket exists');
        opened.send('ping');
        // The server forgets the bindings of a closed socket. Bind each one again.
        for (const binding of bindings.values()) sendBind(binding);
        for (const entry of debuggers.values()) sendDebug(entry, 'debug');
        for (const id of queue.splice(0, queue.length)) {
            const entry = pending.get(id);
            if (entry === undefined || entry.sent) continue;
            opened.send(entry.text);
            entry.sent = true;
        }
        scheduleKeepAlive();
    }

    function onMessage(data: unknown): void {
        last_message_at_ms = environment.now();
        if (inbox.length >= INBOX_MAX) {
            // The listeners are slower than the server. A new socket resyncs each binding.
            dropSocket();
            return;
        }
        inbox.push(data);
        if (drain_scheduled) return;
        drain_scheduled = true;
        environment.setTimer(0, drain);
    }

    /** Handles the inbox in one batch. Notifications for one variable give one update. */
    function drain(): void {
        drain_scheduled = false;
        const messages = inbox.splice(0, inbox.length);
        const changed = new Map<string, JsonValue>();
        const logs: [Debugger, DebugMessage][] = [];
        const received_at_ms = environment.now();
        for (const data of messages) {
            if (typeof data !== 'string') continue;
            // The server sends `pong` as an answer and also as its own keep-alive.
            if (data === 'pong') continue;
            const message = parseServerMessage(data);
            if (message === null) continue;
            switch (message.type) {
                case 'success':
                    settle(message.id, { ok: true, value: message.value });
                    break;
                case 'error':
                    settle(message.id, failure(serverError(message)));
                    break;
                case 'notify':
                    if (message.meta !== null) {
                        changed.set(variableKey(message.meta), message.value);
                    }
                    break;
                case 'debug': {
                    if (message.meta === null) break;
                    const entry = debuggers.get(debugKey(message.meta.sys, message.meta.mod));
                    if (entry === undefined) break;
                    const text = message.msg ?? '';
                    logs.push([entry, { level: message.level, message: text, received_at_ms }]);
                    break;
                }
                default:
                    unreachable(message.type);
            }
        }
        // Update the state first, then call the listeners.
        for (const [key, changed_value] of changed) {
            const binding = bindings.get(key);
            if (binding !== undefined) {
                setBindingState(binding, { kind: 'value', value: changed_value });
            }
        }
        for (const [entry, log] of logs) {
            for (const holder of [...entry.holders]) holder.listener(log);
        }
    }

    function onDisconnect(): void {
        // A response can wait in the inbox. Handle it before the requests fail as disconnected.
        if (inbox.length > 0) drain();
        cancelTimers();
        socket = null;
        if (status.kind !== 'open') failures_before_open += 1;
        // The result of a request that the server got is not known now.
        for (const [id, entry] of [...pending]) {
            if (entry.sent) settle(id, failure({ kind: 'disconnected' }));
        }
        if (status.kind === 'stopped') return;
        scheduleReconnect();
    }

    function scheduleReconnect(): void {
        if (attempt >= RECONNECT_ATTEMPTS_MAX) {
            setStatus({ kind: 'failed' });
            for (const id of [...pending.keys()]) settle(id, failure({ kind: 'unavailable' }));
            queue.length = 0;
            return;
        }
        if (failures_before_open >= RENEW_AFTER_FAILURES) {
            // The credential can be the reason. The next attempt asks the auth for a new one.
            failures_before_open = 0;
            renew_before_connect = true;
        }
        const delay_ms = Math.min(
            RECONNECT_DELAY_MAX_MS,
            Math.max(1, attempt) * RECONNECT_DELAY_STEP_MS,
        );
        setStatus({ kind: 'waiting', attempt, delay_ms });
        cancelReconnect = environment.setTimer(delay_ms, () => {
            cancelReconnect = null;
            void connect();
        });
    }

    function scheduleKeepAlive(): void {
        cancelKeepAlive = environment.setTimer(KEEP_ALIVE_MS, () => {
            cancelKeepAlive = null;
            if (status.kind !== 'open' || socket === null) return;
            if (environment.now() - last_message_at_ms > STALE_MS) {
                dropSocket();
                return;
            }
            socket.send('ping');
            scheduleKeepAlive();
        });
    }

    /** Closes the socket now, without a wait for its `close` event, and reconnects. */
    function dropSocket(): void {
        closeSocket();
        onDisconnect();
    }

    function closeSocket(): void {
        // A new generation makes the client ignore the events of the closed socket.
        generation += 1;
        socket?.close();
        socket = null;
    }

    function cancelTimers(): void {
        cancelConnectTimer?.();
        cancelConnectTimer = null;
        cancelKeepAlive?.();
        cancelKeepAlive = null;
    }

    /** The URL of the socket. It puts the token in the query or in a cookie. */
    function socketUrl(credential: Credential): string {
        const origin =
            config.base_url.length > 0 ? config.base_url : new URL(environment.currentUrl()).origin;
        const url = new URL(CONTROL_PATH, origin);
        const secure = url.protocol === 'https:';
        url.protocol = secure ? 'wss:' : 'ws:';
        if (config.fixed_device === true) url.searchParams.set('fixed_device', 'true');
        let token: readonly [string, string] | null = null;
        switch (credential.kind) {
            case 'none':
                break;
            case 'bearer':
                token = ['bearer_token', credential.token];
                break;
            case 'api_key':
                token = ['api-key', credential.key];
                break;
            default:
                unreachable(credential);
        }
        if (token !== null) {
            const [name, token_value] = token;
            // A cookie reaches only the host of the page. A socket to a different host gets the token
            // in the query.
            const page_host = new URL(environment.currentUrl()).hostname;
            if (environment.token_transport === 'query' || url.hostname !== page_host) {
                url.searchParams.set(name, token_value);
            } else {
                // The server reads the cookie value as it is, so the value must be cookie safe.
                assert(/^[^;\s]+$/.test(token_value), 'the token has no semicolons or spaces');
                const secure_flag = secure ? '; secure' : '';
                environment.setCookie(
                    `${name}=${token_value}; max-age=${COOKIE_MAX_AGE_SECONDS}; ` +
                        `path=${CONTROL_PATH}; samesite=strict${secure_flag}`,
                );
            }
        }
        return url.toString();
    }

    function setBindingState(binding: Binding, state: BindingState): void {
        binding.state = state;
        for (const holder of [...binding.holders]) holder.listener(state);
    }

    /**
     * Sets the status now, and tells the listeners after the current step. A listener can call
     * `stop` or `start`, and that must not run in the middle of a transition. The listeners get
     * the latest status, as the bindings get the latest value of a batch.
     */
    function setStatus(next: RealtimeStatus): void {
        status = next;
        if (status_notify_scheduled) return;
        status_notify_scheduled = true;
        environment.setTimer(0, () => {
            status_notify_scheduled = false;
            const current = status;
            for (const listener of [...status_listeners]) listener(current);
        });
    }

    function subscribe(listener: (status: RealtimeStatus) => void): () => void {
        assert(status_listeners.size < STATUS_LISTENERS_MAX, 'the client has room for a listener');
        status_listeners.add(listener);
        return () => {
            status_listeners.delete(listener);
        };
    }
}

function normalize(target: RealtimeTarget): Required<RealtimeTarget> {
    const index = target.index ?? 1;
    assert(target.sys.length > 0, 'the system ID is not empty');
    assert(target.mod.length > 0, 'the module name is not empty');
    assert(target.name.length > 0, 'the name is not empty');
    assert(Number.isSafeInteger(index), 'the module index is an integer');
    assert(index >= 1 && index <= INDEX_MAX, 'the module index is from 1 to 2^31 - 1');
    return {
        sys: target.sys,
        mod: target.mod,
        index,
        name: target.name,
        iface: target.iface === true,
    };
}

/** The key of a variable. The notifications of the server have these four fields. */
function variableKey(target: {
    readonly sys: string;
    readonly mod: string;
    readonly index: number;
    readonly name: string;
}): string {
    return JSON.stringify([target.sys, target.mod, target.index, target.name]);
}

function debugKey(sys: string, module_id: string): string {
    return JSON.stringify([sys, module_id]);
}

/** Parses one text frame. A frame that is not a message of the server gives `null`. */
function parseServerMessage(text: string) {
    let decoded: unknown;
    try {
        decoded = JSON.parse(text);
    } catch {
        return null;
    }
    const parsed = parseResponse(ServerMessage, decoded);
    return parsed.ok ? parsed.value : null;
}

function serverError(message: {
    readonly error_code: number | null;
    readonly code: number | null;
    readonly msg: string | null;
}): RealtimeError {
    const name = message.error_code === null ? undefined : ERROR_CODE_NAMES[message.error_code];
    return { kind: 'server', code: name ?? 'unknown', status: message.code, message: message.msg };
}

function failure(error: RealtimeError): Result<JsonValue, RealtimeError> {
    return { ok: false, error };
}
