/**
 * Goal: `call` sends what the server expects, and converts each failure to the correct error.
 * Method: replace `fetch` with a function that records the request and returns a fixed response.
 */
import { describe, expect, test } from 'bun:test';
import {
    call,
    configure,
    createClient,
    operation,
    type ClientConfig,
    type FetchFunction,
} from '../src/core/client.ts';
import {
    array,
    boolean,
    integer,
    nullable,
    object,
    parameters,
    string,
} from '../src/core/schema.ts';
import { join } from 'node:path';
import { zones } from '../src/index.ts';

interface Sent {
    readonly url: string;
    readonly method: string;
    readonly headers: Headers;
    readonly body: string | null;
}

/** A fetch that records each request in `sent` and answers with `respond`. */
function fakeFetch(respond: (init: RequestInit) => Response | Promise<Response>) {
    const sent: Sent[] = [];
    const fetch: FetchFunction = async (url, init) => {
        const body = typeof init.body === 'string' ? init.body : null;
        sent.push({ url, method: init.method ?? '', headers: new Headers(init.headers), body });
        return respond(init);
    };
    return { fetch, sent };
}

function jsonResponse(value: unknown, status = 200): Response {
    return new Response(JSON.stringify(value), { status });
}

function clientWith(fetch: FetchFunction, config: Partial<ClientConfig> = {}) {
    return createClient({
        baseUrl: 'https://placeos.test',
        auth: { kind: 'none' },
        fetch,
        ...config,
    });
}

const Item = object({ id: string(), name: nullable(string()) }, ['id']);

const UPDATE = operation({
    method: 'PATCH',
    path: '/api/items/{id}',
    pathKeys: ['id'],
    params: parameters(
        {
            id: string(),
            tags: nullable(array(string())),
            complete: boolean(),
            limit: integer('UInt32'),
            q: nullable(string()),
        },
        ['id'],
    ),
    body: Item,
    response: Item,
});

const DOWNLOAD = operation({
    method: 'GET',
    path: '/api/download',
    pathKeys: [],
    params: parameters({}),
    body: null,
    response: null,
});

describe('call', () => {
    test('puts parameters in the path and query, and sends the body as JSON', async () => {
        const { fetch, sent } = fakeFetch(() => jsonResponse({ id: 'item 1' }));
        const input = {
            id: 'item 1',
            tags: ['a', 'b'],
            complete: true,
            q: null,
            body: { name: 'Lobby' },
        };
        const result = await call(UPDATE, input, { client: clientWith(fetch) });
        expect(result).toMatchObject({ ok: true, value: { status: 200 } });
        expect(sent).toHaveLength(1);
        expect(sent[0]?.method).toBe('PATCH');
        expect(sent[0]?.url).toBe(
            'https://placeos.test/api/items/item%201?tags=a%2Cb&complete=true',
        );
        expect(sent[0]?.body).toBe('{"name":"Lobby"}');
        expect(sent[0]?.headers.get('content-type')).toBe('application/json');
    });

    test('parses the response with the schema of the operation', async () => {
        const { fetch } = fakeFetch(() => jsonResponse({ id: 'item-1', extra: 1 }));
        const result = await call(
            UPDATE,
            { id: 'item-1', body: {} },
            { client: clientWith(fetch) },
        );
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.value.data).toEqual({ id: 'item-1', name: null });
    });

    test('gives the raw bytes when the operation has no response schema', async () => {
        const { fetch } = fakeFetch(() => new Response(new Uint8Array([1, 2, 3])));
        const result = await call(DOWNLOAD, {}, { client: clientWith(fetch) });
        expect(result.ok).toBe(true);
        if (result.ok) expect([...result.value.data]).toEqual([1, 2, 3]);
    });

    test('sends the bearer token or the API key', async () => {
        const { fetch, sent } = fakeFetch(() => new Response(''));
        await call(
            DOWNLOAD,
            {},
            { client: clientWith(fetch, { auth: { kind: 'bearer', token: () => 'abc' } }) },
        );
        await call(
            DOWNLOAD,
            {},
            { client: clientWith(fetch, { auth: { kind: 'api_key', key: 'key-1' } }) },
        );
        expect(sent[0]?.headers.get('authorization')).toBe('Bearer abc');
        expect(sent[1]?.headers.get('x-api-key')).toBe('key-1');
        const missing = clientWith(fetch, { auth: { kind: 'bearer', token: async () => null } });
        expect(await call(DOWNLOAD, {}, { client: missing })).toEqual({
            ok: false,
            error: { kind: 'auth_missing' },
        });
        expect(sent).toHaveLength(2);
    });

    test('throws on input that does not match the schema, before it sends', async () => {
        const { fetch, sent } = fakeFetch(() => new Response(''));
        const client = clientWith(fetch);
        // A variable with an extra field passes the type check. Only the run time check sees it.
        const typo = { id: 'item-1', limt: 5, body: {} };
        await expect(call(UPDATE, typo, { client: client })).rejects.toThrow(
            'At $.limt: no field with this name',
        );
        await expect(call(UPDATE, { id: '', body: {} }, { client: client })).rejects.toThrow(
            'the path parameter "id" is not empty',
        );
        expect(sent).toHaveLength(0);
    });
});

