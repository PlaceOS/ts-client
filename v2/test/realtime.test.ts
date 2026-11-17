/**
 * Goal: the realtime client speaks the protocol of the server, keeps bindings live across drops,
 * and settles each request. Method: give it fake sockets and a manual clock, play the server's
 * frames, then check the frames that the client sent and the results.
 */
import { describe, expect, test } from 'bun:test';
import type { Auth } from '../src/core/client.ts';
import type { RealtimeEnvironment, SocketHandlers } from '../src/realtime/environment.ts';
import {
    CONNECT_TIMEOUT_MS,
    createRealtime,
    INBOX_MAX,
    KEEP_ALIVE_MS,
    PENDING_MAX,
    RECONNECT_ATTEMPTS_MAX,
    RECONNECT_DELAY_MAX_MS,
    RENEW_AFTER_FAILURES,
    REQUEST_TIMEOUT_MS,
    splitModuleId,
    STALE_MS,
    type BindingState,
    type RealtimeConfig,
} from '../src/realtime/realtime.ts';

interface FakeSocket {
    readonly url: string;
    readonly handlers: SocketHandlers;
    readonly sent: string[];
    closed: boolean;
}

/** A fake platform: sockets that the test opens and feeds, and timers on a manual clock. */
function fakePlatform(transport: 'query' | 'cookie' = 'query') {
    let now = 0;
    const timers: { at: number; callback: () => void; cancelled: boolean }[] = [];
    const sockets: FakeSocket[] = [];
    const cookies: string[] = [];
    const environment: RealtimeEnvironment = {
        createSocket: (url, handlers) => {
            const socket: FakeSocket = { url, handlers, sent: [], closed: false };
            sockets.push(socket);
            return {
                send: (text) => socket.sent.push(text),
                close: () => {
                    socket.closed = true;
                },
            };
        },
        currentUrl: () => 'https://app.test/rooms',
        tokenTransport: transport,
        setCookie: (cookie) => cookies.push(cookie),
        now: () => now,
        setTimer: (milliseconds, callback) => {
            const timer = { at: now + milliseconds, callback, cancelled: false };
            timers.push(timer);
            return () => {
                timer.cancelled = true;
            };
        },
    };
    /** Moves the clock and runs each timer that is due, in time order. */
    const advance = async (milliseconds: number) => {
        const target = now + milliseconds;
        for (let step = 0; step < 10_000; step += 1) {
            await settled();
            const due = timers
                .filter((timer) => !timer.cancelled && timer.at <= target)
                .sort((a, b) => a.at - b.at)[0];
            if (due === undefined) break;
            due.cancelled = true;
            now = Math.max(now, due.at);
            due.callback();
        }
        now = target;
        await settled();
    };
    const latest = () => {
        const socket = sockets.at(-1);
        if (socket === undefined) throw new Error('no socket');
        return socket;
    };
    /** Opens the newest socket, as the server does. */
    const open = async () => {
        await settled();
        latest().handlers.open();
        await advance(0);
    };
    /** The server sends `frames`. The client handles them in one batch. */
    const receive = async (...frames: unknown[]) => {
        for (const frame of frames) {
            latest().handlers.message(typeof frame === 'string' ? frame : JSON.stringify(frame));
        }
        await advance(0);
    };
    const requests = (socket = latest()) =>
        socket.sent.filter((text) => text !== 'ping').map((text) => JSON.parse(text));
    return { environment, sockets, cookies, advance, open, receive, latest, requests };
}

