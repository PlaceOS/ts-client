import { assert, unreachable } from './assert.ts';
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
    readonly baseUrl: string;
    readonly auth: Auth;
    /** Headers to add to each request. */
    readonly headers?: Readonly<Record<string, string>>;
    /** The default time limit of a request, from the start to the end of the response body. */
    readonly timeoutMs?: number;
    /** The maximum size of a response body. A larger body gives a `response_too_large` error. */
    readonly responseBytesMax?: number;
    readonly fetch?: FetchFunction;
}

/** The settings that each request uses. Make one with `createClient`. */
export interface Client {
    readonly baseUrl: string;
    readonly auth: Auth;
    readonly headers: Readonly<Record<string, string>>;
    readonly timeoutMs: number;
    readonly responseBytesMax: number;
    readonly fetch: FetchFunction;
}

export interface CallOptions {
    /** The client for this request. Without it, the call uses the client of `configure`. */
    readonly client?: Client;
    /** Cancels the request. */
    readonly signal?: AbortSignal;
    /** Replaces the `timeoutMs` of the client for this request. */
    readonly timeoutMs?: number;
}

/** A request that failed for an expected reason. Each kind is a different action for the caller. */
export type CallError =
    /** The auth had no token or credential. */
    | { readonly kind: 'auth_missing' }
    /** The `signal` of the caller cancelled the request. */
    | { readonly kind: 'aborted' }
    | { readonly kind: 'timeout'; readonly timeoutMs: number }
    /** The request did not get a response, for example because the network is down. */
    | { readonly kind: 'network'; readonly message: string }
    | { readonly kind: 'response_too_large'; readonly bytesMax: number }
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
    readonly pathKeys: readonly string[];
    readonly params: P;
    readonly body: B;
    readonly response: R;
}

export type AnyOperation = Operation<AnySchema, AnySchema | null, AnySchema | null>;

/** The input of an operation: the path and query parameters, and `body` if it has one. */
export type OperationInput<O> =
    O extends Operation<infer P, infer B, AnySchema | null>
        ? B extends AnySchema
            ? Simplify<Input<P> & { readonly body: Input<B> }>
            : Input<P>
        : never;

/** The data of a successful response of an operation. */
export type OperationData<O> =
    O extends Operation<AnySchema, AnySchema | null, infer R>
        ? R extends AnySchema
            ? Output<R>
            : Uint8Array
        : never;

export interface Reply<T> {
    readonly status: number;
    readonly headers: Headers;
    readonly data: T;
}

export type CallResult<O> = Result<Reply<OperationData<O>>, CallError>;

/** Checks the client settings once, so that each request can trust them. */
export function createClient(config: ClientConfig): Client {
    assert(!config.baseUrl.endsWith('/'), 'the baseUrl has no trailing slash');
    const timeoutMs = config.timeoutMs ?? TIMEOUT_MS_DEFAULT;
    assertPositiveInteger(timeoutMs, 'timeoutMs');
    const responseBytesMax = config.responseBytesMax ?? RESPONSE_BYTES_MAX_DEFAULT;
    assertPositiveInteger(responseBytesMax, 'responseBytesMax');
    if (config.auth.kind === 'api_key') {
        assert(config.auth.key.length > 0, 'the API key is not empty');
    }
    // A browser stops `fetch` with "Illegal invocation" when `this` is not the global object.
    const fetchFunction: FetchFunction =
        config.fetch ?? ((url, init) => globalThis.fetch(url, init));
    return Object.freeze({
        baseUrl: config.baseUrl,
        auth: config.auth,
        headers: Object.freeze({ ...config.headers }),
        timeoutMs,
        responseBytesMax,
        fetch: fetchFunction,
    });
}

/**
 * The client of `configure`. It is the one module state of the library, so that an application
 * does not give its client to each call.
 */
let configuredClient: Client | null = null;

/**
 * Makes the client that each call uses when its options have no `client`. Call it once, when the
 * application starts. A second call replaces the client.
 *
 * ```ts
 * configure({ baseUrl: '', auth: { kind: 'bearer', token: () => getToken() } });
 * const result = await zones.show({ id: 'zone-1234' });
 * ```
 */
export function configure(config: ClientConfig): Client {
    configuredClient = createClient(config);
    return configuredClient;
}

