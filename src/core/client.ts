import { assert, unreachable } from './assert.ts';
import { scopedLog, type LogFunction } from './log.ts';
import { pageInfo } from './pagination.ts';
import type { Result } from './result.ts';
import {
    checkRequest,
    isRecord,
    json,
    parseResponse,
    type AnySchema,
    type Input,
    type JsonValue,
    type Output,
    type SchemaError,
    type Simplify,
} from './schema.ts';

export const TIMEOUT_MS_DEFAULT = 30_000;
export const RESPONSE_BYTES_MAX_DEFAULT = 64 * 1024 * 1024;
/** A stream can send empty chunks. This stops a read loop that does not get closer to the end. */
export const RESPONSE_READS_MAX = 1 << 20;
/** A `credential` auth can renew after a 401 or a 511. The request then goes again one time. */
export const AUTH_ATTEMPTS_MAX = 2;

/** Sends the requests. It has the signature of the global `fetch`, so a test can replace it. */
export type FetchFunction = (url: string, init: RequestInit) => Promise<Response>;

/** What one request sends to tell the server who it is. */
export type Credential =
    | { readonly kind: 'none' }
    /** Sends `Authorization: Bearer <token>`. */
    | { readonly kind: 'bearer'; readonly token: string }
    /** Sends `X-API-Key: <key>`. */
    | { readonly kind: 'api_key'; readonly key: string };

/** How the client tells the server who it is. */
export type Auth =
    | { readonly kind: 'none' }
    /**
     * Sends `Authorization: Bearer <token>`. The client calls `token` before each request, so the
     * application can refresh the token. `null` means that no token is available.
     */
    | { readonly kind: 'bearer'; readonly token: () => string | null | Promise<string | null> }
    /** Sends `X-API-Key: <key>`. */
    | { readonly kind: 'api_key'; readonly key: string }
    /**
     * Asks `credential` before each request. `null` means that no credential is available. After a
     * 401 or a 511, the client calls `rejected` with the status and the credential that the server
     * rejected. If it returns `true`, the client sends the request again, one time.
     * `createAuthSession` makes this auth.
     */
    | {
          readonly kind: 'credential';
          readonly credential: () => Promise<Credential | null>;
          readonly rejected: (status: 401 | 511, credential: Credential) => Promise<boolean>;
      };

export interface ClientConfig {
    /** The origin of the server, for example `https://placeos.example.com`. `''` is this origin. */
    readonly base_url: string;
    readonly auth: Auth;
    /** Headers to add to each request. */
    readonly headers?: Readonly<Record<string, string>>;
    /** The default time limit of a request, from the start to the end of the response body. */
    readonly timeout_ms?: number;
    /** The maximum size of a response body. A larger body gives a `response_too_large` error. */
    readonly response_bytes_max?: number;
    readonly fetch?: FetchFunction;
    /**
     * `zero` fills a missing required field of a response with its empty value, such as `''`.
     * Only for mock data, such as the mock endpoints of `@placeos/ts-client/compat`.
     */
    readonly missing_fields?: 'error' | 'zero';
    /**
     * Answers calls without a request, for tests and a mock mode. `@placeos/ts-client/mock` has
     * one with a typed handler for each endpoint.
     */
    readonly mock?: CallMock;
    /** Gets a debug log entry for each call. See `LogFunction`. */
    readonly log?: LogFunction;
}

/**
 * Gives the answer to a call, or `null` to send the request. The client parses the data with the
 * response schema of the operation, as it parses a response of the server. A missing required
 * field gets its empty value.
 */
export type CallMock = (call: {
    readonly name: string;
    readonly input: Readonly<Record<string, unknown>>;
}) => Promise<MockAnswer> | null;

export interface MockAnswer {
    readonly status: number;
    readonly headers: Headers;
    /** The JSON data, or the bytes for an operation without a response schema. */
    readonly data: unknown;
}

