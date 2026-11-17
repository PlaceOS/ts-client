import { assert, unreachable } from './assert.ts';
import type { Result } from './result.ts';

/**
 * Schemas describe the data of the API. Each schema is plain data that `parseResponse` and
 * `checkRequest` interpret. The TypeScript types come from the schema with `Output` and `Input`,
 * so the shape is written one time only.
 *
 * ```ts
 * const Zone = object({ id: string(), name: nullable(string()) }, ['id']);
 * type Zone = Output<typeof Zone>; // { readonly id: string; readonly name: string | null }
 * ```
 */

/** The schema tree is generated, so its depth is small. This catches a cycle by mistake. */
export const SCHEMA_DEPTH_MAX = 64;
/** The limits of a value for `json()`. They also stop the check on a value with a cycle. */
export const JSON_DEPTH_MAX = 256;
export const JSON_NODES_MAX = 1_000_000;

/** Any value that `JSON.parse` can return. */
export type JsonValue =
    null | boolean | number | string | readonly JsonValue[] | { readonly [key: string]: JsonValue };

/** The integer formats of the API, and the range of each one. */
export const INTEGER_RANGES = {
    Int32: { min: -(2 ** 31), max: 2 ** 31 - 1 },
    UInt32: { min: 0, max: 2 ** 32 - 1 },
    Int64: { min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER },
} as const;

export type IntegerFormat = keyof typeof INTEGER_RANGES;

/** A node of the schema tree. The parser interprets it. */
export type SchemaNode =
    | { readonly kind: 'string' }
    | { readonly kind: 'literal'; readonly values: ReadonlySet<string | number> }
    | { readonly kind: 'integer'; readonly min: number; readonly max: number }
    | { readonly kind: 'number' }
    | { readonly kind: 'boolean' }
    | { readonly kind: 'json' }
    | { readonly kind: 'nullable'; readonly inner: SchemaNode }
    | { readonly kind: 'array'; readonly items: SchemaNode }
    | { readonly kind: 'tuple'; readonly items: readonly SchemaNode[] }
    | { readonly kind: 'record'; readonly values: SchemaNode }
    | {
          readonly kind: 'object';
          readonly fields: readonly ObjectField[];
          readonly keys: ReadonlySet<string>;
      }
    | { readonly kind: 'union'; readonly variants: readonly SchemaNode[] };

export interface ObjectField {
    readonly key: string;
    readonly node: SchemaNode;
    /** The parser fails on a response without this field. */
    readonly requiredInResponse: boolean;
    /** The check fails on a request without this field. */
    readonly requiredInRequest: boolean;
}

/**
 * A schema: a node for the parser, and the types for the compiler.
 *
 * `O` is the type of data that comes from the server. `I` is the type of data that you send.
 */
export interface Schema<O, I = O> {
    readonly node: SchemaNode;
    /** Only for the compiler. It has no value at run time. */
    readonly '~types'?: { readonly output: O; readonly input: I };
}

export type AnySchema = Schema<unknown, unknown>;

/** The type of the data that `parseResponse` returns for a schema. */
export type Output<S> = S extends Schema<infer O, unknown> ? O : never;

/** The type of the data that you give to a request for a schema. */
export type Input<S> = S extends Schema<unknown, infer I> ? I : never;

/** Shows an intersection as one object type in editor hovers. */
export type Simplify<T> = { [K in keyof T]: T[K] } & {};

/** Where a parse failed, as a path such as `$.items[3].name`, and what the parser expected. */
export interface SchemaError {
    readonly path: string;
    readonly expected: string;
}

export function string(): Schema<string> {
    return { node: { kind: 'string' } };
}

/** A string or number that must be one of `values`. */
export function literal<const V extends readonly (string | number)[]>(
    values: V,
): Schema<V[number]> {
    assert(values.length > 0, 'a literal schema has at least one value');
    return { node: { kind: 'literal', values: new Set(values) } };
}

