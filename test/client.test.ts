/**
 * Goal: `call` sends what the server expects, and converts each failure to the correct error.
 * Method: replace `fetch` with a function that records the request and returns a fixed response.
 */
import type { LogEntry } from '../src/core/log.ts';
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
        base_url: 'https://placeos.test',
        auth: { kind: 'none' },
        fetch,
        ...config,
    });
}

const Item = object({ id: string(), name: nullable(string()) }, ['id']);

const UPDATE = operation({
    method: 'PATCH',
    path: '/api/items/{id}',
    path_keys: ['id'],
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
    name: 'items.update',
});

const DOWNLOAD = operation({
    method: 'GET',
    path: '/api/download',
    path_keys: [],
    params: parameters({}),
    body: null,
    response: 'bytes',
    name: 'items.download',
});

const LOGS = operation({ ...DOWNLOAD, response: 'text', name: 'items.logs' });

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

    test('gives the body as text, or as bytes, when the operation has no response schema', async () => {
        const { fetch } = fakeFetch(() => new Response('line 1\nline 2'));
        const text = await call(LOGS, {}, { client: clientWith(fetch) });
        const data: string | null = text.ok ? text.value.data : null;
        expect(data).toBe('line 1\nline 2');
        const binary = fakeFetch(() => new Response(new Uint8Array([0xff, 0, 1])));
        const bytes = await call(DOWNLOAD, {}, { client: clientWith(binary.fetch) });
        expect(bytes.ok && [...bytes.value.data]).toEqual([0xff, 0, 1]);
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

    test('does not send the API key to the target of a redirect', async () => {
        const target = Bun.serve({
            port: 0,
            fetch: (request) => new Response(request.headers.get('x-api-key') ?? 'no key'),
        });
        const server = Bun.serve({
            port: 0,
            fetch: () => Response.redirect(`http://127.0.0.1:${target.port}/`, 302),
        });
        try {
            const client = createClient({
                base_url: `http://localhost:${server.port}`,
                auth: { kind: 'api_key', key: 'key-1' },
            });
            const result = await call(DOWNLOAD, {}, { client });
            expect(result.ok ? 'followed' : result.error.kind).toBe('network');
        } finally {
            await Promise.all([server.stop(true), target.stop(true)]);
        }
    });

    test('throws on input that does not match the schema, before it sends', async () => {
        const { fetch, sent } = fakeFetch(() => new Response(''));
        const client = clientWith(fetch);
        // A variable with an extra field passes the type check. Only the run time check sees it.
        const typo = { id: 'item-1', limt: 5, body: {} };
        await expect(call(UPDATE, typo, { client })).rejects.toThrow(
            'At $.limt: no field with this name',
        );
        await expect(call(UPDATE, { id: '', body: {} }, { client })).rejects.toThrow(
            'the path parameter "id" is not empty',
        );
        await expect(call(UPDATE, { id: '..', body: {} }, { client })).rejects.toThrow(
            'the path parameter "id" is not . or ..',
        );
        expect(sent).toHaveLength(0);
    });
});

const LIST = operation({
    method: 'GET',
    path: '/api/items',
    path_keys: [],
    params: parameters({ q: string(), limit: integer('UInt32'), offset: integer('UInt32') }),
    body: null,
    response: array(Item),
    name: 'items.query',
});

/** A page of the list. `next` is the offset of the `Link` header, or no header. */
function pageResponse(ids: readonly string[], next: number | null): Response {
    const response = jsonResponse(ids.map((id) => ({ id })));
    if (next !== null) response.headers.set('link', `</api/items?offset=${next}>; rel="next"`);
    return response;
}

describe('log', () => {
    test('gives the name and the status or error of each call, and no token or body', async () => {
        const entries: LogEntry[] = [];
        const { fetch } = fakeFetch((init) =>
            init.method === 'PATCH' ? jsonResponse({ id: 'item-1' }) : jsonResponse({}, 404),
        );
        const client = clientWith(fetch, {
            auth: { kind: 'bearer', token: () => 'secret-token' },
            log: (entry) => entries.push(entry),
        });
        await call(UPDATE, { id: 'item-1', body: { name: 'Lobby' } }, { client });
        await call(DOWNLOAD, {}, { client });
        const lines = entries.map((entry) => `${entry.level} ${entry.args[0]}`);
        expect(lines.map((line) => line.replace(/\d+ ms/, 'N ms'))).toEqual([
            'debug items.update: 200 in N ms',
            'warn items.download: http 404 in N ms',
        ]);
        expect(entries[0]?.args[1]).toMatchObject({ name: 'items.update', method: 'PATCH' });
        const text = JSON.stringify(entries);
        expect(text).not.toContain('secret-token');
        expect(text).not.toContain('Lobby');
    });
});

