/**
 * Typed mocks of the API endpoints, at `@placeos/ts-client/mock`. A mock answers the calls of one
 * endpoint without a request. The compiler checks the name of the endpoint, the input that the
 * handler gets and the data that it gives:
 *
 * ```ts
 * import { configure, zones } from '@placeos/ts-client';
 * import { endpointMocks, mockEndpoint, respond } from '@placeos/ts-client/mock';
 *
 * configure({ base_url: '', auth: { kind: 'none' }, mock: endpointMocks });
 * mockEndpoint('zones.show', (input) => ({ id: input.id, name: 'Level 1' }));
 * mockEndpoint('zones.query', (input) => respond([{ id: 'zone-1' }], { total: 1 }));
 *
 * const result = await zones.show({ id: 'zone-1' }); // `ok`, with a `Zone`
 * ```
 *
 * - The client checks the input first, as for a request, so a mock finds the same input errors.
 * - The data can leave out fields. The client parses it with the response schema of the endpoint,
 *   and a missing required field gets its empty value, such as `''`, `0` or `[]`.
 * - `throw httpError(404)` in a handler gives an `http` error with that status.
 * - A call to an endpoint without a mock sends the request with the `fetch` of the client. Give
 *   `mockFetch` of `@placeos/ts-client/compat` to answer those from the 6.x mock endpoints.
 *
 * @module
 */
import { assert } from '../core/assert.ts';
import type { CallError, CallMock, MockAnswer, Reply } from '../core/client.ts';
import type { Result } from '../core/result.ts';
import type * as Operations from '../generated/operations/index.ts';
import type * as StaffOperations from '../generated/staff/operations/index.ts';

type Namespaces = typeof Operations;
type StaffNamespaces = typeof StaffOperations;

/** `<namespace>.<function>` for each function of the namespaces. */
type Names<T> = {
    [N in keyof T]: { [F in keyof T[N]]: `${N & string}.${F & string}` }[keyof T[N]];
}[keyof T];

/**
 * The name of each endpoint, such as `zones.show`. The staff API endpoints start with `staff.`,
 * such as `staff.bookings.query`.
 */
export type EndpointName = Names<Namespaces> | `staff.${Names<StaffNamespaces>}`;

type FunctionOf<T, K> = K extends `${infer N}.${infer F}`
    ? N extends keyof T
        ? F extends keyof T[N]
            ? T[N][F]
            : never
        : never
    : never;

/** The function of an endpoint, such as `zones.show` for `'zones.show'`. */
type EndpointFunction<K extends EndpointName> = K extends `staff.${infer S}`
    ? FunctionOf<StaffNamespaces, S>
    : FunctionOf<Namespaces, K>;

/** The input of an endpoint: its path and query parameters, and `body` if it has one. */
export type EndpointInput<K extends EndpointName> =
    EndpointFunction<K> extends (...args: infer A) => unknown ? NonNullable<A[0]> : never;

/** The data of a successful call of an endpoint, such as `Zone` for `zones.show`. */
export type EndpointData<K extends EndpointName> =
    EndpointFunction<K> extends (...args: never[]) => Promise<Result<Reply<infer D>, CallError>>
        ? D
        : never;

/**
 * Data that can leave out fields, at each level. An endpoint without a response schema gives text
 * or bytes: its mock can give a string, a `Uint8Array` or nothing, such as the mock of a `destroy`.
 * The type cannot tell a text endpoint from one with a `string()` schema, so both accept nothing.
 * For a `string()` schema, nothing gives a `response_invalid` error.
 */
export type MockData<T> = T extends Uint8Array
    ? Uint8Array | string | undefined
    : T extends string
      ? T | undefined
      : T extends readonly (infer E)[]
        ? readonly MockData<E>[]
        : T extends object
          ? { readonly [K in keyof T]?: MockData<T[K]> }
          : T;

const RESPONSE: unique symbol = Symbol('mock-response');

/** Data with a status or headers. Make one with `respond`. */
export interface MockResponse<T> {
    readonly [RESPONSE]: true;
    readonly data: T;
    readonly status: number;
    readonly headers: Readonly<Record<string, string>>;
}