/** The settings that each request uses. Make one with `createClient`. */
export interface Client {
    readonly base_url: string;
    readonly auth: Auth;
    readonly headers: Readonly<Record<string, string>>;
    readonly timeout_ms: number;
    readonly response_bytes_max: number;
    readonly fetch: FetchFunction;
    readonly missing_fields: 'error' | 'zero';
    readonly mock: CallMock | null;
    readonly log: LogFunction | null;
}

export interface CallOptions {
    /** The client for this request. Without it, the call uses the client of `configure`. */
    readonly client?: Client;
    /** Cancels the request. */
    readonly signal?: AbortSignal;
    /** Replaces the `timeout_ms` of the client for this request. */
    readonly timeout_ms?: number;
}

/** A request that failed for an expected reason. Each kind is a different action for the caller. */
export type CallError =
    /** The auth had no token or credential. */
    | { readonly kind: 'auth_missing' }
    /** The `signal` of the caller cancelled the request. */
    | { readonly kind: 'aborted' }
    | { readonly kind: 'timeout'; readonly timeout_ms: number }
    /** The request did not get a response, for example because the network is down. */
    | { readonly kind: 'network'; readonly message: string }
    | { readonly kind: 'response_too_large'; readonly bytes_max: number }
    /** The server sent a status that is not 2xx. `message` is the `error` field of the body. */
    | {
          readonly kind: 'http';
          readonly status: number;
          readonly message: string | null;
          readonly body: JsonValue | null;
      }
    /** The server sent a 2xx body that does not match the schema of the operation. */
    | {
          readonly kind: 'response_invalid';
          readonly status: number;
          readonly path: string;
          readonly expected: string;
      };

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * One endpoint of the API, as data. The generated functions call `call` with an operation.
 *
 * `params` is an object schema with the path parameters and the query parameters. `response` is
 * `null` when the API document gives no schema for the body. The data is then the raw bytes.
 */
export interface Operation<
    P extends AnySchema,
    B extends AnySchema | null,
    R extends AnySchema | null,
> {
    readonly method: HttpMethod;
    /** The path template, for example `/api/engine/v2/zones/{id}`. */
    readonly path: string;
    readonly path_keys: readonly string[];
    readonly params: P;
    readonly body: B;
    readonly response: R;
    /** The namespace and the function, for example `zones.show`. */
    readonly name: string;
    /**
     * The query name of a parameter that has another key in the input. A query parameter named
     * `body` is an example, because `body` of the input is the request body.
     */
    readonly wire_names?: Readonly<Record<string, string>>;
}

export type AnyOperation = Operation<AnySchema, AnySchema | null, AnySchema | null>;

/**
 * The input of an operation: the path and query parameters, and `body` if it has one.
 *
 * The `null` check is first, and on a tuple. Without `strictNullChecks`, `null extends AnySchema`
 * is true, so the order `B extends AnySchema` would ask for a body on each operation.
 */
export type OperationInput<O> =
    O extends Operation<infer P, infer B, AnySchema | null>
        ? [B] extends [null]
            ? Input<P>
            : B extends AnySchema
              ? Simplify<Input<P> & { readonly body: Input<B> }>
              : never
        : never;

/** The data of a successful response of an operation. The `null` check is first, as above. */
export type OperationData<O> =
    O extends Operation<AnySchema, AnySchema | null, infer R>
        ? [R] extends [null]
            ? Uint8Array
            : R extends AnySchema
              ? Output<R>
              : never
        : never;

export interface Reply<T> {
    readonly status: number;
    readonly headers: Headers;
    readonly data: T;
}

/**
 * The reply of an operation with an `offset` parameter, such as `zones.query`: one page of a list.
 *
 * ```ts
 * let result = await zones.query({ limit: 100 });
 * while (result.ok) {
 *     show(result.value.data);
 *     const next = result.value.next();
 *     if (next === null) break;
 *     result = await next;
 * }
 * ```
 */
