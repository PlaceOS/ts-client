/**
 * Goal: a typed endpoint mock answers the calls of its endpoint, with the same checks and parse as
 * a response of the server. The compiler checks the name, the input and the data.
 * Method: mock endpoints on a client without a server, and call them.
 */
import { afterEach, expect, test } from 'bun:test';
import { createClient } from '../src/core/client.ts';
import { pageInfo } from '../src/core/pagination.ts';
import { metadata, systems, zones } from '../src/generated/operations/index.ts';
import {
    clearEndpointMocks,
    endpointMocks,
    httpError,
    mockEndpoint,
    respond,
} from '../src/mock/index.ts';

// No `fetch` can answer: a call that a mock does not answer fails as a network error.
const client = createClient({
    baseUrl: 'http://mock.invalid',
    auth: { kind: 'none' },
    mock: endpointMocks,
    fetch: () => Promise.reject(new Error('no server')),
});
const options = { client };

afterEach(() => clearEndpointMocks());

test('a mock gets the typed input and gives the parsed data', async () => {
    const inputs: { id: string; complete?: boolean }[] = [];
    mockEndpoint('zones.show', (input) => {
        inputs.push(input);
        return { id: input.id, name: 'Level 1', tags: ['level'] };
    });
    const result = await zones.show({ id: 'zone-1', complete: true }, options);
    expect(inputs).toEqual([{ id: 'zone-1', complete: true }]);
    if (!result.ok) throw new Error(JSON.stringify(result.error));
    expect(result.value.data).toMatchObject({ id: 'zone-1', name: 'Level 1', tags: ['level'] });
    // A required field that the mock leaves out gets its empty value. An optional one is null.
    expect(result.value.data.update_systems).toBe(false);
    expect(result.value.data.description).toBeNull();
});

test('respond sets the status and the page total, and the body reaches the mock', async () => {
    mockEndpoint('zones.index', () => respond([{ id: 'zone-1' }], { total: 25 }));
    mockEndpoint('systems.update', (input) => ({ id: input.sys_id, ...input.body }), {
        delayMs: 1,
    });
    const page = await zones.index({ limit: 1 }, options);
    expect(page.ok && pageInfo(page.value.headers).total).toBe(25);
    const updated = await systems.update(
        { sys_id: 'sys-1', version: 2, body: { name: 'Room' } },
        options,
    );
    expect(updated.ok && updated.value.data.name).toBe('Room');
});

test('httpError gives an http error, and data with a wrong type is invalid', async () => {
    mockEndpoint('zones.show', () => {
        throw httpError(404, 'zone not found');
    });
    // The client parses the data of a mock as it parses a response: a string is not an array.
    mockEndpoint('metadata.show', () => ({ settings: { details: {}, editors: 'admin' } }) as never);
    const missing = await zones.show({ id: 'zone-1' }, options);
    expect(missing.ok === false && missing.error).toMatchObject({
        kind: 'http',
        status: 404,
        message: 'zone not found',
    });
    const invalid = await metadata.show({ id: 'zone-1' }, options);
    expect(invalid.ok === false && invalid.error.kind).toBe('response_invalid');
});

test('a call without a mock sends the request, and a removed mock stops', async () => {
    const remove = mockEndpoint('zones.show', () => ({ id: 'zone-1' }));
    expect((await zones.show({ id: 'zone-1' }, options)).ok).toBe(true);
    remove();
    const sent = await zones.show({ id: 'zone-1' }, options);
    expect(sent.ok === false && sent.error.kind).toBe('network');
});

test('the compiler checks the name, the input and the data', () => {
    // @ts-expect-error there is no such endpoint
    mockEndpoint('zones.no_such_endpoint', () => ({}));
    // @ts-expect-error `name` of a zone is a string
    mockEndpoint('zones.show', () => ({ name: 1 }));
    mockEndpoint('zones.show', (input) => {
        // @ts-expect-error `zones.show` has no `sys_id`
        void input.sys_id;
        return {};
    });
    // An endpoint without a response schema gives bytes, text or nothing.
    mockEndpoint('zones.destroy', () => undefined);
});