export type MockHandler<K extends EndpointName> = (
    input: EndpointInput<K>,
) => MockResult<K> | Promise<MockResult<K>>;

type MockResult<K extends EndpointName> =
    MockData<EndpointData<K>> | MockResponse<MockData<EndpointData<K>>>;

export interface MockOptions {
    /** Milliseconds before the answer, to show the loading state of an app. The default is 0. */
    readonly delay_ms?: number;
}

/** More mocks is a leak, such as a test that adds mocks in a loop and never removes them. */
export const ENDPOINT_MOCKS_MAX = 10_000;

interface Entry {
    readonly handler: (input: Readonly<Record<string, unknown>>) => unknown;
    readonly delay_ms: number;
}

const mocks = new Map<string, Entry>();

/**
 * Answers the calls of an endpoint with `handler`. A new mock of the same endpoint replaces the
 * old one. Returns the function that removes the mock.
 */
export function mockEndpoint<K extends EndpointName>(
    name: K,
    handler: MockHandler<K>,
    options: MockOptions = {},
): () => void {
    assert(mocks.has(name) || mocks.size < ENDPOINT_MOCKS_MAX, 'fewer endpoint mocks');
    const delay_ms = options.delay_ms ?? 0;
    assert(Number.isSafeInteger(delay_ms) && delay_ms >= 0, 'delay_ms is a whole number');
    // The client gives the input of this endpoint, which the type of `handler` describes.
    const entry: Entry = {
        handler: (input) => Reflect.apply(handler, undefined, [input]),
        delay_ms,
    };
    mocks.set(name, entry);
    return () => {
        if (mocks.get(name) === entry) mocks.delete(name);
    };
}

/** Removes each endpoint mock. */
export function clearEndpointMocks(): void {
    mocks.clear();
}

/** Data with a status, headers, or the `X-Total-Count` and the next offset of a page. */
export function respond<T>(
    data: T,
    options: {
        readonly status?: number;
        readonly headers?: Readonly<Record<string, string>>;
        /** The number of items on all pages. `pageInfo` reads it. */
        readonly total?: number;
        /** The `offset` of the next page, in the `Link` header. `next()` of the reply uses it. */
        readonly next_offset?: number;
    } = {},
): MockResponse<T> {
    const headers: Record<string, string> = { ...options.headers };
    if (options.total !== undefined) headers['x-total-count'] = String(options.total);
    if (options.next_offset !== undefined) {
        assert(Number.isSafeInteger(options.next_offset) && options.next_offset > 0, 'an offset');
        headers['link'] = `<?offset=${options.next_offset}>; rel="next"`;
    }
    return { [RESPONSE]: true, data, status: options.status ?? 200, headers };
}

/** An error for a handler to throw: `throw httpError(404)` gives an `http` error with 404. */
export function httpError(status: number, message = `HTTP ${status}`): Error & { status: number } {
    assert(Number.isInteger(status) && status >= 400 && status <= 599, 'an error status');
    return Object.assign(new Error(message), { status });
}

/** The mock of the client: give it as `mock` to `configure` or `createClient`. */
export const endpointMocks: CallMock = ({ name, input }) => {
    const entry = mocks.get(name);
    if (entry === undefined) return null;
    return answer(entry, input);
};

async function answer(entry: Entry, input: Readonly<Record<string, unknown>>): Promise<MockAnswer> {
    if (entry.delay_ms > 0) await new Promise((resolve) => setTimeout(resolve, entry.delay_ms));
    let value: unknown;
    try {
        value = await entry.handler(input);
    } catch (error) {
        const status =
            typeof error === 'object' && error !== null ? Reflect.get(error, 'status') : null;
        // Another error is a bug in the test, so it goes to the caller.
        if (typeof status !== 'number') throw error;
        const message = error instanceof Error ? error.message : `HTTP ${status}`;
        return { status, headers: new Headers(), data: { error: message } };
    }
    if (isResponse(value)) {
        return { status: value.status, headers: new Headers(value.headers), data: value.data };
    }
    return { status: 200, headers: new Headers(), data: value };
}

function isResponse(value: unknown): value is MockResponse<unknown> {
    return typeof value === 'object' && value !== null && RESPONSE in value;
}