export interface PageReply<O, T> extends Reply<T> {
    /**
     * Requests the next page: the same input with the `offset` of the `Link` header, through the
     * same client. `options` replace the options of the first call. `null` on the last page, and
     * when the offset does not move forward, so that a loop over the pages ends.
     */
    next(options?: CallOptions): Promise<CallResult<O>> | null;
}

/** The reply of an operation: a `PageReply` when the operation has an `offset` parameter. */
export type OperationReply<O> = 'offset' extends keyof OperationInput<O>
    ? PageReply<O, OperationData<O>>
    : Reply<OperationData<O>>;

export type CallResult<O> = Result<OperationReply<O>, CallError>;

/** Checks the client settings once, so that each request can trust them. */
export function createClient(config: ClientConfig): Client {
    assert(!config.base_url.endsWith('/'), 'the base_url has no trailing slash');
    const timeout_ms = config.timeout_ms ?? TIMEOUT_MS_DEFAULT;
    assertPositiveInteger(timeout_ms, 'timeout_ms');
    const response_bytes_max = config.response_bytes_max ?? RESPONSE_BYTES_MAX_DEFAULT;
    assertPositiveInteger(response_bytes_max, 'response_bytes_max');
    if (config.auth.kind === 'api_key') {
        assert(config.auth.key.length > 0, 'the API key is not empty');
    }
    // A browser stops `fetch` with "Illegal invocation" when `this` is not the global object.
    const fetchFunction: FetchFunction =
        config.fetch ?? ((url, init) => globalThis.fetch(url, init));
    return Object.freeze({
        base_url: config.base_url,
        auth: config.auth,
        headers: Object.freeze({ ...config.headers }),
        timeout_ms,
        response_bytes_max,
        fetch: fetchFunction,
        missing_fields: config.missing_fields ?? 'error',
        mock: config.mock ?? null,
        log: config.log ?? null,
    });
}

/**
 * The client of `configure`, so that an application does not give its client to each call. It is
 * the one module state of the core. The mock registries of `compat` and `mock` are the others.
 */
let configured_client: Client | null = null;

/**
 * Makes the client that each call uses when its options have no `client`. Call it once, when the
 * application starts. A second call replaces the client.
 *
 * ```ts
 * configure({ base_url: '', auth: { kind: 'bearer', token: () => getToken() } });
 * const result = await zones.show({ id: 'zone-1234' });
 * ```
 */
export function configure(config: ClientConfig): Client {
    configured_client = createClient(config);
    return configured_client;
}

/** Defines an operation. It checks the definition when the module loads. */
export function operation<
    P extends AnySchema,
    B extends AnySchema | null,
    R extends AnySchema | null,
>(definition: Operation<P, B, R>): Operation<P, B, R> {
    assert(definition.path.startsWith('/'), 'the path starts with a slash');
    // `staff.` is the prefix of the staff API.
    assert(/^(staff\.)?\w+\.\w+$/.test(definition.name), 'the name is <namespace>.<function>');
    assert(definition.params.node.kind === 'object', 'the params schema is an object');
    // `[^{}]` cannot match a brace, so the match is linear also for a path with many braces.
    const template_keys = [...definition.path.matchAll(/\{([^{}]+)\}/g)].map((match) => match[1]);
    assert(
        template_keys.join() === definition.path_keys.join(),
        `the path keys of ${definition.path} are in path_keys`,
    );
    return definition;
}

/**
 * Sends a request for `operation` and parses the response.
 *
 * An expected failure, such as a network error, is in the result. An input that does not match the
 * schema is a programmer error, and the call throws. A call without a client, from `options` or
 * from `configure`, is also a programmer error.
 */
export async function call<O extends AnyOperation>(
    operation: O,
    input: OperationInput<O>,
    options: CallOptions = {},
): Promise<CallResult<O>> {
    // Read the client before the first `await`, so the whole request uses one client.
    const client = options.client ?? configured_client;
    assert(client !== null, 'configure() ran before this call, or the options have a client');
    const result = await request(client, operation, input, options);
    // `send` parsed the data with `operation.response`, which gives `OperationData<O>` its type.
    // `paged` gives the reply a `next` when `OperationReply<O>` is a `PageReply`.
    return result as CallResult<O>;
}