/** Defines an operation. It checks the definition when the module loads. */
export function operation<
    P extends AnySchema,
    B extends AnySchema | null,
    R extends AnySchema | null,
>(definition: Operation<P, B, R>): Operation<P, B, R> {
    assert(definition.path.startsWith('/'), 'the path starts with a slash');
    assert(definition.params.node.kind === 'object', 'the params schema is an object');
    const templateKeys = [...definition.path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
    assert(
        templateKeys.join() === definition.pathKeys.join(),
        `the path keys of ${definition.path} are in pathKeys`,
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
    const client = options.client ?? configuredClient;
    assert(client !== null, 'configure() ran before this call, or the options have a client');
    const result = await send(client, operation, input, options);
    // `send` parsed the data with `operation.response`, which gives `OperationData<O>` its type.
    return result as CallResult<O>;
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
    const paramsChecked = checkRequest(operation.params, params);
    assertValid(paramsChecked, `the parameters of ${operation.method} ${operation.path}`);
    assert(isRecord(paramsChecked.value), 'the checked parameters are an object');
    const url = buildUrl(client.baseUrl, operation, paramsChecked.value);
    let bodyText: string | null = null;
    if (operation.body === null) {
        assert(body === undefined, `${operation.method} ${operation.path} has no body`);
    } else {
        const bodyChecked = checkRequest(operation.body, body);
        assertValid(bodyChecked, `the body of ${operation.method} ${operation.path}`);
        bodyText = JSON.stringify(bodyChecked.value);
    }

    const timeoutMs = options.timeoutMs ?? client.timeoutMs;
    assertPositiveInteger(timeoutMs, 'timeoutMs');
    // One deadline for the call. The credential, a renewal and each fetch share it, so a slow
    // login cannot make the call take longer than `timeoutMs`.
    const deadlineMs = Date.now() + timeoutMs;
    const signal = options.signal;
    // Each attempt gets the credential again, because a `rejected` auth can renew it.
    let response: Fetched | null = null;
    for (let attempt = 0; attempt < AUTH_ATTEMPTS_MAX; attempt += 1) {
        const auth = client.auth;
        const credential = await waitWithin(() => resolveCredential(auth), deadlineMs, signal);
        if (!credential.ok) return limitError(credential.error, timeoutMs);
        if (credential.value === null) return { ok: false, error: { kind: 'auth_missing' } };
        const headers = new Headers(client.headers);
        headers.set('Accept', 'application/json');
        if (bodyText !== null) headers.set('Content-Type', 'application/json');
        setCredentialHeader(headers, credential.value);
        const init = { method: operation.method, headers, body: bodyText };
        const remainingMs = deadlineMs - Date.now();
        if (remainingMs <= 0) return { ok: false, error: { kind: 'timeout', timeoutMs } };
        const limits = {
            timeoutMs: remainingMs,
            bytesMax: client.responseBytesMax,
            ...(signal === undefined ? {} : { signal }),
        };
        const fetched = await fetchBody(client.fetch, url, init, limits);
        if (!fetched.ok) return limitError(fetched.error, timeoutMs);
        response = fetched.value;

        const status = response.status;
        if (client.auth.kind !== 'credential') break;
        if (status !== 401 && status !== 511) break;
        if (attempt + 1 >= AUTH_ATTEMPTS_MAX) break;
        const rejected = client.auth.rejected;
        const used = credential.value;
        const renewed = await waitWithin(() => rejected(status, used), deadlineMs, signal);
        if (!renewed.ok) return limitError(renewed.error, timeoutMs);
        if (!renewed.value) break;
    }
    assert(response !== null, 'the request was sent');

    if (!response.ok) {
        const parsed = decodeJson(response.bytes);
        let errorBody: JsonValue | null = null;
        if (parsed.ok) {
            const body = parseResponse(json(), parsed.value);
            if (body.ok) errorBody = body.value;
        }
        let message: string | null = null;
        if (isRecord(errorBody) && typeof errorBody['error'] === 'string') {
            message = errorBody['error'];
        }
        return {
            ok: false,
            error: { kind: 'http', status: response.status, message, body: errorBody },
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
    const data = parseResponse(operation.response, parsed.value);
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
    baseUrl: string,
    operation: AnyOperation,
    params: Readonly<Record<string, unknown>>,
): string {
    let path = operation.path;
    for (const key of operation.pathKeys) {
        const text = queryScalar(params[key]);
        // An empty segment sends the request to a different endpoint, such as the collection.
        assert(text.length > 0, `the path parameter "${key}" is not empty`);
        path = path.replace(`{${key}}`, () => encodeURIComponent(text));
    }

    const node = operation.params.node;
    assert(node.kind === 'object', 'the params schema is an object');
    const query = new URLSearchParams();
    for (const field of node.fields) {
        if (operation.pathKeys.includes(field.key)) continue;
        const value = params[field.key];
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
            const items: readonly unknown[] = value;
            query.append(field.key, items.map(queryScalar).join(','));
        } else {
            query.append(field.key, queryScalar(value));
        }
    }
    const queryText = query.toString();
    if (queryText.length === 0) return `${baseUrl}${path}`;
    return `${baseUrl}${path}?${queryText}`;
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
    readonly timeoutMs: number;
    readonly bytesMax: number;
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
    assertPositiveInteger(limits.timeoutMs, 'timeoutMs');
    assertPositiveInteger(limits.bytesMax, 'bytesMax');
    // The caller can cancel while an earlier step waits, such as the credential of the auth.
    if (isAborted(limits.signal)) return { ok: false, error: { kind: 'aborted' } };
    const timeoutSignal = AbortSignal.timeout(limits.timeoutMs);
    const signal =
        limits.signal === undefined
            ? timeoutSignal
            : AbortSignal.any([limits.signal, timeoutSignal]);
    let response: Response;
    let bytes: Result<Uint8Array, 'too_large'>;
    try {
        response = await fetchFunction(url, { ...init, signal });
        bytes = await readBody(response, limits.bytesMax);
    } catch (error) {
        if (isAborted(limits.signal)) return { ok: false, error: { kind: 'aborted' } };
        if (timeoutSignal.aborted) {
            return { ok: false, error: { kind: 'timeout', timeoutMs: limits.timeoutMs } };
        }
        const message = error instanceof Error ? error.message : String(error);
        return { ok: false, error: { kind: 'network', message } };
    }
    if (!bytes.ok) {
        return { ok: false, error: { kind: 'response_too_large', bytesMax: limits.bytesMax } };
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
 * Starts `work`, and waits for it until `deadlineMs` or until `signal` cancels. The work itself
 * goes on, because it can be shared, such as one renewal of the auth for many calls.
 *
 * It starts the work only after the checks, so a cancelled call starts no work, and no promise is
 * left without a handler.
 */
async function waitWithin<T>(
    work: () => Promise<T>,
    deadlineMs: number,
    signal: AbortSignal | undefined,
): Promise<Result<T, 'aborted' | 'timeout'>> {
    if (isAborted(signal)) return { ok: false, error: 'aborted' };
    const remainingMs = deadlineMs - Date.now();
    if (remainingMs <= 0) return { ok: false, error: 'timeout' };
    const promise = work();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let onAbort: (() => void) | undefined;
    const stopped = new Promise<Result<T, 'aborted' | 'timeout'>>((resolve) => {
        timer = setTimeout(() => resolve({ ok: false, error: 'timeout' }), remainingMs);
        onAbort = () => resolve({ ok: false, error: 'aborted' });
        signal?.addEventListener('abort', onAbort, { once: true });
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
    timeoutMs: number,
): { readonly ok: false; readonly error: FetchError } {
    if (error === 'aborted') return { ok: false, error: { kind: 'aborted' } };
    if (error === 'timeout') return { ok: false, error: { kind: 'timeout', timeoutMs } };
    if (error.kind === 'timeout') return { ok: false, error: { kind: 'timeout', timeoutMs } };
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

/** Reads the body, but stops at `bytesMax` bytes. The caller converts a throw to a value. */
async function readBody(
    response: Response,
    bytesMax: number,
): Promise<Result<Uint8Array, 'too_large'>> {
    const lengthText = response.headers.get('content-length');
    if (lengthText !== null) {
        const length = Number(lengthText);
        if (Number.isSafeInteger(length) && length > bytesMax) {
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
        if (size > bytesMax) {
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
