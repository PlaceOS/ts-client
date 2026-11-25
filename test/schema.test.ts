/**
 * Goal: the parser accepts exactly the values that the types describe, and gives a clean output.
 * Method: parse small schemas with good and bad values, and compare the result to the expected
 * output or error path.
 */
import { describe, expect, test } from 'bun:test';
import {
    array,
    boolean,
    checkRequest,
    integer,
    json,
    JSON_NODES_MAX,
    literal,
    nullable,
    number,
    object,
    parameters,
    parseResponse,
    record,
    string,
    tuple,
    union,
    type Input,
    type Output,
} from '../src/core/schema.ts';
import { MetadataInterface } from '../src/generated/schemas.ts';
import { PlaceCalendarEvent } from '../src/generated/staff/schemas.ts';

const Zone = object(
    {
        id: string(),
        name: nullable(string()),
        count: integer('Int32'),
        tags: array(string()),
    },
    ['id', 'tags'],
);

describe('parseResponse', () => {
    test('sets a missing optional field to null and drops unknown fields', () => {
        const result = parseResponse(Zone, { id: 'zone-1', tags: [], extra: true });
        expect(result).toEqual({
            ok: true,
            value: { id: 'zone-1', name: null, count: null, tags: [] },
        });
        if (result.ok) expect(Object.keys(result.value)).toEqual(['id', 'name', 'count', 'tags']);
    });

    test('gives the path and the reason of the first failure', () => {
        expect(parseResponse(Zone, { id: 'zone-1', tags: ['a', 2] })).toEqual({
            ok: false,
            error: { path: '$.tags[1]', expected: 'string' },
        });
        expect(parseResponse(Zone, { tags: [] })).toEqual({
            ok: false,
            error: { path: '$.id', expected: 'a value for the required field' },
        });
        expect(parseResponse(array(Zone), [{ id: 'zone-1', tags: [], count: 'many' }])).toEqual({
            ok: false,
            error: { path: '$[0].count', expected: 'integer from -2147483648 to 2147483647' },
        });
    });

    test('accepts only integers in the range of the format', () => {
        expect(parseResponse(integer('UInt32'), 0).ok).toBe(true);
        expect(parseResponse(integer('UInt32'), -1).ok).toBe(false);
        expect(parseResponse(integer('Int32'), 2 ** 31).ok).toBe(false);
        expect(parseResponse(integer(), 2 ** 53).ok).toBe(false);
        expect(parseResponse(integer(), 1.5).ok).toBe(false);
        expect(parseResponse(number(), Number.NaN).ok).toBe(false);
    });

    test('checks literals, tuples and records', () => {
        expect(parseResponse(literal(['low', 'high']), 'low').ok).toBe(true);
        expect(parseResponse(literal(['low', 'high']), 'medium').ok).toBe(false);
        expect(parseResponse(literal([0, 1]), 1).ok).toBe(true);
        const pair = tuple([string(), integer('Int32')]);
        expect(parseResponse(pair, ['a', 1])).toEqual({ ok: true, value: ['a', 1] });
        expect(parseResponse(pair, ['a', 1, 2]).ok).toBe(false);
        expect(parseResponse(record(boolean()), { a: true, b: 'no' })).toEqual({
            ok: false,
            error: { path: '$.b', expected: 'boolean' },
        });
    });

    test('keeps a `__proto__` key of a record as a field', () => {
        const value = JSON.parse('{"__proto__": "x", "a": "y"}');
        const result = parseResponse(record(string()), value);
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(Object.getPrototypeOf(result.value)).toBe(Object.prototype);
        expect(Object.keys(result.value)).toEqual(['__proto__', 'a']);
    });

    test('returns the union variant that knows the most fields, or the first in a tie', () => {
        const Admin = object({ id: string(), sys_admin: boolean() }, ['id', 'sys_admin']);
        const Public = object({ id: string() }, ['id']);
        // The narrow variant is first, and it matches each value
        const User = union([Public, Admin]);
        expect(parseResponse(User, { id: 'u', sys_admin: true })).toEqual({
            ok: true,
            value: { id: 'u', sys_admin: true },
        });
        expect(parseResponse(User, { id: 'u' })).toEqual({ ok: true, value: { id: 'u' } });
        expect(parseResponse(union([Admin, Public]), { id: 'u' })).toEqual({
            ok: true,
            value: { id: 'u' },
        });
        expect(parseResponse(User, { name: 'u' })).toEqual({
            ok: false,
            error: { path: '$', expected: 'a match for one variant of the union' },
        });
        // Arrays count the fields of their items
        const Users = union([array(Public), array(Admin)]);
        expect(parseResponse(Users, [{ id: 'u', sys_admin: false }])).toEqual({
            ok: true,
            value: [{ id: 'u', sys_admin: false }],
        });
    });

    test('keeps the full system of a staff calendar event', () => {
        const zero = parseResponse(PlaceCalendarEvent, {}, { missing_fields: 'zero' });
        expect(zero.ok).toBe(true);
        if (!zero.ok) return;
        // The server sends `update_triggers` with each system
        const system = {
            id: 'sys-1',
            name: 'Room 1',
            email: 'room1@example.com',
            zones: ['z'],
            update_triggers: false,
        };
        const result = parseResponse(PlaceCalendarEvent, { ...zero.value, system });
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.value.system).toMatchObject(system);
    });

    test('accepts any JSON value for json, but not a missing value', () => {
        expect(parseResponse(json(), { a: [1, 'b', null] }).ok).toBe(true);
        expect(parseResponse(object({ details: json() }, ['details']), {}).ok).toBe(false);
    });

    test('refuses values that JSON.stringify would change, such as NaN', () => {
        // `JSON.stringify([NaN])` is `[null]`: the server would get a different argument.
        expect(checkRequest(array(json()), [Number.NaN]).ok).toBe(false);
        expect(parseResponse(json(), () => 1).ok).toBe(false);
        expect(parseResponse(json(), { when: new Date(0) }).ok).toBe(false);
        expect(parseResponse(json(), [1, undefined]).ok).toBe(false);
        // A cycle stops at the depth limit, not with a stack overflow.
        const cycle: Record<string, unknown> = {};
        cycle['self'] = cycle;
        expect(parseResponse(json(), cycle).ok).toBe(false);
    });

    test('refuses a JSON value with more than JSON_NODES_MAX values before it walks them', () => {
        expect(parseResponse(json(), new Array(JSON_NODES_MAX).fill(0)).ok).toBe(false);
        expect(parseResponse(json(), new Array(1_000).fill(0)).ok).toBe(true);
    });
});

