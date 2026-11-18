/**
 * The mock systems of 6.x, for the 7.x realtime client. Give `mockRealtimeEnvironment()` to
 * `createRealtime`, and the bindings and calls go to the systems that `registerSystem` adds:
 *
 * ```ts
 * registerSystem('sys-1', { Display: [{ power: false, $power: (on: boolean) => on }] });
 * const realtime = createRealtime({ baseUrl: '', auth, environment: mockRealtimeEnvironment() });
 * const display = mockSystem('sys-1')?.['Display']?.[0];
 * if (display !== undefined) display['power'] = true; // The bindings of `power` get `true`.
 * ```
 *
 * As in 6.x, a function of a module is a property with a function value. Its name can start with
 * `$`. `exec` of a function that the module does not have gives `null`.
 *
 * @module
 */
import { assert } from '../core/assert.ts';
import type {
    RealtimeEnvironment,
    RealtimeSocket,
    SocketHandlers,
} from '../realtime/environment.ts';
import { ERROR_CODE_NAMES } from '../realtime/realtime.ts';

/** More systems is a leak, such as a test that registers in a loop and never removes them. */
export const MOCK_SYSTEMS_MAX = 10_000;
/** More status variables on one mock module is a leak, such as a test that binds random names. */
export const MOCK_VARIABLES_MAX = 1_000;
/** More messages waiting in one mock socket is a test that sends without letting it answer. */
export const MOCK_MESSAGES_MAX = 10_000;

/** A mock module: its status variables and its functions. As in 6.x, the values have no type. */
export type MockModule = Record<string, any>;
/** The modules of a mock system, by class. `Display: [first, second]` is `Display_1` and `Display_2`. */
export type MockSystem = Record<string, MockModule[]>;
/** The 6.x names of the types. */
export type MockPlaceWebsocketSystem = MockSystem;
export type MockPlaceWebsocketModule = MockModule;

type Listener = (value: unknown) => void;

interface ModuleState {
    readonly module: MockModule;
    readonly values: Map<string, unknown>;
    readonly listeners: Map<string, Set<Listener>>;
}

const systems = new Map<string, { system: MockSystem; modules: Map<string, ModuleState[]> }>();

/** Adds a mock system, or replaces the system with this ID. Gives the system. */
export function registerSystem(id: string, details: Record<string, readonly object[]>): MockSystem {
    assert(systems.has(id) || systems.size < MOCK_SYSTEMS_MAX, 'fewer mock systems');
    const system: MockSystem = {};
    const modules = new Map<string, ModuleState[]>();
    for (const [name, list] of Object.entries(details)) {
        const states = list.map(mockModule);
        modules.set(name, states);
        system[name] = states.map((state) => state.module);
    }
    systems.set(id, { system, modules });
    return system;
}

/** The mock system with this ID, or `undefined`. */
export function mockSystem(id: string): MockSystem | undefined {
    return systems.get(id)?.system;
}

export function deregisterSystem(id: string): void {
    systems.delete(id);
}

/**
 * Each property that is not a function becomes a status variable. A change to it notifies the
 * bindings of the variable.
 */
function mockModule(properties: object): ModuleState {
    const module: MockModule = {};
    const values = new Map<string, unknown>();
    const listeners = new Map<string, Set<Listener>>();
    const state: ModuleState = { module, values, listeners };
    // 6.x also takes the `$` functions of a class prototype.
    const prototype: unknown = Object.getPrototypeOf(properties);
    const inherited =
        prototype === null || prototype === Object.prototype
            ? []
            : Object.getOwnPropertyNames(prototype).filter((name) => name.startsWith('$'));
    for (const key of [...Object.keys(properties), ...inherited]) {
        const value: unknown = Reflect.get(properties, key);
        if (typeof value === 'function') {
            // `execute` calls it with the module as `this`, as 6.x does.
            module[key.startsWith('$') ? key : `$${key}`] = value;
            continue;
        }
        addVariable(state, key.replace(/^\$/, ''), value);
    }
    return state;
}

function addVariable(state: ModuleState, name: string, value: unknown): void {
    assert(state.values.size < MOCK_VARIABLES_MAX, 'fewer variables on a mock module');
    state.values.set(name, value);
    Object.defineProperty(state.module, name, {
        enumerable: true,
        get: () => state.values.get(name),
        set: (next: unknown) => {
            state.values.set(name, next);
            for (const listener of [...(state.listeners.get(name) ?? [])]) listener(next);
        },
    });
}

/** A realtime environment with a fake socket that answers from the mock systems. */
export function mockRealtimeEnvironment(): RealtimeEnvironment {
    return {
        createSocket,
        currentUrl: () => (typeof location === 'undefined' ? 'http://localhost/' : location.href),
        tokenTransport: 'query',
        setCookie: () => {},
        now: () => Date.now(),
        setTimer: (milliseconds, callback) => {
            const timer = setTimeout(callback, milliseconds);
            return () => clearTimeout(timer);
        },
    };
}