/** A reply before `call` gives it the types of its operation. */
interface RawPage extends Reply<unknown> {
    next(options?: CallOptions): Promise<RawResult> | null;
}
type RawResult = Result<Reply<unknown> | RawPage, CallError>;

/** Sends the request. The reply of an operation with an `offset` parameter gets `next`. */
async function request(
    client: Client,
    operation: AnyOperation,
    input: unknown,
    options: CallOptions,
): Promise<RawResult> {
    const started_ms = Date.now();
    const sent = await send(client, operation, input, options);
    logOutcome(client, operation, sent, Date.now() - started_ms);
    if (!sent.ok || !paged(operation)) return sent;
    const reply = sent.value;
    const next = (next_options: CallOptions = {}) =>
        nextPage(client, operation, input, reply.headers, { ...options, ...next_options });
    return { ok: true, value: { ...reply, next } };
}

/** The status or the error of a call, without its input or data. */
function logOutcome(
    client: Client,
    operation: AnyOperation,
    result: Result<Reply<unknown>, CallError>,
    duration_ms: number,
): void {
    if (client.log === null) return;
    const log = scopedLog('http', { sink: client.log });
    const call_data = { name: operation.name, method: operation.method, duration_ms };
    if (result.ok) {
        const status = result.value.status;
        log.debug(`${operation.name}: ${status} in ${duration_ms} ms`, { ...call_data, status });
        return;
    }
    const error = result.error;
    const status = error.kind === 'http' ? ` ${error.status}` : '';
    const message = `${operation.name}: ${error.kind}${status} in ${duration_ms} ms`;
    // The caller sent the abort: debug. The server answered: a warning. No answer, such as a
    // timeout: an error.
    if (error.kind === 'aborted') log.debug(message, { ...call_data, error });
    else if (error.kind === 'http') log.warn(message, { ...call_data, error });
    else log.error(message, { ...call_data, error });
}

/** `true` when the operation has an `offset` parameter, so that its reply is a page. */
function paged(operation: AnyOperation): boolean {
    const node = operation.params.node;
    return node.kind === 'object' && node.keys.has('offset');
}

/** The request of the next page, or `null` when the `Link` header has no offset after this one. */
function nextPage(
    client: Client,
    operation: AnyOperation,
    input: unknown,
    headers: Headers,
    options: CallOptions,
): Promise<RawResult> | null {
    assert(isRecord(input), 'the input is an object');
    const next_offset = pageInfo(headers).next_offset;
    if (next_offset === null) return null;
    const offset = typeof input['offset'] === 'number' ? input['offset'] : 0;
    // A link back to this page or an earlier one would make a loop over the pages endless.
    if (next_offset <= offset) return null;
    return request(options.client ?? client, operation, { ...input, offset: next_offset }, options);
}

