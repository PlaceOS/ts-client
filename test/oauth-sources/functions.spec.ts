import { describe, expect, test, vi } from 'vitest';
import * as SERVICE from '../../src/oauth-sources/functions';
import { PlaceOAuthSource } from '../../src/oauth-sources/oauth-source';
import * as Resources from '../../src/resources/functions';

describe('OAuthSources API', () => {
    test('should allow querying oauth sources', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        const list = await SERVICE.queryOAuthSources();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceOAuthSource);
    });

    test('should allow showing oauth source details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.showOAuthSource('1');
        expect(item).toBeInstanceOf(PlaceOAuthSource);
    });

    test('should allow creating new oauth sources', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.addOAuthSource({});
        expect(item).toBeInstanceOf(PlaceOAuthSource);
        item = await SERVICE.addOAuthSource({});
    });

    test('should allow updating oauth source details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateOAuthSource('1', {});
        expect(item).toBeInstanceOf(PlaceOAuthSource);
        item = await SERVICE.updateOAuthSource('1', {}, 'patch');
    });

    test('should allow removing oauth sources', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeOAuthSource('1');
        expect(item).toBeFalsy();
    });
});
