/**
 * Goal: the migration tool rewrites 6.x calls to the correct 7.x calls, and it does not change a use
 * that it cannot rewrite safely.
 * Method: run `migrateSource` with the generated map on small 6.x files, and compare the text.
 */
import { expect, test } from 'bun:test';
import * as ts from 'typescript-5';
import { migrateSource, type MigrateTables } from '../src/migrate/migrate.ts';
import { V1_CALLS, V1_COMPAT, V1_TYPES, V1_UNMAPPED } from '../src/migrate/v1-map.ts';

const TABLES: MigrateTables = {
    calls: V1_CALLS,
    types: V1_TYPES,
    compat: V1_COMPAT,
    unmapped: V1_UNMAPPED,
};

function migrate(text: string, file_name = 'file.ts') {
    return migrateSource(ts, file_name, text, TABLES);
}

test('rewrites calls, types and imports', () => {
    const result = migrate(
        [
            "import { PlaceZone, queryZones, showZone } from '@placeos/ts-client';",
            'async function load(id: string, query: object): Promise<PlaceZone> {',
            '    const list = await queryZones(query);',
            '    return showZone(id, { complete: true });',
            '}',
        ].join('\n'),
    );
    expect(result.text).toBe(
        [
            "import { type Zone, zones } from '@placeos/ts-client';",
            "import { orThrow, orThrowPage } from '@placeos/ts-client/compat';",
            'async function load(id: string, query: object): Promise<Zone> {',
            '    const list = await zones.query(query).then(orThrowPage);',
            '    return zones.show({ id, complete: true }).then(orThrow);',
            '}',
        ].join('\n'),
    );
    expect(result.changes).toBe(3);
    expect(result.findings).toEqual([]);
});

test('maps path templates, default values, members and picked keys', () => {
    const result = migrate(
        [
            "import { executeOnZone, showMetadata, updateSystem } from '@placeos/ts-client';",
            "executeOnZone(id, 'power', 'Display');",
            'showMetadata(zone.id, name);',
            'updateSystem(system.id, system);',
        ].join('\n'),
    );
    expect(result.text.split('\n').slice(2)).toEqual([
        "zones.zoneExecute({ id, module_slug: 'Display_1', method: 'power', body: [] }).then(orThrow);",
        'metadata.show({ id: zone.id, name }).then(orThrow).then((data) => data[name]);',
        // 6.x sent `form_data.version || 0`.
        'systems.update({ sys_id: system.id, version: system.version ?? 0, body: system }).then(orThrow);',
    ]);
});

test('keeps the uses that it cannot rewrite, with a finding', () => {
    const text = [
        "import { addSystemModule, getModule, listMetadata, showMetadata, showZone, updateMetadata } from '@placeos/ts-client';",
        // 6.x made a list of the metadata, which 7.x gives by name.
        'listMetadata(zone.id);',
        "addSystemModule('sys-1', 'mod-1', { a: 1 });",
        'showMetadata(id, names()[0]);',
        "getModule('sys-1', 'Bookings');",
        'const load = showZone;',
        // 7.x has `metadata.update` (PUT) and `metadata.merge` (PATCH).
        "updateMetadata(id, data, 'patch');",
    ].join('\n');
    const result = migrate(text);
    expect(result.text).toBe(text);
    expect(result.findings.map((finding) => `${finding.line} ${finding.name}`)).toEqual([
        '2 listMetadata',
        '3 addSystemModule',
        '4 showMetadata',
        '5 getModule',
        '6 showZone',
        '7 updateMetadata',
    ]);
});

test('gives a new import another name when the file has the name', () => {
    const result = migrate(
        [
            "import { queryZones } from '@placeos/ts-client';",
            'const zones = await queryZones();',
        ].join('\n'),
    );
    expect(result.text).toBe(
        [
            "import { zones as zones_v7 } from '@placeos/ts-client';",
            "import { orThrowPage } from '@placeos/ts-client/compat';",
            'const zones = await zones_v7.query({}).then(orThrowPage);',
        ].join('\n'),
    );
});