async function send(
    client: Client,
    operation: AnyOperation,
    input: unknown,
    options: CallOptions,
): Promise<Result<Reply<unknown>, CallError>> {
    assert(isRecord(input), 'the input is an object');
    const { body, ...params } = input;

    // Check the data immediately before it leaves the program, as a pair to the response parse.
    const params_checked = checkRequest(operation.params, params);
    assertValid(params_checked, `the parameters of ${operation.method} ${operation.path}`);
    assert(isRecord(params_checked.value), 'the checked parameters are an object');
    const url = buildUrl(client.base_url, operation, params_checked.value);
    let body_text: string | null = null;
    if (operation.body === null) {
        assert(body === undefined, `${operation.method} ${operation.path} has no body`);
    } else {
        const body_checked = checkRequest(operation.body, body);
        assertValid(body_checked, `the body of ${operation.method} ${operation.path}`);
        body_text = JSON.stringify(body_checked.value);
    }

    const timeout_ms = options.timeout_ms ?? client.timeout_ms;
    assertPositiveInteger(timeout_ms, 'timeout_ms');
    // One deadline for the call. The credential, a renewal and each fetch share it, so a slow
    // login cannot make the call take longer than `timeout_ms`.
    const deadline_ms = Date.now() + timeout_ms;
    const signal = options.signal;

    // A mock gets the input after the checks, so a test finds the same errors as the server. Its
    // answer has the same limits as a response: the deadline, the signal and the size. It starts
    // in `waitWithin`, so that an aborted call does not leave its promise without a handler.
    const mock = client.mock;
    if (mock !== null) {
        const answered = await waitWithin(
            () => Promise.resolve(mock({ name: operation.name, input })),
            deadline_ms,
            signal,
        );
        if (!answered.ok) return limitError(answered.error, timeout_ms);
        // `null`: the mock does not answer this call, so the request goes to the server.
        if (answered.value !== null) {
            scopedLog('http', { sink: client.log }).debug(
                `${operation.name}: answered by the mock`,
            );
            return mockResult(operation, answered.value, client.response_bytes_max);
        }
    }
    // Each attempt gets the credential again, because a `rejected` auth can renew it.
    let response: Fetched | null = null;
    for (let attempt = 0; attempt < AUTH_ATTEMPTS_MAX; attempt += 1) {
        const auth = client.auth;
        const credential = await waitWithin(() => resolveCredential(auth), deadline_ms, signal);
        if (!credential.ok) return limitError(credential.error, timeout_ms);
        if (credential.value === null) return { ok: false, error: { kind: 'auth_missing' } };
        const headers = new Headers(client.headers);
        headers.set('Accept', 'application/json');
        if (body_text !== null) headers.set('Content-Type', 'application/json');
        setCredentialHeader(headers, credential.value);
        // On a redirect to another origin, `fetch` removes `Authorization` but keeps `X-API-Key`.
        // So with an API key, a redirect is a `network` error. The API has no redirect operations.
        const redirect: RequestRedirect = credential.value.kind === 'api_key' ? 'error' : 'follow';
        const init = { method: operation.method, headers, body: body_text, redirect };
        const remaining_ms = deadline_ms - Date.now();
        if (remaining_ms <= 0) return { ok: false, error: { kind: 'timeout', timeout_ms } };
        const limits = {
            timeout_ms: remaining_ms,
            bytes_max: client.response_bytes_max,
            ...(signal === undefined ? {} : { signal }),
        };
        const fetched = await fetchBody(client.fetch, url, init, limits);
        if (!fetched.ok) return limitError(fetched.error, timeout_ms);
        response = fetched.value;

        const status = response.status;
        if (client.auth.kind !== 'credential') break;
        if (status !== 401 && status !== 511) break;
        if (attempt + 1 >= AUTH_ATTEMPTS_MAX) break;
        const rejected = client.auth.rejected;
        const used = credential.value;
        const log = scopedLog('http', { sink: client.log });
        log.info(`${operation.name}: ${status}, renewing the credential`);
        const renewed = await waitWithin(() => rejected(status, used), deadline_ms, signal);
        if (!renewed.ok) return limitError(renewed.error, timeout_ms);
        if (!renewed.value) break;
    }
    assert(response !== null, 'the request was sent');

    if (!response.ok) {
        const parsed = decodeJson(response.bytes);
        let error_body: JsonValue | null = null;
        if (parsed.ok) {
            const body = parseResponse(json(), parsed.value);
            if (body.ok) error_body = body.value;
        }
        let message: string | null = null;
        if (isRecord(error_body) && typeof error_body['error'] === 'string') {
            message = error_body['error'];
        }
        return {
            ok: false,
            error: { kind: 'http', status: response.status, message, body: error_body },
        };
    }

    const reply = { status: response.status, headers: response.headers };
    if (operation.response === null) return { ok: true, value: { ...reply, data: response.bytes } };
    const parsed = decodeJson(response.bytes);
    if (!parsed.ok) {
        return {
            ok: false,
            error: { kind: 'response_invalid', status: reply.status, path: '$', expected: 'JSON' },
        };
    }
    const data = parseResponse(operation.response, parsed.value, {
        missing_fields: client.missing_fields,
    });
    if (!data.ok) {
        return {
            ok: false,
            error: { kind: 'response_invalid', status: reply.status, ...data.error },
        };
    }
    return { ok: true, value: { ...reply, data: data.value } };
}

