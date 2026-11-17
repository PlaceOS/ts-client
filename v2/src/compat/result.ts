/**
 * The result helpers of `@placeos/ts-client/compat`.
 *
 * A v1 function gives a promise that rejects on an error. `orThrow` does the same for a v2 call:
 *
 * ```ts
 * const zone = await zones.show({ id }).then(orThrow);
 * ```
 *
 * New code checks the `Result`. Then the compiler shows each error that a call can give.
 *
 * @module
 */
import type { CallError, Reply } from '../core/client.ts';
import { pageInfo } from '../core/pagination.ts';
import type { Result } from '../core/result.ts';

/** The error of `orThrow`. `error` is the v2 error. `status` is the HTTP status, as in v1. */
export class CallFailed extends Error {
    readonly error: CallError;
    readonly status: number | null;

    constructor(error: CallError) {
        super(describe(error));
        this.name = 'CallFailed';
        this.error = error;
        this.status =
            error.kind === 'http' || error.kind === 'response_invalid' ? error.status : null;
    }
}

/** Gives the data of a call, or throws `CallFailed`. */
export function orThrow<T>(result: Result<Reply<T>, CallError>): T {
    if (!result.ok) throw new CallFailed(result.error);
    return result.value.data;
}

/** The page of a v1 query function. v1 also gave `next`. v2 gives `nextOffset`. */
export interface Page<T> {
    readonly data: T;
    /** The `X-Total-Count` header, or `0` without it, as in v1. */
    readonly total: number;
    /** Give it as the `offset` of the next call. `null` on the last page. */
    readonly nextOffset: number | null;
}

/** The v1 type of a query function, such as `QueryResponse<PlaceZone>`. */
export type QueryResponse<T> = Promise<Page<T[]>>;

/** Gives the data and the totals of a `query` call, or throws `CallFailed`. */
export function orThrowPage<T>(result: Result<Reply<T>, CallError>): Page<T> {
    if (!result.ok) throw new CallFailed(result.error);
    const page = pageInfo(result.value.headers);
    return { data: result.value.data, total: page.total ?? 0, nextOffset: page.nextOffset };
}

/**
 * A successful v2 result with this data, for a test double of a v2 call:
 *
 * ```ts
 * vi.mocked(zones.show).mockResolvedValue(mockReply(zone));
 * ```
 */
export function mockReply<T>(data: T, status = 200): Result<Reply<T>, CallError> {
    return { ok: true, value: { status, headers: new Headers(), data } };
}

/**
 * The v2 result for a v1 page, for a test double of a `query` call. `total` goes in the
 * `X-Total-Count` header, so `orThrowPage` gives it back.
 *
 * ```ts
 * vi.mocked(zones.query).mockResolvedValue(mockPage({ data: [zone], total: 1 }));
 * ```
 */
export function mockPage<T>(page: {
    readonly data: T;
    readonly total?: number;
    /** The `next` of a v1 page. v2 has no use for it. */
    readonly next?: unknown;
}): Result<Reply<T>, CallError> {
    const headers = new Headers();
    if (page.total !== undefined) headers.set('x-total-count', String(page.total));
    return { ok: true, value: { status: 200, headers, data: page.data } };
}

/** In the arguments of `fromV1Mock`, the input values that no other argument has. */
export const REST = '...';

/**
 * A v2 test double from the implementation of a v1 test double. It calls `implementation` with
 * the v1 arguments, and gives its value as a v2 result. The migration tool writes these in the
 * `vi.mock` factories:
 *
 * ```ts
 * // v1: showZone: vi.fn((id, query) => Promise.resolve({ id })),
 * zones: { show: vi.fn(fromV1Mock((id, query) => Promise.resolve({ id }), ['id', '...'])) },
 * ```
 *
 * `args` gives the input key of each v1 argument: `null` for none, and `'...'` for the other
 * values of the input, such as the query of `showZone`. An empty last argument is left out, as
 * the v1 call left it out. `key` is for a v1 function that selects a key of the data, such as the
 * `name` of `showMetadata`.
 *
 * Without an implementation, the data is `undefined`, as the value of a v1 `vi.fn()` was.
 */
export function fromV1Mock(
    implementation: ((...args: never[]) => unknown) | undefined,
    args: readonly (string | null)[],
    result: 'data' | 'page' = 'data',
    key?: string,
): (input: Readonly<Record<string, unknown>>) => Promise<Result<Reply<unknown>, CallError>> {
    const named = new Set(args.filter((arg) => arg !== null && arg !== REST));
    return async (input) => {
        const values = args.map((arg) => {
            if (arg === null) return undefined;
            if (arg !== REST) return input[arg];
            const rest = Object.entries(input).filter(
                ([name, value]) => !named.has(name) && value !== undefined,
            );
            return rest.length === 0 ? undefined : Object.fromEntries(rest);
        });
        while (values.length > 0 && values.at(-1) === undefined) values.pop();
        const value: unknown =
            implementation === undefined
                ? undefined
                : await Reflect.apply(implementation, undefined, values);
        if (key !== undefined) return mockReply({ [String(input[key])]: value });
        if (result === 'data') return mockReply(value);
        // A v1 page is `{ data, total, next }`.
        const page = typeof value === 'object' && value !== null ? value : {};
        const total: unknown = Reflect.get(page, 'total');
        const data: unknown = Reflect.get(page, 'data');
        return mockPage(typeof total === 'number' ? { data, total } : { data });
    };
}

function describe(error: CallError): string {
    switch (error.kind) {
        case 'http':
            return `HTTP ${error.status}${error.message === null ? '' : `: ${error.message}`}`;
        case 'response_invalid':
            return `the response is not valid at ${error.path}: expected ${error.expected}`;
        case 'timeout':
            return `no response in ${error.timeoutMs} ms`;
        case 'network':
            return `network error: ${error.message}`;
        case 'response_too_large':
            return `the response is larger than ${error.bytesMax} bytes`;
        case 'auth_missing':
            return 'no token or credential';
        case 'aborted':
            return 'aborted';
    }
}
