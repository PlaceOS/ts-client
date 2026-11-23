/**
 * Goal: the 6.x mocks of `@placeos/ts-client/compat` work with the 7.x client and the 7.x realtime
 * client, so that a mock mode and the tests of an app still work after the migration.
 * Method: register 6.x style endpoints and systems, and use them through 7.x calls.
 */
import { afterEach, expect, spyOn, test } from 'bun:test';
import {
    clearMockEndpoints,
    consoleLog,
    createConsoleLog,
    deregisterSystem,
    fromV1Mock,
    mockFetch,
    mockPage,
    mockRealtimeEnvironment,
    mockReply,
    mockSystem,
    orThrow,
    orThrowPage,
    registerMockEndpoint,
    registerSystem,
    type MockHttpRequest,
} from '../src/compat/index.ts';
import { createClient } from '../src/core/client.ts';
import { createRealtime, type BindingState } from '../src/realtime/realtime.ts';
import { settings, zones } from '../src/generated/operations/index.ts';
import { clearEndpointMocks, endpointMocks, mockEndpoint, respond } from '../src/mock/index.ts';

// An app gives `base_url: ''`. Outside a browser, a URL needs an origin. 6.x mock data often has
// only some fields. `missing_fields: 'zero'` fills the others, as the 6.x classes did.
const client = createClient({
    base_url: 'http://mock.invalid',
    auth: { kind: 'none' },
    fetch: mockFetch,
    missing_fields: 'zero',
});
const options = { client };

afterEach(() => {
    clearMockEndpoints();
    clearEndpointMocks();
    deregisterSystem('sys-1');
});

test('a 7.x call gets the response of a 6.x mock endpoint', async () => {
    const requests: MockHttpRequest[] = [];
    registerMockEndpoint({
        path: '/api/engine/v2/zones/:id',
        method: 'GET',
        callback: (request) => {
            requests.push(request);
            return { id: request.route_params['id'], name: 'Level 1', tags: ['level'] };
        },
    });
    registerMockEndpoint({
        path: '/api/engine/v2/zones',
        method: 'GET',
        metadata: [{ id: 'zone-1', name: 'Level 1' }],
        headers: { 'X-Total-Count': '7' },
    });
    const [zone, page] = await Promise.all([
        zones.show({ id: 'zone-1', complete: true }, options).then(orThrow),
        zones.query({ tags: ['level'] }, options).then(orThrowPage),
    ]);
    expect(zone).toMatchObject({ id: 'zone-1', name: 'Level 1', tags: ['level'] });
    // A required field that the mock leaves out gets its empty value.
    expect(zone.update_systems).toBe(false);
    expect(requests[0]?.query_params).toEqual({ complete: 'true' });
    expect(page.total).toBe(7);
    expect(page.data.map((item) => item.id)).toEqual(['zone-1']);
});

test('the body of a request reaches the mock endpoint', async () => {
    let body: unknown;
    registerMockEndpoint({
        path: '/api/engine/v2/zones',
        method: 'POST',
        callback: (request) => {
            body = request.body;
            return { id: 'zone-2', ...request.body };
        },
    });
    const zone = await zones.create({ body: { name: 'New' } }, options).then(orThrow);
    expect(body).toEqual({ name: 'New' });
    expect(zone.id).toBe('zone-2');
});

test('a missing endpoint is a 404, and a thrown status is that status', async () => {
    registerMockEndpoint({
        path: '/api/engine/v2/zones/:id',
        method: 'DELETE',
        callback: () => {
            throw Object.assign(new Error('Forbidden'), { status: 403 });
        },
    });
    const missing = await zones.show({ id: 'zone-1' }, options);
    const refused = await zones.destroy({ id: 'zone-1' }, options);
    expect(missing.ok === false && missing.error.kind === 'http' && missing.error.status).toBe(404);
    expect(refused.ok === false && refused.error.kind === 'http' && refused.error.status).toBe(403);
    // A migrated call rejects, as the 6.x function did.
    const rejected = zones.show({ id: 'zone-1' }, options).then(orThrow);
    await expect(rejected).rejects.toMatchObject({ name: 'CallFailed', status: 404 });
});

test('without missing_fields: zero, partial mock data is not valid', async () => {
    registerMockEndpoint({
        path: '/api/engine/v2/zones/:id',
        method: 'GET',
        metadata: { id: 'z' },
    });
    const strict = createClient({
        base_url: 'http://mock.invalid',
        auth: { kind: 'none' },
        fetch: mockFetch,
    });
    const result = await zones.show({ id: 'z' }, { client: strict });
    expect(result.ok === false && result.error.kind).toBe('response_invalid');
});