test('rewrites calls and spies on a namespace import', () => {
    const result = migrate(
        [
            "import * as client from '@placeos/ts-client';",
            'client.showZone(id);',
            "vi.spyOn(client, 'showZone');",
            "jest.fn().mockName('showZone');",
        ].join('\n'),
    );
    expect(result.text.split('\n')).toEqual([
        "import * as client from '@placeos/ts-client';",
        "import { orThrow } from '@placeos/ts-client/compat';",
        'client.zones.show({ id }).then(orThrow);',
        "vi.spyOn(client.zones, 'show');",
        "jest.fn().mockName('showZone');",
    ]);
    // Another string with a 6.x name can be a test double that the tool does not know.
    expect(result.findings.map((finding) => finding.message)).toEqual([
        'a test double of 6.x: make it for the 7.x call (zones.show)',
    ]);
});

test('a namespace import reads the 6.x enums and types from the compat module', () => {
    const result = migrate(
        [
            "import * as client from '@placeos/ts-client';",
            'const role = client.PlaceDriverRole.Logic;',
            'let page: client.QueryResponse<string>;',
        ].join('\n'),
    );
    expect(result.text.split('\n')).toEqual([
        "import * as client from '@placeos/ts-client';",
        "import { PlaceDriverRole, type QueryResponse } from '@placeos/ts-client/compat';",
        'const role = PlaceDriverRole.Logic;',
        'let page: QueryResponse<string>;',
    ]);
});

test('moves the 6.x enums and the QueryResponse type to the compat module', () => {
    const result = migrate(
        [
            "import { PlaceDriverRole, QueryResponse } from '@placeos/ts-client';",
            'const role = PlaceDriverRole.Logic;',
            'let page: QueryResponse<string>;',
        ].join('\n'),
    );
    expect(result.text.split('\n')[0]).toBe(
        "import { PlaceDriverRole, type QueryResponse } from '@placeos/ts-client/compat';",
    );
    expect(result.findings).toEqual([]);
});

test('a second run changes nothing', () => {
    const first = migrate(
        [
            "import { getModule, PlaceZone, showZone } from '@placeos/ts-client';",
            'const zone: PlaceZone = await showZone(id);',
            "getModule('sys-1', 'Bookings');",
        ].join('\n'),
    );
    const second = migrate(first.text);
    expect(second.text).toBe(first.text);
    expect(second.changes).toBe(0);
    // The 7.x names of the first run are not findings.
    expect(second.findings.map((finding) => finding.name)).toEqual(['getModule']);
});

test('rewrites test doubles: the function, the mock values and the argument checks', () => {
    const result = migrate(
        [
            "import { queryZones, showMetadata, showZone, updateSystem } from '@placeos/ts-client';",
            "vi.mock('@placeos/ts-client', { spy: true });",
            "vi.mocked(showZone).mockResolvedValue({ id: 'zone-1' } as any);",
            'vi.mocked(queryZones).mockResolvedValueOnce({ data: [], total: 0 });',
            "vi.mocked(showZone).mockRejectedValue(new Error('403'));",
            "expect(showZone).toHaveBeenCalledWith('zone-1');",
            'expect(showZone).not.toHaveBeenCalled();',
            '(showZone as Mock).mockImplementation((id) => Promise.resolve({ id }));',
            'vi.mocked(showMetadata).mockResolvedValue({ details: {} });',
            "expect(updateSystem).toHaveBeenCalledWith('sys-1', expect.objectContaining({ name: 'A' }));",
        ].join('\n'),
        'zone.spec.ts',
    );
    expect(result.text.split('\n')).toEqual([
        "import { metadata, systems, zones } from '@placeos/ts-client';",
        "import { fromV1Mock, mockPage, mockReply } from '@placeos/ts-client/compat';",
        "vi.mock('@placeos/ts-client', { spy: true });",
        "vi.mocked(zones.show).mockResolvedValue(mockReply({ id: 'zone-1' } as any));",
        'vi.mocked(zones.query).mockResolvedValueOnce(mockPage({ data: [], total: 0 }));',
        "vi.mocked(zones.show).mockRejectedValue(new Error('403'));",
        "expect(zones.show).toHaveBeenCalledWith({ id: 'zone-1' });",
        'expect(zones.show).not.toHaveBeenCalled();',
        // An implementation gets the 6.x arguments, and its value becomes a 7.x result.
        "(zones.show as Mock).mockImplementation(fromV1Mock((id) => Promise.resolve({ id }), ['id', '...']));",
        // The 7.x call gives the data by key, so the value goes under the key.
        "vi.mocked(metadata.show).mockImplementation(fromV1Mock(() => ({ details: {} }), ['id', 'name'], 'data', 'name'));",
        // The check leaves out the `version` that 7.x reads from the data.
        "expect(systems.update).toHaveBeenCalledWith(expect.objectContaining({ sys_id: 'sys-1', body: expect.objectContaining({ name: 'A' }) }));",
    ]);
    expect(result.findings).toEqual([]);
});