/** The request of the client (`PlaceOS::Api::WebSocket::Session::Request`). */
interface Request {
    readonly id: number;
    readonly cmd: string;
    readonly sys: string;
    readonly mod: string;
    readonly index: number;
    readonly name: string;
    readonly args: readonly unknown[];
}

function createSocket(_url: string, handlers: SocketHandlers): RealtimeSocket {
    let open = true;
    /** The listener of each binding, by the JSON of its target. */
    const bound = new Map<string, () => void>();
    // The socket answers later, as a real one does: the answers wait here, and one timer sends
    // them. A close drops the answers that wait.
    const outbox: (() => void)[] = [];
    let timer: ReturnType<typeof setTimeout> | null = null;
    const flush = () => {
        timer = null;
        for (const work of outbox.splice(0, outbox.length)) if (open) work();
    };
    const later = (work: () => void) => {
        assert(outbox.length < MOCK_MESSAGES_MAX, 'fewer messages wait in the mock socket');
        outbox.push(work);
        timer ??= setTimeout(flush, 0);
    };
    const reply = (message: object) => later(() => handlers.message(JSON.stringify(message)));
    later(() => handlers.open());

    function handle(request: Request): void {
        const meta = {
            sys: request.sys,
            mod: request.mod,
            index: request.index,
            name: request.name,
        };
        const key = JSON.stringify(meta);
        const found = systems.get(request.sys);
        const state = found?.modules.get(request.mod)?.[request.index - 1];
        if (state === undefined) {
            const code = found === undefined ? 'system_not_found' : 'module_not_found';
            reply({
                id: request.id,
                type: 'error',
                error_code: ERROR_CODE_NAMES.indexOf(code),
                msg: `mock ${code.replace('_', ' ')}: ${request.sys} ${request.mod}_${request.index}`,
            });
            return;
        }
        switch (request.cmd) {
            case 'bind': {
                if (!state.values.has(request.name)) addVariable(state, request.name, null);
                const notify: Listener = (value) =>
                    reply({ id: request.id, type: 'notify', value: value ?? null, meta });
                bound.get(key)?.();
                const listeners = state.listeners.get(request.name) ?? new Set<Listener>();
                listeners.add(notify);
                state.listeners.set(request.name, listeners);
                bound.set(key, () => {
                    listeners.delete(notify);
                    if (listeners.size === 0) state.listeners.delete(request.name);
                });
                reply({ id: request.id, type: 'success' });
                notify(state.values.get(request.name));
                return;
            }
            case 'unbind':
                bound.get(key)?.();
                bound.delete(key);
                reply({ id: request.id, type: 'success' });
                return;
            case 'exec':
                void execute(state, request).then(
                    (value) => reply({ id: request.id, type: 'success', value: value ?? null }),
                    (error: unknown) =>
                        reply({
                            id: request.id,
                            type: 'error',
                            error_code: ERROR_CODE_NAMES.indexOf('request_failed'),
                            msg: error instanceof Error ? error.message : String(error),
                        }),
                );
                return;
            default:
                // `debug` and `ignore`: the mock has no logs.
                reply({ id: request.id, type: 'success' });
        }
    }

    return {
        send: (text) => {
            assert(open, 'the mock socket is open');
            if (text === 'ping') {
                later(() => handlers.message('pong'));
                return;
            }
            const request = parseRequest(text);
            if (request !== null) handle(request);
        },
        close: () => {
            if (!open) return;
            for (const release of bound.values()) release();
            bound.clear();
            open = false;
            outbox.length = 0;
            if (timer !== null) clearTimeout(timer);
            timer = null;
            setTimeout(() => handlers.close(), 0);
        },
    };
}

async function execute(state: ModuleState, request: Request): Promise<unknown> {
    const fn: unknown = state.module[`$${request.name}`];
    if (typeof fn !== 'function') return null;
    return Reflect.apply(fn, state.module, [...request.args]);
}

function parseRequest(text: string): Request | null {
    let value: unknown;
    try {
        value = JSON.parse(text);
    } catch {
        return null;
    }
    if (typeof value !== 'object' || value === null) return null;
    const field = (key: string): unknown => Reflect.get(value, key);
    const id = field('id');
    const cmd = field('cmd');
    const sys = field('sys');
    const mod = field('mod');
    const index = field('index');
    const name = field('name');
    const args = field('args');
    if (typeof id !== 'number' || typeof cmd !== 'string' || typeof sys !== 'string') return null;
    if (typeof mod !== 'string' || typeof index !== 'number' || typeof name !== 'string')
        return null;
    return { id, cmd, sys, mod, index, name, args: Array.isArray(args) ? args : [] };
}