/** An integer in the range of `format`. All formats stay in the safe range of `number`. */
export function integer(format: IntegerFormat = 'Int64'): Schema<number> {
    const range = INTEGER_RANGES[format];
    return { node: { kind: 'integer', min: range.min, max: range.max } };
}

/** A finite number. */
export function number(): Schema<number> {
    return { node: { kind: 'number' } };
}

export function boolean(): Schema<boolean> {
    return { node: { kind: 'boolean' } };
}

/**
 * Any JSON value: `null`, a boolean, a finite number, a string, an array or a plain object. The
 * parser checks the value, but does not copy it.
 */
export function json(): Schema<JsonValue> {
    return { node: { kind: 'json' } };
}

export function nullable<O, I>(inner: Schema<O, I>): Schema<O | null, I | null> {
    return { node: { kind: 'nullable', inner: inner.node } };
}

export function array<O, I>(items: Schema<O, I>): Schema<readonly O[], readonly I[]> {
    return { node: { kind: 'array', items: items.node } };
}

/** An array with a fixed length, and a schema for each position. */
export function tuple<const V extends readonly AnySchema[]>(
    items: V,
): Schema<{ readonly [K in keyof V]: Output<V[K]> }, { readonly [K in keyof V]: Input<V[K]> }> {
    assert(items.length > 0, 'a tuple has at least one item');
    return { node: { kind: 'tuple', items: items.map((item) => item.node) } };
}

/** An object with keys that are not known before run time. Each value has the same schema. */
export function record<O, I>(
    values: Schema<O, I>,
): Schema<Readonly<Record<string, O>>, Readonly<Record<string, I>>> {
    return { node: { kind: 'record', values: values.node } };
}

type Fields = { readonly [key: string]: AnySchema };

/**
 * In a response, a field that is not in `required` can be missing. The parser sets it to `null`,
 * so each field of the output is always present.
 */
type ObjectOutput<F extends Fields, R extends keyof F> = {
    readonly [K in keyof F]: K extends R ? Output<F[K]> : Output<F[K]> | null;
};

/** In a request, a field that is not in `R` is optional. */
type ObjectInput<F extends Fields, R extends keyof F> = Simplify<
    { readonly [K in keyof F as K extends R ? K : never]: Input<F[K]> } & {
        readonly [K in keyof F as K extends R ? never : K]?: Input<F[K]>;
    }
>;

/**
 * An object with known fields. The parser drops the fields of a response that it does not know.
 *
 * `required` lists the fields that the server always sends. In a request each field is optional,
 * because the API document does not say which fields the server needs: a field that the server
 * always sends can have a default when it reads a request. The server checks the request.
 */
export function object<F extends Fields, const R extends keyof F & string = never>(
    fields: F,
    required: readonly R[] = [],
): Schema<ObjectOutput<F, R>, ObjectInput<F, never>> {
    return { node: objectNode(fields, new Set(required), new Set()) };
}

/**
 * The path and query parameters of an operation. Unlike `object`, the `required` fields are also
 * required in a request, because the document says which parameters the server needs.
 */
export function parameters<F extends Fields, const R extends keyof F & string = never>(
    fields: F,
    required: readonly R[] = [],
): Schema<ObjectOutput<F, R>, ObjectInput<F, R>> {
    const requiredKeys = new Set<string>(required);
    return { node: objectNode(fields, requiredKeys, requiredKeys) };
}

function objectNode(
    fields: Fields,
    requiredInResponse: ReadonlySet<string>,
    requiredInRequest: ReadonlySet<string>,
): SchemaNode {
    const list: ObjectField[] = [];
    for (const [key, schema] of Object.entries(fields)) {
        // An assignment to `__proto__` changes the prototype instead of a field.
        assert(key !== '__proto__', 'a field is not named __proto__');
        list.push({
            key,
            node: schema.node,
            requiredInResponse: requiredInResponse.has(key),
            requiredInRequest: requiredInRequest.has(key),
        });
    }
    for (const key of [...requiredInResponse, ...requiredInRequest]) {
        assert(Object.hasOwn(fields, key), `the required key "${key}" is a field`);
    }
    return { kind: 'object', fields: list, keys: new Set(Object.keys(fields)) };
}

