import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { of } from 'rxjs';

import * as Resources from '../../src/resources/functions';
import * as SERVICE from '../../src/saml-sources/functions';
import { PlaceSAMLSource } from '../../src/saml-sources/saml-source';

describe('SAML Auth Sources API', () => {
    test('should allow querying ldapsources', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) => of({ data: [_.fn!({})] } as any));
        let list = await SERVICE.querySAMLSources().toPromise();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceSAMLSource);
        list = await SERVICE.querySAMLSources({}).toPromise();
    });

    test('should allow showing SAML source details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.showSAMLSource('1').toPromise();
        expect(item).toBeInstanceOf(PlaceSAMLSource);
        item = await SERVICE.showSAMLSource('1', {}).toPromise();
    });

    test('should allow creating new SAML sources', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.addSAMLSource({}).toPromise();
        expect(item).toBeInstanceOf(PlaceSAMLSource);
        item = await SERVICE.addSAMLSource({}).toPromise();
    });

    test('should allow updating SAML source details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.updateSAMLSource('1', {}).toPromise();
        expect(item).toBeInstanceOf(PlaceSAMLSource);
        item = await SERVICE.updateSAMLSource('1', {}, 'patch').toPromise();
    });

    test('should allow removing SAML sources', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        let item = await SERVICE.removeSAMLSource('1').toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeSAMLSource('1', {}).toPromise();
    });
});
