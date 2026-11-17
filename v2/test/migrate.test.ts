/**
 * Goal: the migration tool rewrites v1 calls to the correct v2 calls, and it does not change a use
 * that it cannot rewrite safely.
 * Method: run `migrateSource` with the generated map on small v1 files, and compare the text.
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

function migrate(text: string, fileName = 'file.ts') {
    return migrateSource(ts, fileName, text, TABLES);
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
            '    const list = await zones.index(query).then(orThrowPage);',
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
        'systems.update({ sys_id: system.id, version: system.version, body: system }).then(orThrow);',
    ]);
});

test('keeps the uses that it cannot rewrite, with a finding', () => {
    const text = [
        "import { addSystemModule, getModule, showMetadata, showZone } from '@placeos/ts-client';",
        "addSystemModule('sys-1', 'mod-1', { a: 1 });",
        'showMetadata(id, names()[0]);',
        "getModule('sys-1', 'Bookings');",
        'const load = showZone;',
    ].join('\n');
    const result = migrate(text);
    expect(result.text).toBe(text);
    expect(result.findings.map((finding) => `${finding.line} ${finding.name}`)).toEqual([
        '2 addSystemModule',
        '3 showMetadata',
        '4 getModule',
        '5 showZone',
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
            "import { zones as zonesV2 } from '@placeos/ts-client';",
            "import { orThrowPage } from '@placeos/ts-client/compat';",
            'const zones = await zonesV2.index({}).then(orThrowPage);',
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
    // Another string with a v1 name can be a test double that the tool does not know.
    expect(result.findings.map((finding) => finding.message)).toEqual([
        'a test double of v1: make it for the v2 call (zones.show)',
    ]);
});

test('a namespace import reads the v1 enums and types from the compat module', () => {
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

test('moves the v1 enums and the QueryResponse type to the compat module', () => {
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
    // The v2 names of the first run are not findings.
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
        'vi.mocked(zones.index).mockResolvedValueOnce(mockPage({ data: [], total: 0 }));',
        "vi.mocked(zones.show).mockRejectedValue(new Error('403'));",
        "expect(zones.show).toHaveBeenCalledWith({ id: 'zone-1' });",
        'expect(zones.show).not.toHaveBeenCalled();',
        // An implementation gets the v1 arguments, and its value becomes a v2 result.
        "(zones.show as Mock).mockImplementation(fromV1Mock((id) => Promise.resolve({ id }), ['id', '...']));",
        // The v2 call gives the data by key, so the value goes under the key.
        "vi.mocked(metadata.show).mockImplementation(fromV1Mock(() => ({ details: {} }), ['id', 'name'], 'data', 'name'));",
        // The check leaves out the `version` that v2 reads from the data.
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

test('rewrites the v1 functions of a vi.mock factory to v2 namespaces', () => {
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
            "index: vi.fn(fromV1Mock(undefined, ['...'], 'page')) }, " +
            "metadata: { show: vi.fn(fromV1Mock(() => ({ details: {} }), ['id', 'name'], 'data', 'name')) } }));",
    ]);
});

test('fromV1Mock gives the v1 arguments and a v2 result', async () => {
    const { fromV1Mock, orThrow, orThrowPage } = await import('../src/compat/index.ts');
    const calls: unknown[][] = [];
    const record = (...args: unknown[]) => {
        calls.push(args);
        return { id: 'zone-1' };
    };
    const show = fromV1Mock(record, ['id', '...']);
    expect(orThrow(await show({ id: 'zone-1' }))).toEqual({ id: 'zone-1' });
    await show({ id: 'zone-1', complete: true });
    // An empty last argument is left out, as the v1 call left it out.
    expect(calls).toEqual([['zone-1'], ['zone-1', { complete: true }]]);
    const index = fromV1Mock(() => ({ data: [1], total: 9 }), ['...'], 'page');
    expect(orThrowPage(await index({})).total).toBe(9);
    const meta = fromV1Mock(() => ({ details: 1 }), ['id', 'name'], 'data', 'name');
    expect(orThrow(await meta({ id: 'z', name: 'settings' }))).toEqual({
        settings: { details: 1 },
    });
});