describe('call errors', () => {
    test('gives the status, the message and the body of an HTTP error', async () => {
        const { fetch } = fakeFetch(() => jsonResponse({ error: 'not found' }, 404));
        expect(await call(DOWNLOAD, {}, { client: clientWith(fetch) })).toEqual({
            ok: false,
            error: {
                kind: 'http',
                status: 404,
                message: 'not found',
                body: { error: 'not found' },
            },
        });
        const text = fakeFetch(() => new Response('<html>', { status: 502 }));
        expect(await call(DOWNLOAD, {}, { client: clientWith(text.fetch) })).toEqual({
            ok: false,
            error: { kind: 'http', status: 502, message: null, body: null },
        });
    });

    test('gives response_invalid for a body that is not JSON or does not match', async () => {
        const input = { id: 'item-1', body: {} };
        const text = fakeFetch(() => new Response('not json'));
        expect(await call(UPDATE, input, { client: clientWith(text.fetch) })).toEqual({
            ok: false,
            error: { kind: 'response_invalid', status: 200, path: '$', expected: 'JSON' },
        });
        const wrong = fakeFetch(() => jsonResponse({ id: 7 }));
        expect(await call(UPDATE, input, { client: clientWith(wrong.fetch) })).toEqual({
            ok: false,
            error: { kind: 'response_invalid', status: 200, path: '$.id', expected: 'string' },
        });
    });

    test('converts a fetch exception to a network error', async () => {
        const fetch: FetchFunction = async () => {
            throw new TypeError('Failed to fetch');
        };
        expect(await call(DOWNLOAD, {}, { client: clientWith(fetch) })).toEqual({
            ok: false,
            error: { kind: 'network', message: 'Failed to fetch' },
        });
    });

    test('tells a timeout from a cancel by the caller', async () => {
        // This fetch waits until the signal stops it, like a server that does not answer.
        const hang: FetchFunction = (_url, init) =>
            new Promise((_resolve, reject) => {
                init.signal?.addEventListener('abort', () => reject(init.signal?.reason));
            });
        const client = clientWith(hang, { timeoutMs: 20 });
        expect(await call(DOWNLOAD, {}, { client: client })).toEqual({
            ok: false,
            error: { kind: 'timeout', timeoutMs: 20 },
        });
        const controller = new AbortController();
        const pending = call(
            DOWNLOAD,
            {},
            { client: client, signal: controller.signal, timeoutMs: 5_000 },
        );
        controller.abort();
        expect(await pending).toEqual({ ok: false, error: { kind: 'aborted' } });
    });

    test('the time limit and the cancel also cover the wait for the credential', async () => {
        const { fetch, sent } = fakeFetch(() => new Response(''));
        // A credential that is slow, such as a login that renews the token.
        const slow = new Promise<string>((resolve) => setTimeout(() => resolve('abc'), 200));
        const client = clientWith(fetch, { auth: { kind: 'bearer', token: () => slow } });
        expect(await call(DOWNLOAD, {}, { client, timeoutMs: 20 })).toEqual({
            ok: false,
            error: { kind: 'timeout', timeoutMs: 20 },
        });
        const controller = new AbortController();
        const pending = call(DOWNLOAD, {}, { client, signal: controller.signal, timeoutMs: 5_000 });
        controller.abort();
        expect(await pending).toEqual({ ok: false, error: { kind: 'aborted' } });
        expect(sent).toHaveLength(0);
    });

    test('a cancelled call does not start the credential, so a rejection has no orphan', async () => {
        let started = false;
        const token = () => {
            started = true;
            return Promise.reject(new Error('the token store failed'));
        };
        const client = clientWith(fakeFetch(() => new Response('')).fetch, {
            auth: { kind: 'bearer', token },
        });
        const controller = new AbortController();
        controller.abort();
        expect(await call(DOWNLOAD, {}, { client, signal: controller.signal })).toEqual({
            ok: false,
            error: { kind: 'aborted' },
        });
        expect(started).toBe(false);
    });

    test('stops at responseBytesMax, with or without a content-length', async () => {
        const tooLarge = { ok: false, error: { kind: 'response_too_large', bytesMax: 8 } } as const;
        const declared = fakeFetch(() => new Response('0123456789'));
        expect(
            await call(
                DOWNLOAD,
                {},
                { client: clientWith(declared.fetch, { responseBytesMax: 8 }) },
            ),
        ).toEqual(tooLarge);
        // A stream has no content-length, so the reader must count the bytes.
        const streamed = fakeFetch(() => {
            const stream = new ReadableStream<Uint8Array>({
                pull(controller) {
                    controller.enqueue(new Uint8Array(4));
                },
            });
            return new Response(stream);
        });
        expect(
            await call(
                DOWNLOAD,
                {},
                { client: clientWith(streamed.fetch, { responseBytesMax: 8 }) },
            ),
        ).toEqual(tooLarge);
    });
});