test('rewrites a spy on a namespace import, and finds an automock', () => {
    const result = migrate(
        [
            "import * as client from '@placeos/ts-client';",
            "vi.mock('@placeos/ts-client');",
            "vi.spyOn(client, 'showZone').mockResolvedValue(zone);",
        ].join('\n'),
    );
    expect(result.text.split('\n').at(-1)).toBe(
        "vi.spyOn(client.zones, 'show').mockResolvedValue(mockReply(zone));",
    );
    expect(result.findings.map((finding) => finding.name)).toEqual(['@placeos/ts-client']);
});

test('rewrites the 6.x functions of a vi.mock factory to 7.x namespaces', () => {
    const result = migrate(
        [
            "import { authority, queryZones, showMetadata, showZone } from '@placeos/ts-client';",
            "vi.mock('@placeos/ts-client', () => ({",
            '    authority: vi.fn(() => null),',
            '    showZone: vi.fn((id: string) => Promise.resolve({ id })),',
            '    queryZones: vi.fn(),',
            '    showMetadata: vi.fn(() => ({ details: {} })),',
            '}));',
        ].join('\n'),
    );
    expect(result.text.split('\n')).toEqual([
        "import { authority } from '@placeos/ts-client';",
        "const { fromV1Mock } = await vi.hoisted(() => import('@placeos/ts-client/compat'));",
        "vi.mock('@placeos/ts-client', () => ({ authority: vi.fn(() => null), " +
            "zones: { show: vi.fn(fromV1Mock((id: string) => Promise.resolve({ id }), ['id', '...'])), " +
            "query: vi.fn(fromV1Mock(undefined, ['...'], 'page')) }, " +
            "metadata: { show: vi.fn(fromV1Mock(() => ({ details: {} }), ['id', 'name'], 'data', 'name')) } }));",
    ]);
});

test('fromV1Mock gives the 6.x arguments and a 7.x result', async () => {
    const { fromV1Mock, orThrow, orThrowPage } = await import('../src/compat/index.ts');
    const calls: unknown[][] = [];
    const record = (...args: unknown[]) => {
        calls.push(args);
        return { id: 'zone-1' };
    };
    const show = fromV1Mock(record, ['id', '...']);
    expect(orThrow(await show({ id: 'zone-1' }))).toEqual({ id: 'zone-1' });
    await show({ id: 'zone-1', complete: true });
    // An empty last argument is left out, as the 6.x call left it out.
    expect(calls).toEqual([['zone-1'], ['zone-1', { complete: true }]]);
    const query = fromV1Mock(() => ({ data: [1], total: 9 }), ['...'], 'page');
    expect(orThrowPage(await query({})).total).toBe(9);
    const meta = fromV1Mock(() => ({ details: 1 }), ['id', 'name'], 'data', 'name');
    expect(orThrow(await meta({ id: 'z', name: 'settings' }))).toEqual({
        settings: { details: 1 },
    });
});

