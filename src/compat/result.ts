/**
 * The result helpers of `@placeos/ts-client/compat`.
 *
 * A 6.x function gives a promise that rejects on an error. `orThrow` does the same for a 7.x call:
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

/** The error of `orThrow`. `error` is the 7.x error. `status` is the HTTP status, as in 6.x. */
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

/** The page of a 6.x query function. */
export interface Page<T> {
    readonly data: T;
    /** The `X-Total-Count` header, or `0` without it, as in 6.x. */
    readonly total: number;
    /** Give it as the `offset` of the next call. `null` on the last page. */
    readonly next_offset: number | null;
    /**
     * Requests the next page, as in 6.x. `null` on the last page. The promise rejects on an error.
     * The function gives `null` when the link does not move the offset forward.
     */
    readonly next: (() => Promise<Page<T>> | null) | null;
}

/** A 7.x reply, with `next()` when the operation has pages. */
interface PagedReply<T> extends Reply<T> {
    next?(): Promise<Result<PagedReply<T>, CallError>> | null;
}

/** The 6.x type of a query function, such as `QueryResponse<PlaceZone>`. */
export type QueryResponse<T> = Promise<Page<T[]>>;

/**
 * Gives the data, the totals and `next` of a `query` call, as a 6.x query function did, or throws
 * `CallFailed`.
 */
export function orThrowPage<T>(result: Result<PagedReply<T>, CallError>): Page<T> {
    if (!result.ok) throw new CallFailed(result.error);
    const reply = result.value;
    const page = pageInfo(reply.headers);
    const next =
        reply.next === undefined || page.next_offset === null
            ? null
            : () => reply.next?.()?.then(orThrowPage) ?? null;
    return { data: reply.data, total: page.total ?? 0, next_offset: page.next_offset, next };
}

/**
 * A successful 7.x result with this data, for a test double of a 7.x call:
 *
 * ```ts
 * vi.mocked(zones.show).mockResolvedValue(mockReply(zone));
 * ```
 *
 * The reply has `next()`, which gives `null`, so it is also the last page of an operation with
 * pages, such as `settings.history`.
 */
export function mockReply<T>(
    data: T,
    status = 200,
): Result<Reply<T> & { next(): null }, CallError> {
    return { ok: true, value: { status, headers: new Headers(), data, next: () => null } };
}

/** The reply of `mockPage`. `next()` gives the next page, or `null` on the last page. */
export interface MockPage<T> extends Reply<T> {
    next(): Promise<Result<MockPage<T>, CallError>> | null;
}

/**
 * The 7.x result for a 6.x page, for a test double of a `query` call. `total` goes in the
 * `X-Total-Count` header, so `orThrowPage` gives it back. When the 6.x page has a `next` function,
 * `next()` of the reply calls it and gives the page that it returns. Then the `next` of
 * `orThrowPage` follows the pages, as in 6.x. Without it, the page is the last one.
 *
 * ```ts
 * vi.mocked(zones.query).mockResolvedValue(mockPage({ data: [zone], total: 1 }));
 * ```
 */
export function mockPage<T>(page: {
    readonly data: T;
    readonly total?: number;
    /** The `next` of a 6.x page: a function that gives the next page, or `null`. */
    readonly next?: unknown;
}): Result<MockPage<T>, CallError> {
    const reply = pageReply(page, 0);
    // The next pages come from a 6.x double, which has no types. The cast gives their data the
    // type of the first page, as `fromV1Mock` does.
    return reply as Result<MockPage<T>, CallError>;
}

/**
 * The 7.x result for a 6.x page `{ data, total, next }`. `read` is the number of items on the pages
 * before it, so the `Link` header gives the offset of the next page.
 */
function pageReply(page: unknown, read: number): Result<MockPage<unknown>, CallError> {
    const value = typeof page === 'object' && page !== null ? page : {};
    const data: unknown = Reflect.get(value, 'data');
    const total: unknown = Reflect.get(value, 'total');
    const more: unknown = Reflect.get(value, 'next');
    const offset = read + (Array.isArray(data) ? data.length : 0);
    const headers = new Headers();
    if (typeof total === 'number') headers.set('x-total-count', String(total));
    // `orThrowPage` gives a `next` only when the `Link` header has the next offset.
    if (typeof more === 'function') headers.set('link', `<?offset=${offset}>; rel="next"`);
    const next = (): Promise<Result<MockPage<unknown>, CallError>> | null => {
        if (typeof more !== 'function') return null;
        const following: unknown = Reflect.apply(more, value, []);
        if (following === null || following === undefined) return null;
        return Promise.resolve(following).then((next_page: unknown) =>
            pageReply(next_page, offset),
        );
    };
    return { ok: true, value: { status: 200, headers, data, next } };
}

/** In the arguments of `fromV1Mock`, the input values that no other argument has. */
export const REST = '...';

/**
 * A 7.x test double from the implementation of a 6.x test double. It calls `implementation` with
 * the 6.x arguments, and gives its value as a 7.x result. The migration tool writes these in the
 * `vi.mock` factories:
 *
 * ```ts
 * // 6.x: showZone: vi.fn((id, query) => Promise.resolve({ id })),
 * zones: { show: vi.fn(fromV1Mock((id, query) => Promise.resolve({ id }), ['id', '...'])) },
 * ```
 *
 * `args` gives the input key of each 6.x argument: `null` for none, and `'...'` for the other
 * values of the input, such as the query of `showZone`. An empty last argument is left out, as
 * the 6.x call left it out. `key` is for a 6.x function that selects a key of the data, such as the
 * `name` of `showMetadata`.
 *
 * Without an implementation, the data is `undefined`, as the value of a 6.x `vi.fn()` was.
 *
 * `R` is the result of the operation, from the place of the double, such as the
 * `mockImplementation` of `vi.mocked(zones.show)`. The 6.x implementation has no types, so the
 * data is what it gives, as with other mock data.
 */
export function fromV1Mock<R = Result<Reply<unknown>, CallError>>(
    implementation: ((...args: never[]) => unknown) | undefined,
    args: readonly (string | null)[],
    result: 'data' | 'page' = 'data',
    key?: string,
): (input?: Readonly<Record<string, unknown>>) => Promise<R> {
    const named = new Set(args.filter((arg) => arg !== null && arg !== REST));
    // An operation without a required parameter, such as `zones.query`, can have no input.
    return async (input = {}) => {
        const reply = await answer(input);
        return reply as R;
    };

    async function answer(
        input: Readonly<Record<string, unknown>>,
    ): Promise<Result<Reply<unknown>, CallError>> {
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
        return pageReply(value, 0);
    }
}

function describe(error: CallError): string {
    switch (error.kind) {
        case 'http':
            return `HTTP ${error.status}${error.message === null ? '' : `: ${error.message}`}`;
        case 'response_invalid':
            return `the response is not valid at ${error.path}: expected ${error.expected}`;
        case 'timeout':
            return `no response in ${error.timeout_ms} ms`;
        case 'network':
            return `network error: ${error.message}`;
        case 'response_too_large':
            return `the response is larger than ${error.bytes_max} bytes`;
        case 'auth_missing':
            return 'no token or credential';
        case 'aborted':
            return 'aborted';
    }
}
