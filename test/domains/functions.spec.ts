import { describe, expect, test, vi } from 'vitest';
import * as Auth from '../../src/auth/functions';
import { PlaceDomain } from '../../src/domains/domain';
import * as SERVICE from '../../src/domains/functions';
import * as Http from '../../src/http/functions';
import * as Resources from '../../src/resources/functions';

describe('Domains API', () => {
    test('should allow querying domain', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        let list = await SERVICE.queryDomains();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceDomain);
        list = await SERVICE.queryDomains({});
    });

    test('should allow showing domain details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.showDomain('1');
        expect(item).toBeInstanceOf(PlaceDomain);
    });

    test('should allow creating new domains', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.addDomain({});
        expect(item).toBeInstanceOf(PlaceDomain);
        item = await SERVICE.addDomain({});
    });

    test('should allow updating domain details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateDomain('1', {});
        expect(item).toBeInstanceOf(PlaceDomain);
        item = await SERVICE.updateDomain('1', {}, 'patch');
    });

    test('should allow removing domains', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeDomain('1');
        expect(item).toBeFalsy();
    });

    test('should allow looking up domain by email', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'get');
        httpSpy.mockImplementation(() => Promise.resolve('example.com') as any);

        const result = await SERVICE.lookupDomainByEmail('user@example.com');
        expect(result).toBe('example.com');
        expect(httpSpy).toHaveBeenCalledWith(
            '/api/engine/v2/domains/lookup/user%40example.com',
        );
    });
});