/**
 * A value that matches one of `variants`. The parser tries each variant in sequence and returns
 * the first match, so put the most specific variant first.
 */
export function union<const V extends readonly AnySchema[]>(
    variants: V,
): Schema<Output<V[number]>, Input<V[number]>> {
    assert(variants.length > 1, 'a union has two variants or more');
    return { node: { kind: 'union', variants: variants.map((variant) => variant.node) } };
}

/**
 * Parses data that comes from the server. Use it on each value from outside the program.
 *
 * The output is a new value. It has each field of the schema, in the order of the schema, and no
 * other fields.
 */
export function parseResponse<O, I>(
    schema: Schema<O, I>,
    value: unknown,
    options: ParseOptions = {},
): Result<O, SchemaError> {
    const failure: Failure = { expected: '', segments: [] };
    const direction = options.missingFields === 'zero' ? 'response_zero' : 'response';
    const parsed = walk(schema.node, value, direction, failure, 0);
    if (parsed === FAIL) return { ok: false, error: describeFailure(failure) };
    // The walk built `parsed` from the same nodes that give `O` its shape. This is one of the two
    // places where the compiler must trust the parser. The tests check the parser.
    return { ok: true, value: parsed as O };
}

/**
 * Checks data immediately before it goes to the server. The types check it at compile time, and
 * this checks it at run time, for callers that pass data the types do not describe.
 *
 * It does not accept fields that the schema does not know. Optional fields stay missing.
 */
export function checkRequest<O, I>(schema: Schema<O, I>, value: I): Result<I, SchemaError> {
    const failure: Failure = { expected: '', segments: [] };
    const checked = walk(schema.node, value, 'request', failure, 0);
    if (checked === FAIL) return { ok: false, error: describeFailure(failure) };
    // See `parseResponse`.
    return { ok: true, value: checked as I };
}

/** True for a value that has string keys: an object that is not `null` and not an array. */
export function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export interface ParseOptions {
    /**
     * `error` (the default): a missing required field is an error. `zero`: it gets the empty value
     * of its type, such as `''`, `0` or `[]`, as the v1 classes did. Only for mock data, which
     * often has only some of the fields.
     */
    readonly missingFields?: 'error' | 'zero';
}

/** `response_zero` is a `response` that fills the missing required fields. */
type Direction = 'response' | 'response_zero' | 'request';

/** The parser records a failure here. Each level adds its path segment as the failure returns. */
interface Failure {
    expected: string;
    segments: string[];
}

const FAIL: unique symbol = Symbol('schema-fail');

/**
 * Interprets `node` on `value`. It returns the clean value, or `FAIL` and records the reason.
 *
 * The recursion follows the schema, not the data, so the schema sets its depth.
 */