test('fromV1Mock fits the mockImplementation of an operation, with and without an input', async () => {
    // `vi.mocked(zones.show).mockImplementation(...)` asks for these types.
    const show: (...args: Parameters<typeof zones.show>) => ReturnType<typeof zones.show> =
        fromV1Mock((id: string) => Promise.resolve({ id, name: 'Level 1' }), ['id']);
    const query: (...args: Parameters<typeof zones.query>) => ReturnType<typeof zones.query> =
        fromV1Mock(() => Promise.resolve({ data: [{ id: 'zone-1' }], total: 1 }), ['...'], 'page');
    expect(orThrow(await show({ id: 'zone-1' })).name).toBe('Level 1');
    const page = await query();
    expect(orThrowPage(page).total).toBe(1);
    expect(page.ok && page.value.next()).toBeNull();
});

test('consoleLog writes the 6.x format with the console method of the level', () => {
    const written: string[] = [];
    const spies = (['debug', 'warn', 'log', 'group', 'groupEnd'] as const).map((method) =>
        spyOn(console, method).mockImplementation((...args: unknown[]) => {
            written.push(`${method} ${args.map(String).join(' | ')}`);
        }),
    );
    const plain = createConsoleLog({ colors: false });
    try {
        consoleLog({ scope: 'auth', level: 'debug', args: ['off'] });
        Reflect.set(globalThis, 'debug', true);
        consoleLog({ scope: 'auth', level: 'debug', args: ['loading 50%', { id: 1 }] });
        plain({ scope: 'realtime', level: 'warn', args: ['the socket closed'] });
        plain({ scope: 'auth', level: 'group', args: ['the authority'] });
        plain({ scope: 'auth', level: 'print', args: ['name:', 'PlaceOS', 2] });
        plain({ scope: 'auth', level: 'group_end', args: [] });
        plain({ scope: 'http', level: 'print', args: [{ id: 2 }] });
    } finally {
        Reflect.deleteProperty(globalThis, 'debug');
        for (const spy of spies) spy.mockRestore();
    }
    expect(written).toEqual([
        // A `%` in the message goes in with `%s`, so the console does not read it as a format.
        'debug %c[PlaceOS]%c[Auth]%c %s | color: #0288D1 | color: #009688 | color: default | loading 50% | [object Object]',
        'warn [PlaceOS][WS] the socket closed',
        'group [PlaceOS][Auth] the authority',
        'log [PlaceOS][Auth] name: | PlaceOS | 2',
        'groupEnd ',
        'log [PlaceOS][HTTP] | [object Object]',
    ]);
});

test('mockReply and mockPage make the results of test doubles', () => {
    const zone = { id: 'zone-1' };
    expect(orThrow(mockReply(zone))).toBe(zone);
    // The double of an operation with pages needs `next`.
    const history: Awaited<ReturnType<typeof settings.history>> = mockReply([]);
    expect(history.ok && history.value.next()).toBeNull();
    const page = orThrowPage(mockPage({ data: [zone], total: 3 }));
    expect(page).toMatchObject({ data: [zone], total: 3, next_offset: null });
    // On the last page, `next` is `null`, as in 6.x, so `if (page.next)` works.
    expect(page.next).toBeNull();
});

test('fromV1Mock and mockPage keep the next of a 6.x page', async () => {
    const last = { data: [{ id: 'zone-3' }], total: 3, next: null };
    const second = { data: [{ id: 'zone-2' }], total: 3, next: () => Promise.resolve(last) };
    const query: (...args: Parameters<typeof zones.query>) => ReturnType<typeof zones.query> =
        fromV1Mock(
            () => Promise.resolve({ data: [{ id: 'zone-1' }], total: 3, next: () => second }),
            ['...'],
            'page',
        );
    const first = orThrowPage(await query());
    expect(first.next_offset).toBe(1);
    const middle = await first.next?.();
    expect(middle).toMatchObject({ data: [{ id: 'zone-2' }], total: 3, next_offset: 2 });
    const end = await middle?.next?.();
    expect(end).toMatchObject({ data: [{ id: 'zone-3' }], next_offset: null, next: null });
    const typed = orThrowPage(mockPage({ data: [{ id: 'zone-1' }], next: () => last }));
    expect((await typed.next?.())?.data).toEqual([{ id: 'zone-3' }]);
});

