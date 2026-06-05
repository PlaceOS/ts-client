import { describe, expect, test, vi } from 'vitest';
import * as SERVICE from '../../src/ldap-sources/functions';
import { PlaceLDAPSource } from '../../src/ldap-sources/ldap-source';
import * as Resources from '../../src/resources/functions';

describe('LDAPSources API', () => {
    test('should allow querying ldapsources', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        const list = await SERVICE.queryLDAPSources();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceLDAPSource);
    });

    test('should allow showing ldapsource details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.showLDAPSource('1');
        expect(item).toBeInstanceOf(PlaceLDAPSource);
    });

    test('should allow creating new LDAP sources', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.addLDAPSource({});
        expect(item).toBeInstanceOf(PlaceLDAPSource);
    });

    test('should allow updating LDAP source details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.updateLDAPSource('1', {});
        expect(item).toBeInstanceOf(PlaceLDAPSource);
    });

    test('should allow removing ldapsources', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeLDAPSource('1');
        expect(item).toBeFalsy();
    });
});