test('a 7.x type gets an alias when the 6.x class stays for a value use', () => {
    const result = migrate(
        [
            "import { SignagePlugin } from '@placeos/ts-client';",
            'const plugin: SignagePlugin = new SignagePlugin();',
        ].join('\n'),
    );
    expect(result.text.split('\n')).toEqual([
        "import { SignagePlugin, type SignagePlugin as SignagePluginV7 } from '@placeos/ts-client';",
        'const plugin: SignagePluginV7 = new SignagePlugin();',
    ]);
});

test('rewrites the 6.x staff functions to @placeos/ts-client/staff', () => {
    const result = migrate(
        [
            "import { querySurveys, showSurvey, Survey, showZone } from '@placeos/ts-client';",
            'const assets = 1;',
            'const survey: Survey = await showSurvey(id);',
            'const list = await querySurveys({ zone_id: zone });',
            'await showZone(id);',
        ].join('\n'),
    );
    expect(result.text.split('\n')).toEqual([
        "import { zones } from '@placeos/ts-client';",
        "import { type Survey, surveys } from '@placeos/ts-client/staff';",
        "import { orThrow } from '@placeos/ts-client/compat';",
        'const assets = 1;',
        'const survey: Survey = await surveys.show({ id }).then(orThrow);',
        // 6.x `querySurveys` gave a list, not a page.
        'const list = await surveys.query({ zone_id: zone }).then(orThrow);',
        'await zones.show({ id }).then(orThrow);',
    ]);
});

test('the hoisted helper goes with the new imports, also when the last 6.x import goes', () => {
    const result = migrate(
        [
            "import { showZone } from '@placeos/ts-client';",
            "import type { PlaceZone } from '@placeos/ts-client';",
            "vi.mock('@placeos/ts-client', () => ({ showZone: vi.fn() }));",
            'let zone: PlaceZone;',
        ].join('\n'),
    );
    // `showZone` is only a key of the factory, so the file needs no `zones` import.
    expect(result.text.split('\n').slice(0, 3)).toEqual([
        "import { type Zone } from '@placeos/ts-client';",
        "const { fromV1Mock } = await vi.hoisted(() => import('@placeos/ts-client/compat'));",
        "vi.mock('@placeos/ts-client', () => ({ zones: { show: vi.fn(fromV1Mock(undefined, ['id', '...'])) } }));",
    ]);
});

test('a helper reuses the compat import of the file, and gets an alias when the file has its name', () => {
    const imported = migrate(
        [
            "import { showZone } from '@placeos/ts-client';",
            "import { orThrow } from '@placeos/ts-client/compat';",
            'await showZone(id);',
        ].join('\n'),
    );
    expect(imported.text.split('\n')).toEqual([
        "import { zones } from '@placeos/ts-client';",
        "import { orThrow } from '@placeos/ts-client/compat';",
        'await zones.show({ id }).then(orThrow);',
    ]);
    // A type-only import has no value, so the call gets a value import.
    const type_only = migrate(
        [
            "import { showZone } from '@placeos/ts-client';",
            "import type { orThrow } from '@placeos/ts-client/compat';",
            'await showZone(id);',
        ].join('\n'),
    );
    expect(type_only.text).toContain('.then(orThrowV7)');
    const local = migrate(
        [
            "import { showZone } from '@placeos/ts-client';",
            'const orThrow = 1;',
            'await showZone(id);',
        ].join('\n'),
    );
    expect(local.text.split('\n').slice(1)).toEqual([
        "import { orThrow as orThrowV7 } from '@placeos/ts-client/compat';",
        'const orThrow = 1;',
        'await zones.show({ id }).then(orThrowV7);',
    ]);
});