test('a page of orThrowPage requests the next page, as in 6.x', async () => {
    mockEndpoint('zones.query', (input) =>
        input.offset === undefined
            ? respond([{ id: 'zone-1' }], { next_offset: 1 })
            : respond([{ id: 'zone-2' }]),
    );
    const typed = createClient({
        base_url: 'http://mock.invalid',
        auth: { kind: 'none' },
        mock: endpointMocks,
        missing_fields: 'zero',
    });
    const first = await zones.query({ limit: 1 }, { client: typed }).then(orThrowPage);
    const second = await first.next?.();
    expect(second?.data.map((item) => item.id)).toEqual(['zone-2']);
    expect(second?.next).toBeNull();
});

test('a 7.x binding and call use a 6.x mock system', async () => {
    registerSystem('sys-1', {
        Display: [
            {
                power: false,
                $power(this: { power: boolean }, on: boolean) {
                    this.power = on;
                    return on;
                },
            },
        ],
    });
    const realtime = createRealtime({
        base_url: 'http://mock.invalid',
        auth: { kind: 'none' },
        environment: mockRealtimeEnvironment(),
    });
    const states: BindingState[] = [];
    const power = { sys: 'sys-1', mod: 'Display', index: 1, name: 'power' };
    const release = realtime.bind(power, (state) => states.push(state));
    await waitFor(() => states.length > 0);
    expect(states.at(-1)).toEqual({ kind: 'value', value: false });

    // A function changes the variable, and the binding gets the new value.
    expect(await realtime.exec(power, [true])).toEqual({ ok: true, value: true });
    await waitFor(() => lastValue(states) === true);

    // A change in the test also notifies the binding.
    const display = mockSystem('sys-1')?.['Display']?.[0];
    if (display !== undefined) display['power'] = false;
    await waitFor(() => lastValue(states) === false);

    const missing = await realtime.exec({ ...power, mod: 'Camera' }, []);
    expect(missing.ok === false && missing.error.kind === 'server' && missing.error.code).toBe(
        'module_not_found',
    );
    release();
    realtime.stop();
});

test('a binding keeps the value of a variable that a function added', async () => {
    registerSystem('sys-2', {
        Debug: [
            {
                $post(this: Record<string, unknown>, id: string, value: string) {
                    this[`logs:${id}`] = value;
                },
            },
        ],
    });
    const realtime = createRealtime({
        base_url: 'http://mock.invalid',
        auth: { kind: 'none' },
        environment: mockRealtimeEnvironment(),
    });
    const logs = { sys: 'sys-2', mod: 'Debug', index: 1, name: 'post' };
    expect(await realtime.exec(logs, ['a', 'first'])).toEqual({ ok: true, value: null });
    const states: BindingState[] = [];
    const release = realtime.bind({ ...logs, name: 'logs:a' }, (state) => states.push(state));
    await waitFor(() => lastValue(states) === 'first');

    // After the binding, a change notifies it.
    expect((await realtime.exec(logs, ['a', 'second'])).ok).toBe(true);
    await waitFor(() => lastValue(states) === 'second');
    release();
    realtime.stop();
});

function lastValue(states: readonly BindingState[]): unknown {
    const last = states.at(-1);
    return last?.kind === 'value' ? last.value : undefined;
}

/** Waits for the mock socket. It answers on timers. */
async function waitFor(done: () => boolean): Promise<void> {
    for (let attempt = 0; attempt < 100; attempt += 1) {
        if (done()) return;
        await new Promise((resolve) => setTimeout(resolve, 5));
    }
    throw new Error('the condition did not become true');
}

test('a mock endpoint that gives a string gives JSON, unless it sets another content type', async () => {
    registerMockEndpoint({
        path: '/api/engine/v2/domains/lookup/:email',
        method: 'GET',
        callback: () => 'auth-1',
    });
    const response = await mockFetch('http://mock.invalid/api/engine/v2/domains/lookup/a', {});
    expect(await response.json()).toBe('auth-1');
    registerMockEndpoint({
        path: '/api/engine/v2/drivers/:id/readme',
        method: 'GET',
        headers: { 'Content-Type': 'text/markdown' },
        callback: () => '# Readme',
    });
    const text = await mockFetch('http://mock.invalid/api/engine/v2/drivers/d/readme', {});
    expect(await text.text()).toBe('# Readme');
});