/** The result of a mock answer. The data goes through JSON, as the data of a response does. */
function mockResult(
    operation: AnyOperation,
    answer: MockAnswer,
    bytes_max: number,
): Result<Reply<unknown>, CallError> {
    const reply = { status: answer.status, headers: answer.headers };
    const bytes =
        answer.data instanceof Uint8Array
            ? answer.data
            : new TextEncoder().encode(
                  typeof answer.data === 'string' && operation.response === null
                      ? answer.data
                      : (JSON.stringify(answer.data) ?? 'null'),
              );
    if (bytes.length > bytes_max) {
        return { ok: false, error: { kind: 'response_too_large', bytes_max } };
    }
    if (answer.status < 200 || answer.status > 299) {
        const parsed = decodeJson(bytes);
        const body = parsed.ok ? parseResponse(json(), parsed.value) : null;
        const error_body = body !== null && body.ok ? body.value : null;
        const message =
            isRecord(error_body) && typeof error_body['error'] === 'string'
                ? error_body['error']
                : null;
        return {
            ok: false,
            error: { kind: 'http', status: answer.status, message, body: error_body },
        };
    }
    if (operation.response === null) return { ok: true, value: { ...reply, data: bytes } };
    const parsed = decodeJson(bytes);
    if (!parsed.ok) {
        return {
            ok: false,
            error: { kind: 'response_invalid', status: reply.status, path: '$', expected: 'JSON' },
        };
    }
    const data = parseResponse(operation.response, parsed.value, { missing_fields: 'zero' });
    if (!data.ok) {
        return {
            ok: false,
            error: { kind: 'response_invalid', status: reply.status, ...data.error },
        };
    }
    return { ok: true, value: { ...reply, data: data.value } };
}

/**
 * Puts the path parameters in the path template and the other parameters in the query string.
 *
 * The server reads an array parameter as one comma-separated value, so items must not contain
 * commas.
 */
function buildUrl(
    base_url: string,
    operation: AnyOperation,
    params: Readonly<Record<string, unknown>>,
): string {
    let path = operation.path;
    for (const key of operation.path_keys) {
        const text = queryScalar(params[key]);
        // An empty segment sends the request to a different endpoint, such as the collection.
        // `encodeURIComponent` keeps dots, and URL parsing removes `.` and `..` segments.
        assert(text.length > 0, `the path parameter "${key}" is not empty`);
        assert(text !== '.' && text !== '..', `the path parameter "${key}" is not . or ..`);
        path = path.replace(`{${key}}`, () => encodeURIComponent(text));
    }

    const node = operation.params.node;
    assert(node.kind === 'object', 'the params schema is an object');
    const query = new URLSearchParams();
    for (const field of node.fields) {
        if (operation.path_keys.includes(field.key)) continue;
        const value = params[field.key];
        if (value === undefined || value === null) continue;
        const name = operation.wire_names?.[field.key] ?? field.key;
        if (Array.isArray(value)) {
            const items: readonly unknown[] = value;
            query.append(name, items.map(queryScalar).join(','));
        } else {
            query.append(name, queryScalar(value));
        }
    }
    const query_text = query.toString();
    if (query_text.length === 0) return `${base_url}${path}`;
    return `${base_url}${path}?${query_text}`;
}

