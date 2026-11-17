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

function migrate(text: string) {
    return migrateSource(ts, 'file.ts', text, TABLES);
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

test('rewrites calls on a namespace import, and finds test doubles', () => {
    const result = migrate(
        [
            "import * as client from '@placeos/ts-client';",
            'client.showZone(id);',
            "vi.spyOn(client, 'showZone');",
        ].join('\n'),
    );
    expect(result.text.split('\n')).toEqual([
        "import * as client from '@placeos/ts-client';",
        "import { orThrow } from '@placeos/ts-client/compat';",
        'client.zones.show({ id }).then(orThrow);',
        "vi.spyOn(client, 'showZone');",
    ]);
    expect(result.findings.map((finding) => finding.message)).toEqual([
        'a test double of v1: make it for the v2 call (zones.show)',
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