function walk(
    node: SchemaNode,
    value: unknown,
    direction: Direction,
    failure: Failure,
    depth: number,
): unknown {
    assert(depth < SCHEMA_DEPTH_MAX, 'the schema depth is less than SCHEMA_DEPTH_MAX');
    switch (node.kind) {
        case 'string':
            if (typeof value === 'string') return value;
            return fail(failure, 'string');
        case 'literal':
            if (typeof value === 'string' || typeof value === 'number') {
                if (node.values.has(value)) return value;
            }
            return fail(failure, `one of ${[...node.values].map(String).join(', ')}`);
        case 'integer':
            if (typeof value === 'number' && Number.isSafeInteger(value)) {
                if (value >= node.min && value <= node.max) return value;
            }
            return fail(failure, `integer from ${node.min} to ${node.max}`);
        case 'number':
            if (typeof value === 'number' && Number.isFinite(value)) return value;
            return fail(failure, 'finite number');
        case 'boolean':
            if (typeof value === 'boolean') return value;
            return fail(failure, 'boolean');
        case 'json':
            // `JSON.stringify` changes other values without an error, such as `NaN` to `null`.
            if (!isJsonValue(value)) return fail(failure, 'JSON value');
            return value;
        case 'nullable':
            if (value === null) return null;
            return walk(node.inner, value, direction, failure, depth + 1);
        case 'array': {
            if (!Array.isArray(value)) return fail(failure, 'array');
            const items: readonly unknown[] = value;
            const output: unknown[] = [];
            for (let index = 0; index < items.length; index += 1) {
                const item = walk(node.items, items[index], direction, failure, depth + 1);
                if (item === FAIL) {
                    failure.segments.push(`[${index}]`);
                    return FAIL;
                }
                output.push(item);
            }
            return output;
        }
        case 'tuple': {
            if (!Array.isArray(value)) return fail(failure, 'array');
            const items: readonly unknown[] = value;
            if (items.length !== node.items.length) {
                return fail(failure, `array of length ${node.items.length}`);
            }
            const output: unknown[] = [];
            for (let index = 0; index < node.items.length; index += 1) {
                const itemNode = node.items[index];
                assert(itemNode !== undefined, 'the index is in the tuple');
                const item = walk(itemNode, items[index], direction, failure, depth + 1);
                if (item === FAIL) {
                    failure.segments.push(`[${index}]`);
                    return FAIL;
                }
                output.push(item);
            }
            return output;
        }
        case 'record': {
            if (!isRecord(value)) return fail(failure, 'object');
            const entries: [string, unknown][] = [];
            for (const key of Object.keys(value)) {
                const entryValue = value[key];
                if (entryValue === undefined) {
                    assert(direction === 'request', 'JSON has no undefined values');
                    continue;
                }
                const entry = walk(node.values, entryValue, direction, failure, depth + 1);
                if (entry === FAIL) {
                    failure.segments.push(`.${key}`);
                    return FAIL;
                }
                entries.push([key, entry]);
            }
            // `fromEntries` defines each key as a field, also a key such as `__proto__`.
            return Object.fromEntries(entries);
        }
        case 'object': {
            if (!isRecord(value)) return fail(failure, 'object');
            const output: Record<string, unknown> = {};
            for (const field of node.fields) {
                const fieldValue = Object.hasOwn(value, field.key) ? value[field.key] : undefined;
                if (fieldValue === undefined) {
                    const required =
                        direction === 'request'
                            ? field.requiredInRequest
                            : field.requiredInResponse;
                    if (required && direction === 'response_zero') {
                        output[field.key] = zeroValue(field.node, depth + 1);
                        continue;
                    }
                    if (required) {
                        failure.segments.push(`.${field.key}`);
                        return fail(failure, 'a value for the required field');
                    }
                    // A response has each field. A request leaves an optional field missing,
                    // because the server reads a missing field and `null` differently.
                    if (direction !== 'request') output[field.key] = null;
                    continue;
                }
                const parsed = walk(field.node, fieldValue, direction, failure, depth + 1);
                if (parsed === FAIL) {
                    failure.segments.push(`.${field.key}`);
                    return FAIL;
                }
                output[field.key] = parsed;
            }
            if (direction === 'request') {
                for (const key of Object.keys(value)) {
                    if (node.keys.has(key)) continue;
                    if (value[key] === undefined) continue;
                    failure.segments.push(`.${key}`);
                    return fail(failure, 'no field with this name');
                }
            }
            return output;
        }
        case 'union': {
            if (direction !== 'response_zero') {
                for (const variant of node.variants) {
                    const parsed = walk(variant, value, direction, failure, depth + 1);
                    if (parsed !== FAIL) return parsed;
                    failure.segments.length = 0;
                }
                return fail(failure, 'a match for one variant of the union');
            }
            // Zero-fill can make each variant match. The variant that knows the most of the given
            // fields wins, so that the fill does not drop them. In a tie, a variant that matches
            // without the fill wins, then the first.
            let best: unknown = FAIL;
            let bestScore = -1;
            for (const variant of node.variants) {
                const parsed = walk(variant, value, direction, failure, depth + 1);
                failure.segments.length = 0;
                if (parsed === FAIL) continue;
                const strict = walk(variant, value, 'response', failure, depth + 1) !== FAIL;
                failure.segments.length = 0;
                const score = knownKeys(variant, value) * 2 + (strict ? 1 : 0);
                if (score > bestScore) {
                    best = parsed;
                    bestScore = score;
                }
            }
            if (best !== FAIL) return best;
            return fail(failure, 'a match for one variant of the union');
        }
        default:
            return unreachable(node);
    }
}