function queryScalar(value: unknown): string {
    if (typeof value === 'string') return value;
    assert(
        typeof value === 'number' || typeof value === 'boolean',
        'a parameter is a string, a number or a boolean',
    );
    return String(value);
}

/** The response of `fetchBody`, with the whole body. */
export interface Fetched {
    readonly status: number;
    readonly ok: boolean;
    readonly headers: Headers;
    readonly bytes: Uint8Array;
}

/** The errors of `fetchBody`. These are the errors of the transport, not of the server. */
export type FetchError = Extract<
    CallError,
    { readonly kind: 'aborted' | 'timeout' | 'network' | 'response_too_large' }
>;

export interface FetchLimits {
    readonly timeout_ms: number;
    readonly bytes_max: number;
    readonly signal?: AbortSignal;
}

/**
 * Sends one request and reads the whole body, in the time and size limits. `fetch` and the body
 * stream throw for operating errors, and this converts them to values.
 *
 * The client and the auth session use it. The generated functions use `call`.
 */
export async function fetchBody(
    fetchFunction: FetchFunction,
    url: string,
    init: Omit<RequestInit, 'signal'>,
    limits: FetchLimits,
): Promise<Result<Fetched, FetchError>> {
    assertPositiveInteger(limits.timeout_ms, 'timeout_ms');
    assertPositiveInteger(limits.bytes_max, 'bytes_max');
    // The caller can cancel while an earlier step waits, such as the credential of the auth.
    if (isAborted(limits.signal)) return { ok: false, error: { kind: 'aborted' } };
    const timeout_signal = AbortSignal.timeout(limits.timeout_ms);
    const signal =
        limits.signal === undefined
            ? timeout_signal
            : AbortSignal.any([limits.signal, timeout_signal]);
    let response: Response;
    let bytes: Result<Uint8Array, 'too_large'>;
    try {
        response = await fetchFunction(url, { ...init, signal });
        bytes = await readBody(response, limits.bytes_max);
    } catch (error) {
        if (isAborted(limits.signal)) return { ok: false, error: { kind: 'aborted' } };
        if (timeout_signal.aborted) {
            return { ok: false, error: { kind: 'timeout', timeout_ms: limits.timeout_ms } };
        }
        const message = error instanceof Error ? error.message : String(error);
        return { ok: false, error: { kind: 'network', message } };
    }
    if (!bytes.ok) {
        return { ok: false, error: { kind: 'response_too_large', bytes_max: limits.bytes_max } };
    }
    return {
        ok: true,
        value: {
            status: response.status,
            ok: response.ok,
            headers: response.headers,
            bytes: bytes.value,
        },
    };
}

/**
 * Starts `work`, and waits for it until `deadline_ms` or until `signal` cancels. The work itself
 * goes on, because it can be shared, such as one renewal of the auth for many calls.
 *
 * It starts the work only after the checks, so a cancelled call starts no work, and no promise is
 * left without a handler.
 */
async function waitWithin<T>(
    work: () => Promise<T>,
    deadline_ms: number,
    signal: AbortSignal | undefined,
): Promise<Result<T, 'aborted' | 'timeout'>> {
    if (isAborted(signal)) return { ok: false, error: 'aborted' };
    const remaining_ms = deadline_ms - Date.now();
    if (remaining_ms <= 0) return { ok: false, error: 'timeout' };
    const promise = work();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let onAbort: (() => void) | undefined;
    const stopped = new Promise<Result<T, 'aborted' | 'timeout'>>((resolve) => {
        timer = setTimeout(() => resolve({ ok: false, error: 'timeout' }), remaining_ms);
        onAbort = () => resolve({ ok: false, error: 'aborted' });
        signal?.addEventListener('abort', onAbort, { once: true });
        // `work` can abort the signal before the listener exists, such as a mock of a test.
        if (isAborted(signal)) resolve({ ok: false, error: 'aborted' });
    });
    const settled = promise.then((value): Result<T, 'aborted' | 'timeout'> => ({
        ok: true,
        value,
    }));
    try {
        return await Promise.race([settled, stopped]);
    } finally {
        clearTimeout(timer);
        if (onAbort !== undefined) signal?.removeEventListener('abort', onAbort);
    }
}