describe('metadata details', () => {
    const metadata = {
        name: 'settings',
        description: '',
        editors: [],
        updated_at: 0,
        created_at: 0,
    };

    test('decodes details that the server sends as JSON text', () => {
        const result = parseResponse(MetadataInterface, {
            ...metadata,
            details: '{"theme":"dark"}',
        });
        expect(result.ok && result.value.details).toEqual({ theme: 'dark' });
        const list = parseResponse(MetadataInterface, { ...metadata, details: '[1,"a"]' });
        expect(list.ok && list.value.details).toEqual([1, 'a']);
    });

    test('keeps a string that is not JSON text, and does not throw', () => {
        const details = (text: string) => {
            const result = parseResponse(MetadataInterface, { ...metadata, details: text });
            return result.ok ? result.value.details : 'parse failed';
        };
        expect(details('dark theme')).toBe('dark theme');
        expect(details('{"theme":')).toBe('{"theme":');
        // JSON text of a string becomes that string
        expect(details('"dark"')).toBe('dark');
    });

    test('decodes the details of a response, but not of a request', () => {
        const input = { ...metadata, details: '{"theme":"dark"}' };
        expect(checkRequest(MetadataInterface, input)).toEqual({ ok: true, value: input });
        const result = parseResponse(MetadataInterface, input);
        expect(result.ok && result.value.details).toEqual({ theme: 'dark' });
    });
});

describe('checkRequest', () => {
    test('leaves optional fields missing, so the server keeps their values', () => {
        const input: Input<typeof Zone> = { name: 'Level 1' };
        expect(checkRequest(Zone, input)).toEqual({ ok: true, value: { name: 'Level 1' } });
    });

    test('rejects a field that the schema does not know', () => {
        const input = { name: 'Level 1', nmae: 'typo' };
        expect(checkRequest<unknown, unknown>(Zone, input)).toEqual({
            ok: false,
            error: { path: '$.nmae', expected: 'no field with this name' },
        });
    });

    test('requires the required fields of parameters, but not of objects', () => {
        const Params = parameters({ id: string(), complete: boolean() }, ['id']);
        expect(checkRequest(Params, { id: 'zone-1' }).ok).toBe(true);
        const missing: Record<string, unknown> = { complete: true };
        expect(checkRequest<unknown, unknown>(Params, missing).ok).toBe(false);
        expect(checkRequest(Zone, {}).ok).toBe(true);
    });
});

describe('types', () => {
    test('derive the output and input types from the schema', () => {
        // The assignments are the test. The compiler rejects them if the types are wrong.
        const output: Output<typeof Zone> = { id: 'a', name: null, count: null, tags: [] };
        const input: Input<typeof Zone> = {};
        // @ts-expect-error A response always has each field.
        const incomplete: Output<typeof Zone> = { id: 'a', tags: [] };
        expect([output, input, incomplete].length).toBe(3);
    });
});
