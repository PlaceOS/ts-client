/**
 * Helpers for code that moves from v1, at `@placeos/ts-client/compat`. The migration tool uses
 * them.
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
import type { CallError, Reply } from './core/client.ts';
import { pageInfo } from './core/pagination.ts';
import type { Result } from './core/result.ts';

export * from './migrate/v1-enums.ts';

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

/** Gives the data and the totals of an index call, or throws `CallFailed`. */
export function orThrowPage<T>(result: Result<Reply<T>, CallError>): Page<T> {
    if (!result.ok) throw new CallFailed(result.error);
    const page = pageInfo(result.value.headers);
    return { data: result.value.data, total: page.total ?? 0, nextOffset: page.nextOffset };
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