/** A limit of the whole call. The error gives the time limit of the call, not of one step. */
function limitError(
    error: FetchError | 'aborted' | 'timeout',
    timeout_ms: number,
): { readonly ok: false; readonly error: FetchError } {
    if (error === 'aborted') return { ok: false, error: { kind: 'aborted' } };
    if (error === 'timeout') return { ok: false, error: { kind: 'timeout', timeout_ms } };
    if (error.kind === 'timeout') return { ok: false, error: { kind: 'timeout', timeout_ms } };
    return { ok: false, error };
}

/**
 * Reads the state of the signal now. The compiler keeps a narrowed `signal.aborted` across an
 * `await`, but the value can change while the code waits.
 */
function isAborted(signal: AbortSignal | undefined): boolean {
    return signal?.aborted === true;
}

/** The credential that `auth` gives now, or `null`. The client and the realtime client use it. */
export async function resolveCredential(auth: Auth): Promise<Credential | null> {
    switch (auth.kind) {
        case 'none':
            return { kind: 'none' };
        case 'bearer': {
            const token = await auth.token();
            return token === null ? null : { kind: 'bearer', token };
        }
        case 'api_key':
            return { kind: 'api_key', key: auth.key };
        case 'credential':
            return auth.credential();
        default:
            return unreachable(auth);
    }
}

function setCredentialHeader(headers: Headers, credential: Credential): void {
    switch (credential.kind) {
        case 'none':
            return;
        case 'bearer':
            headers.set('Authorization', `Bearer ${credential.token}`);
            return;
        case 'api_key':
            headers.set('X-API-Key', credential.key);
            return;
        default:
            unreachable(credential);
    }
}

/** Reads the body, but stops at `bytes_max` bytes. The caller converts a throw to a value. */
async function readBody(
    response: Response,
    bytes_max: number,
): Promise<Result<Uint8Array, 'too_large'>> {
    const length_text = response.headers.get('content-length');
    if (length_text !== null) {
        const length = Number(length_text);
        if (Number.isSafeInteger(length) && length > bytes_max) {
            await response.body?.cancel();
            return { ok: false, error: 'too_large' };
        }
    }
    if (response.body === null) return { ok: true, value: new Uint8Array(0) };

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    for (let read = 0; read < RESPONSE_READS_MAX; read += 1) {
        const chunk = await reader.read();
        if (chunk.done) {
            const bytes = new Uint8Array(size);
            let offset = 0;
            for (const part of chunks) {
                bytes.set(part, offset);
                offset += part.byteLength;
            }
            assert(offset === size, 'the chunks fill the body');
            return { ok: true, value: bytes };
        }
        size += chunk.value.byteLength;
        if (size > bytes_max) {
            await reader.cancel();
            return { ok: false, error: 'too_large' };
        }
        chunks.push(chunk.value);
    }
    await reader.cancel();
    return { ok: false, error: 'too_large' };
}

/** `JSON.parse` throws on bad input. This converts the exception to a value. */
export function decodeJson(bytes: Uint8Array): Result<unknown, 'json_invalid'> {
    try {
        return { ok: true, value: JSON.parse(new TextDecoder().decode(bytes)) };
    } catch {
        return { ok: false, error: 'json_invalid' };
    }
}

function assertValid<T>(
    result: Result<T, SchemaError>,
    subject: string,
): asserts result is { readonly ok: true; readonly value: T } {
    if (result.ok) return;
    assert(false, `${subject} match the schema. At ${result.error.path}: ${result.error.expected}`);
}

function assertPositiveInteger(value: number, name: string): void {
    assert(Number.isSafeInteger(value), `${name} is an integer`);
    assert(value > 0, `${name} is more than zero`);
}