/** Lets the promises that wait settle, such as the credential of `connect`. */
function settled(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

function realtime(platform: ReturnType<typeof fakePlatform>, config: Partial<RealtimeConfig> = {}) {
    const auth: Auth = { kind: 'bearer', token: () => 'abc' };
    return createRealtime({
        baseUrl: 'https://placeos.test',
        auth,
        environment: platform.environment,
        ...config,
    });
}

const POWER = { sys: 'sys-1', mod: 'Display', name: 'power' } as const;
const META = { sys: 'sys-1', mod: 'Display', index: 1, name: 'power' };

describe('connection', () => {
    test('connects on the first binding, with the token in the query', async () => {
        const platform = fakePlatform();
        const client = realtime(platform, { fixedDevice: true });
        expect(client.status().kind).toBe('idle');
        client.bind(POWER, () => {});
        await settled();
        expect(platform.latest().url).toBe(
            'wss://placeos.test/api/engine/v2/systems/control?fixed_device=true&bearer_token=abc',
        );
    });

    test('puts the token in a cookie on the socket path, not in the URL', async () => {
        const platform = fakePlatform('cookie');
        const auth: Auth = { kind: 'api_key', key: 'key-1' };
        realtime(platform, { auth, baseUrl: '' }).start();
        await settled();
        expect(platform.latest().url).toBe('wss://app.test/api/engine/v2/systems/control');
        expect(platform.cookies).toEqual([
            'api-key=key-1; max-age=120; path=/api/engine/v2/systems/control; ' +
                'samesite=strict; secure',
        ]);
    });

    test('a socket to a different host gets the token in the query, not a cookie', async () => {
        // A cookie set by the page reaches only the host of the page, app.test.
        const platform = fakePlatform('cookie');
        realtime(platform, { baseUrl: 'https://placeos.test' }).start();
        await settled();
        expect(platform.latest().url).toBe(
            'wss://placeos.test/api/engine/v2/systems/control?bearer_token=abc',
        );
        expect(platform.cookies).toEqual([]);
    });

    test('a status listener can stop the client on open or while it waits', async () => {
        const platform = fakePlatform();
        const client = realtime(platform);
        const stopOn = (kind: string) =>
            client.subscribe((status) => {
                if (status.kind === kind) client.stop();
            });
        const remove = stopOn('open');
        client.start();
        await platform.open();
        expect(client.status().kind).toBe('stopped');
        remove();
        stopOn('waiting');
        client.start();
        await settled();
        platform.latest().handlers.close();
        await platform.advance(60_000);
        expect(client.status().kind).toBe('stopped');
        expect(platform.sockets).toHaveLength(2);
    });

    test('sends a ping on open, and drops a socket that is silent for STALE_MS', async () => {
        const platform = fakePlatform();
        const client = realtime(platform);
        client.start();
        await platform.open();
        expect(platform.latest().sent).toEqual(['ping']);
        // The keep-alive sees the silence at its next tick, then the reconnect waits its delay.
        await platform.advance(STALE_MS + KEEP_ALIVE_MS + RECONNECT_DELAY_MAX_MS);
        expect(platform.sockets[0]?.closed).toBe(true);
        expect(platform.sockets).toHaveLength(2);
    });

    test('drops a socket that does not open in CONNECT_TIMEOUT_MS', async () => {
        const platform = fakePlatform();
        realtime(platform).start();
        await settled();
        await platform.advance(CONNECT_TIMEOUT_MS);
        expect(platform.sockets[0]?.closed).toBe(true);
    });

    test('asks the auth for a new credential after RENEW_AFTER_FAILURES failed opens', async () => {
        const platform = fakePlatform();
        const rejected: number[] = [];
        const auth: Auth = {
            kind: 'credential',
            credential: async () => ({ kind: 'bearer', token: 'abc' }),
            rejected: async (status) => {
                rejected.push(status);
                return true;
            },
        };
        realtime(platform, { auth }).start();
        for (let failure = 0; failure < RENEW_AFTER_FAILURES; failure += 1) {
            await settled();
            platform.latest().handlers.close();
            await platform.advance(5_000);
        }
        expect(rejected).toEqual([401]);
    });

    test('start, stop, start while the credential is pending connects', async () => {
        const platform = fakePlatform();
        let give: (token: string) => void = () => {};
        const auth: Auth = {
            kind: 'bearer',
            token: () => new Promise<string>((resolve) => (give = resolve)),
        };
        const client = realtime(platform, { auth });
        client.start();
        client.stop();
        client.start();
        give('abc');
        await settled();
        await settled();
        expect(platform.sockets.length).toBeGreaterThan(0);
        expect(client.status().kind).toBe('connecting');
    });

    test('gives up after RECONNECT_ATTEMPTS_MAX attempts, and start tries again', async () => {
        const platform = fakePlatform();
        const client = realtime(platform);
        const result = client.exec(POWER, [true], { timeoutMs: 10 * 60_000 });
        for (let failure = 0; failure < RECONNECT_ATTEMPTS_MAX; failure += 1) {
            await settled();
            platform.latest().handlers.close();
            await platform.advance(5_000);
        }
        expect(client.status().kind).toBe('failed');
        expect(await result).toEqual({ ok: false, error: { kind: 'unavailable' } });
        client.start();
        await settled();
        expect(client.status().kind).toBe('connecting');
    });
});

describe('bindings', () => {
    test('binds on open, and gives each listener the last value of a batch', async () => {
        const platform = fakePlatform();
        const client = realtime(platform);
        const states: BindingState[] = [];
        client.bind(POWER, (state) => states.push(state));
        await platform.open();
        expect(platform.requests()).toEqual([
            { id: 1, cmd: 'bind', sys: 'sys-1', mod: 'Display', index: 1, name: 'power' },
        ]);
        await platform.receive(
            { id: 1, type: 'success', meta: META },
            { id: 0, type: 'notify', value: false, meta: META },
            { id: 0, type: 'notify', value: true, meta: META },
        );
        expect(states).toEqual([{ kind: 'value', value: true }]);
        expect(client.value(POWER)).toEqual({ kind: 'value', value: true });
    });

    test('a second binding gets the value at once and sends no request', async () => {
        const platform = fakePlatform();
        const client = realtime(platform);
        const releaseFirst = client.bind(POWER, () => {});
        await platform.open();
        await platform.receive({ id: 0, type: 'notify', value: 42, meta: META });
        const states: BindingState[] = [];
        const releaseSecond = client.bind(POWER, (state) => states.push(state));
        expect(states).toEqual([{ kind: 'value', value: 42 }]);
        expect(platform.requests()).toHaveLength(1);
        releaseFirst();
        expect(platform.requests()).toHaveLength(1);
        releaseSecond();
        releaseSecond();
        expect(platform.requests().map((message) => message.cmd)).toEqual(['bind', 'unbind']);
    });

    test('binds each variable again on a new socket', async () => {
        const platform = fakePlatform();
        const client = realtime(platform);
        client.bind(POWER, () => {});
        client.bind({ ...POWER, name: 'volume', index: 2 }, () => {});
        await platform.open();
        platform.latest().handlers.close();
        await platform.advance(5_000);
        await platform.open();
        const commands = platform.requests().map((message) => [message.cmd, message.name]);
        expect(commands).toEqual([
            ['bind', 'power'],
            ['bind', 'volume'],
        ]);
    });

    test('a full inbox opens a new socket, which binds again for the current values', async () => {
        const platform = fakePlatform();
        const client = realtime(platform);
        client.bind(POWER, () => {});
        await platform.open();
        const notify = { id: 0, type: 'notify', value: 1, meta: META };
        await platform.receive(...Array.from({ length: INBOX_MAX + 1 }, () => notify));
        expect(platform.sockets[0]?.closed).toBe(true);
        await platform.advance(RECONNECT_DELAY_MAX_MS);
        await platform.open();
        expect(platform.requests().map((message) => message.cmd)).toEqual(['bind']);
    });

    test('more bindings than PENDING_MAX all bind, and a release unbinds when calls are full', async () => {
        const platform = fakePlatform();
        const client = realtime(platform);
        const releases: (() => void)[] = [];
        for (let index = 0; index <= PENDING_MAX; index += 1) {
            releases.push(client.bind({ ...POWER, name: `variable_${index}` }, () => {}));
        }
        await platform.open();
        expect(platform.requests().filter((message) => message.cmd === 'bind')).toHaveLength(
            PENDING_MAX + 1,
        );
        // The calls of the application fill PENDING_MAX. An unbind must still go.
        for (let index = 0; index < PENDING_MAX; index += 1) void client.exec(POWER);
        releases[0]?.();
        expect(platform.requests().filter((message) => message.cmd === 'unbind')).toHaveLength(1);
    });

    test('a refused bind gives the error to the listeners', async () => {
        const platform = fakePlatform();
        const client = realtime(platform);
        const states: BindingState[] = [];
        client.bind(POWER, (state) => states.push(state));
        await platform.open();
        await platform.receive({
            id: 1,
            type: 'error',
            error_code: 6,
            code: 404,
            msg: 'no module',
        });
        expect(states).toEqual([
            {
                kind: 'error',
                error: {
                    kind: 'server',
                    code: 'module_not_found',
                    status: 404,
                    message: 'no module',
                },
            },
        ]);
    });
});

describe('exec', () => {
    test('sends only the fields of the protocol, and gives the return value', async () => {
        const platform = fakePlatform();
        const client = realtime(platform);
        const result = client.exec({ ...POWER, iface: true }, [true, { level: 2 }]);
        await platform.open();
        expect(platform.requests()).toEqual([
            {
                id: 1,
                cmd: 'exec',
                sys: 'sys-1',
                mod: 'Display',
                index: 1,
                name: 'power',
                args: [true, { level: 2 }],
                iface: true,
            },
        ]);
        await platform.receive('pong', 'not json', { id: 1, type: 'success', value: 'ok' });
        expect(await result).toEqual({ ok: true, value: 'ok' });
    });

    test('a call that the server got fails with disconnected on a close', async () => {
        const platform = fakePlatform();
        const client = realtime(platform);
        client.start();
        await platform.open();
        const sent = client.exec(POWER, [true]);
        platform.latest().handlers.close();
        expect(await sent).toEqual({ ok: false, error: { kind: 'disconnected' } });
        // A call while the socket is down waits, and goes on the next socket.
        const queued = client.exec(POWER, [false]);
        await platform.advance(5_000);
        await platform.open();
        await platform.receive({ id: 2, type: 'success', value: null });
        expect(await queued).toEqual({ ok: true, value: null });
    });

    test('a request without a response times out', async () => {
        const platform = fakePlatform();
        const client = realtime(platform);
        const result = client.exec(POWER);
        await platform.open();
        await platform.advance(REQUEST_TIMEOUT_MS);
        expect(await result).toEqual({
            ok: false,
            error: { kind: 'timeout', timeoutMs: REQUEST_TIMEOUT_MS },
        });
    });

    test('a success just before a close is a success, not disconnected', async () => {
        const platform = fakePlatform();
        const client = realtime(platform);
        client.start();
        await platform.open();
        const result = client.exec(POWER, [true]);
        // The success is in the inbox, not handled yet, when the socket closes.
        platform.latest().handlers.message(JSON.stringify({ id: 1, type: 'success', value: 1 }));
        platform.latest().handlers.close();
        expect(await result).toEqual({ ok: true, value: 1 });
    });

    test('stop settles each pending call and does not reconnect', async () => {
        const platform = fakePlatform();
        const client = realtime(platform);
        const result = client.exec(POWER);
        await platform.open();
        client.stop();
        expect(await result).toEqual({ ok: false, error: { kind: 'stopped' } });
        await platform.advance(60_000);
        expect(platform.sockets).toHaveLength(1);
        expect(platform.latest().closed).toBe(true);
    });
});

describe('debug', () => {
    test('asks for the logs of a module by its ID, and gives them to the listener', async () => {
        const platform = fakePlatform();
        const client = realtime(platform);
        const messages: string[] = [];
        const release = client.debug({ sys: 'sys-1', moduleId: 'mod-1' }, (log) =>
            messages.push(`${log.level}: ${log.message}`),
        );
        await platform.open();
        await platform.receive({
            id: 1,
            type: 'debug',
            level: 'info',
            msg: 'connected',
            meta: { sys: 'sys-1', mod: 'mod-1', index: 1, name: '' },
        });
        expect(messages).toEqual(['info: connected']);
        release();
        expect(platform.requests().map((message) => [message.cmd, message.mod])).toEqual([
            ['debug', 'mod-1'],
            ['ignore', 'mod-1'],
        ]);
    });
});

test('splitModuleId reads the index at the end of a module ID', () => {
    expect(splitModuleId('Display_2')).toEqual({ mod: 'Display', index: 2 });
    expect(splitModuleId('Lighting_Control')).toEqual({ mod: 'Lighting_Control', index: 1 });
    expect(splitModuleId('Display')).toEqual({ mod: 'Display', index: 1 });
});