describe('generated operations', () => {
    test('zones.show reads the epoch timestamps that the server sends', async () => {
        const { fetch, sent } = fakeFetch(() =>
            jsonResponse({
                id: 'zone-1',
                name: 'Level 1',
                created_at: 1_700_000_000,
                update_systems: false,
            }),
        );
        const result = await zones.show(
            { id: 'zone-1', complete: true },
            { client: clientWith(fetch) },
        );
        expect(sent[0]?.url).toBe('https://placeos.test/api/engine/v2/zones/zone-1?complete=true');
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value.data.created_at).toBe(1_700_000_000);
        expect(result.value.data.name).toBe('Level 1');
        expect(result.value.data.tags).toBeNull();
    });
});

describe('configure', () => {
    test('gives the client to each call without a client in its options', async () => {
        const configured = fakeFetch(() => jsonResponse({ id: 'zone-1', update_systems: false }));
        configure({
            baseUrl: 'https://configured.test',
            auth: { kind: 'none' },
            fetch: configured.fetch,
        });
        await zones.show({ id: 'zone-1' });
        expect(configured.sent[0]?.url).toBe('https://configured.test/api/engine/v2/zones/zone-1');
        // A client in the options replaces the configured client for that call only.
        const other = fakeFetch(() => jsonResponse({ id: 'zone-1', update_systems: false }));
        await zones.show({ id: 'zone-1' }, { client: clientWith(other.fetch) });
        expect(other.sent).toHaveLength(1);
        expect(configured.sent).toHaveLength(1);
    });

    test('stops a call when there is no client', () => {
        // A new process, because a test that runs first can call `configure`.
        const script =
            "import { zones } from './src/index.ts'; await zones.show({ id: 'zone-1' });";
        const run = Bun.spawnSync(['bun', '-e', script], { cwd: join(import.meta.dir, '..') });
        expect(run.exitCode).not.toBe(0);
        expect(run.stderr.toString()).toContain('configure() ran before this call');
    });
});