describe('pages', () => {
    test('next() asks for the next offset with the same input and client, to the last page', async () => {
        const pages = new Map([
            [0, pageResponse(['a', 'b'], 2)],
            [2, pageResponse(['c'], null)],
        ]);
        const urls: string[] = [];
        const client = clientWith(async (url) => {
            urls.push(url);
            const offset = Number(new URL(url).searchParams.get('offset') ?? 0);
            return pages.get(offset) ?? jsonResponse([], 404);
        });
        const first = await call(LIST, { q: 'lobby', limit: 2 }, { client });
        if (!first.ok) throw new Error('the first page is ok');
        const second = await first.value.next();
        expect(second?.ok && second.value.data.map((item) => item.id)).toEqual(['c']);
        expect(urls).toEqual([
            'https://placeos.test/api/items?q=lobby&limit=2',
            'https://placeos.test/api/items?q=lobby&limit=2&offset=2',
        ]);
        expect(second?.ok && second.value.next()).toBeNull();
    });

    test('a link to this offset or an earlier one ends the pages, so a loop ends', async () => {
        const back = clientWith(async () => pageResponse(['a'], 4));
        const page = await call(LIST, { offset: 4 }, { client: back });
        expect(page.ok && page.value.next()).toBeNull();
    });

    test('an operation without an offset has no next()', async () => {
        const { fetch } = fakeFetch(() => jsonResponse({ id: 'item-1' }));
        const result = await call(
            UPDATE,
            { id: 'item-1', body: {} },
            { client: clientWith(fetch) },
        );
        if (!result.ok) throw new Error('the call is ok');
        expect('next' in result.value).toBe(false);
        // @ts-expect-error `UPDATE` has no `offset`, so its reply is not a page.
        expect(result.value.next).toBeUndefined();
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

    test('gives null for a 204, which only a nullable response accepts', async () => {
        const empty = fakeFetch(() => new Response(null, { status: 204 }));
        const client = clientWith(empty.fetch);
        const LIST = operation({
            ...DOWNLOAD,
            response: nullable(array(Item)),
            name: 'items.list',
        });
        const list = await call(LIST, {}, { client });
        expect(list.ok ? list.value.data : list.error).toBeNull();
        const update = await call(UPDATE, { id: 'item-1', body: {} }, { client });
        expect(update.ok ? null : update.error.kind).toBe('response_invalid');
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
        const client = clientWith(hang, { timeout_ms: 20 });
        expect(await call(DOWNLOAD, {}, { client })).toEqual({
            ok: false,
            error: { kind: 'timeout', timeout_ms: 20 },
        });
        const controller = new AbortController();
        const pending = call(
            DOWNLOAD,
            {},
            { client, signal: controller.signal, timeout_ms: 5_000 },
        );
        controller.abort();
        expect(await pending).toEqual({ ok: false, error: { kind: 'aborted' } });
    });

    test('the time limit and the cancel also cover the wait for the credential', async () => {
        const { fetch, sent } = fakeFetch(() => new Response(''));
        // A credential that is slow, such as a login that renews the token.
        const slow = new Promise<string>((resolve) => setTimeout(() => resolve('abc'), 200));
        const client = clientWith(fetch, { auth: { kind: 'bearer', token: () => slow } });
        expect(await call(DOWNLOAD, {}, { client, timeout_ms: 20 })).toEqual({
            ok: false,
            error: { kind: 'timeout', timeout_ms: 20 },
        });
        const controller = new AbortController();
        const pending = call(
            DOWNLOAD,
            {},
            { client, signal: controller.signal, timeout_ms: 5_000 },
        );
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

    test('stops at response_bytes_max, with or without a content-length', async () => {
        const too_large = {
            ok: false,
            error: { kind: 'response_too_large', bytes_max: 8 },
        } as const;
        const declared = fakeFetch(() => new Response('0123456789'));
        expect(
            await call(
                DOWNLOAD,
                {},
                { client: clientWith(declared.fetch, { response_bytes_max: 8 }) },
            ),
        ).toEqual(too_large);
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
                { client: clientWith(streamed.fetch, { response_bytes_max: 8 }) },
            ),
        ).toEqual(too_large);
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
            base_url: 'https://configured.test',
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
