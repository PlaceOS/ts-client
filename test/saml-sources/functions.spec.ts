import { describe, expect, test, vi } from 'vitest';

import * as Resources from '../../src/resources/functions';
import * as SERVICE from '../../src/saml-sources/functions';
import { PlaceSAMLSource } from '../../src/saml-sources/saml-source';

describe('SAML Auth Sources API', () => {
    test('should allow querying ldapsources', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        let list = await SERVICE.querySAMLSources();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceSAMLSource);
        list = await SERVICE.querySAMLSources({});
    });

    test('should allow showing SAML source details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.showSAMLSource('1');
        expect(item).toBeInstanceOf(PlaceSAMLSource);
    });

    test('should allow creating new SAML sources', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.addSAMLSource({});
        expect(item).toBeInstanceOf(PlaceSAMLSource);
        item = await SERVICE.addSAMLSource({});
    });

    test('should allow updating SAML source details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateSAMLSource('1', {});
        expect(item).toBeInstanceOf(PlaceSAMLSource);
        item = await SERVICE.updateSAMLSource('1', {}, 'patch');
    });

    test('should allow removing SAML sources', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeSAMLSource('1');
        expect(item).toBeFalsy();
    });
});
