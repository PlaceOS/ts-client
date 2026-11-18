/**
 * Goal: the 6.x mocks of `@placeos/ts-client/compat` work with the 7.x client and the 7.x realtime
 * client, so that a mock mode and the tests of an app still work after the migration.
 * Method: register 6.x style endpoints and systems, and use them through 7.x calls.
 */
import { afterEach, expect, test } from 'bun:test';
import {
    clearMockEndpoints,
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
import { zones } from '../src/generated/operations/index.ts';

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

test('mockReply and mockPage make the results of test doubles', () => {
    const zone = { id: 'zone-1' };
    expect(orThrow(mockReply(zone))).toBe(zone);
    expect(orThrowPage(mockPage({ data: [zone], total: 3 }))).toEqual({
        data: [zone],
        total: 3,
        next_offset: null,
    });
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