test('a factory keeps a mock as a mock, and finds a function whose arguments it cannot rebuild', () => {
    const result = migrate(
        [
            "import { executeOnZone, showZone } from '@placeos/ts-client';",
            "vi.mock('@placeos/ts-client', () => ({",
            '    showZone: vi.fn().mockResolvedValue(zone),',
            '    executeOnZone: vi.fn(),',
            '}));',
        ].join('\n'),
        'zone.spec.ts',
    );
    // `${module}_${index}` of `executeOnZone` has two 6.x arguments in one input value.
    expect(result.text).toContain(
        "zones: { show: vi.fn(fromV1Mock(vi.fn().mockResolvedValue(zone), ['id', '...'])) }",
    );
    expect(result.text).toContain('executeOnZone: vi.fn()');
    expect(result.findings.map((finding) => `${finding.line} ${finding.name}`)).toEqual([
        '4 executeOnZone',
    ]);
});

test('a file deeper than the limit stays as it is, with a finding', () => {
    const deep = `${'('.repeat(1_500)}1${')'.repeat(1_500)}`;
    const text = ["import { showZone } from '@placeos/ts-client';", `showZone(${deep});`].join(
        '\n',
    );
    const result = migrate(text);
    expect(result.text).toBe(text);
    expect(result.findings[0]?.message).toContain('deeper than');
});

test('a test double of a function whose arguments the tool cannot rebuild stays 6.x', () => {
    const text = [
        "import { executeOnZone } from '@placeos/ts-client';",
        'vi.mocked(executeOnZone).mockImplementation((id, method, module, index) => Promise.resolve(index));',
        'expect(executeOnZone).toHaveBeenCalled();',
    ].join('\n');
    const result = migrate(text, 'zone.spec.ts');
    expect(result.text).toBe(text);
    expect(result.findings.map((finding) => `${finding.line} ${finding.name}`)).toEqual([
        '2 executeOnZone',
        '3 executeOnZone',
    ]);
});

test('the hoisted helper gets its own name when the file imports fromV1Mock', () => {
    const result = migrate(
        [
            "import { showZone } from '@placeos/ts-client';",
            "import { fromV1Mock } from '@placeos/ts-client/compat';",
            "vi.mock('@placeos/ts-client', () => ({ showZone: vi.fn() }));",
        ].join('\n'),
    );
    expect(result.text.split('\n')).toEqual([
        "const { fromV1Mock: fromV1MockV7 } = await vi.hoisted(() => import('@placeos/ts-client/compat'));",
        "import { fromV1Mock } from '@placeos/ts-client/compat';",
        "vi.mock('@placeos/ts-client', () => ({ zones: { show: vi.fn(fromV1MockV7(undefined, ['id', '...'])) } }));",
    ]);
});

test('finds the test doubles that it cannot change: an unnamed spread, a method, a variable', () => {
    const result = migrate(
        [
            "import { queryZones, showZone } from '@placeos/ts-client';",
            "vi.mock('@placeos/ts-client', async (importOriginal) => ({ ...(await importOriginal()), showZone: vi.fn() }));",
            "vi.mock('@placeos/ts-client', () => ({ showZone() { return null; }, queryZones: vi.fn() }));",
            'const spy = vi.mocked(showZone);',
        ].join('\n'),
        'zone.spec.ts',
    );
    // A new `zones` object without `...actual.zones` would remove the other functions.
    expect(result.text).toContain('({ ...(await importOriginal()), showZone: vi.fn() })');
    expect(result.findings.map((finding) => `${finding.line} ${finding.name}`)).toEqual([
        '2 @placeos/ts-client',
        '3 showZone',
        '4 showZone',
    ]);
});

test('finds the unmapped names on a namespace import', () => {
    const result = migrate(
        [
            "import * as client from '@placeos/ts-client';",
            'client.authority();',
            "client.getModule('sys-1', 'Bookings');",
        ].join('\n'),
    );
    expect(result.findings.map((finding) => `${finding.line} ${finding.name}`)).toEqual([
        '2 authority',
        '3 getModule',
    ]);
});