/** The number of keys of `value` that an object schema has. Other schemas know none. */
function knownKeys(node: SchemaNode, value: unknown): number {
    if (node.kind !== 'object' || !isRecord(value)) return 0;
    return Object.keys(value).filter((key) => node.keys.has(key)).length;
}

/** The empty value of a schema, for a missing required field of mock data. */
function zeroValue(node: SchemaNode, depth: number): unknown {
    assert(depth < SCHEMA_DEPTH_MAX, 'the schema depth is less than SCHEMA_DEPTH_MAX');
    switch (node.kind) {
        case 'string':
            return '';
        case 'literal':
            return [...node.values][0] ?? null;
        case 'integer':
            return Math.min(Math.max(0, node.min), node.max);
        case 'number':
            return 0;
        case 'boolean':
            return false;
        case 'json':
        case 'nullable':
            return null;
        case 'array':
            return [];
        case 'tuple':
            return node.items.map((item) => zeroValue(item, depth + 1));
        case 'record':
            return {};
        case 'object': {
            const output: Record<string, unknown> = {};
            for (const field of node.fields) {
                output[field.key] = field.requiredInResponse
                    ? zeroValue(field.node, depth + 1)
                    : null;
            }
            return output;
        }
        case 'union': {
            const [first] = node.variants;
            return first === undefined ? null : zeroValue(first, depth + 1);
        }
    }
}

/** True if `JSON.stringify` writes `value` as it is. The walk has its own bounded stack. */
function isJsonValue(value: unknown): boolean {
    const stack: { readonly value: unknown; readonly depth: number }[] = [{ value, depth: 0 }];
    for (let visited = 0; visited < JSON_NODES_MAX; visited += 1) {
        const top = stack.pop();
        if (top === undefined) return true;
        const current = top.value;
        if (current === null || typeof current === 'string' || typeof current === 'boolean') {
            continue;
        }
        if (typeof current === 'number') {
            if (Number.isFinite(current)) continue;
            return false;
        }
        if (top.depth >= JSON_DEPTH_MAX) return false;
        if (Array.isArray(current)) {
            const items: readonly unknown[] = current;
            // Check the budget before the push, so a huge array does not fill the memory first.
            if (visited + stack.length + items.length >= JSON_NODES_MAX) return false;
            for (const item of items) stack.push({ value: item, depth: top.depth + 1 });
            continue;
        }
        // A function, `undefined`, a symbol, a bigint, or an instance such as a `Date`.
        if (!isRecord(current)) return false;
        const prototype: unknown = Object.getPrototypeOf(current);
        if (prototype !== Object.prototype && prototype !== null) return false;
        const keys = Object.keys(current);
        if (visited + stack.length + keys.length >= JSON_NODES_MAX) return false;
        for (const key of keys) stack.push({ value: current[key], depth: top.depth + 1 });
    }
    return false;
}

function fail(failure: Failure, expected: string): typeof FAIL {
    failure.expected = expected;
    return FAIL;
}

function describeFailure(failure: Failure): SchemaError {
    return { path: `$${failure.segments.reverse().join('')}`, expected: failure.expected };
}
