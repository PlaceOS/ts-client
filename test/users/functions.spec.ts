import { describe, expect, test, vi } from 'vitest';
import * as Auth from '../../src/auth/functions';
import * as Http from '../../src/http/functions';
import * as Resources from '../../src/resources/functions';
import * as SERVICE from '../../src/users/functions';
import { PlaceUser } from '../../src/users/user';

describe('Users API', () => {
    test('should allow querying users', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        let list = await SERVICE.queryUsers();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceUser);
        list = await SERVICE.queryUsers({});
    });

    test('should allow showing user details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.showUser('1');
        expect(item).toBeInstanceOf(PlaceUser);
        item = await SERVICE.showUser('1', {});
    });

    test('should allow showing current user details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.currentUser();
        expect(item).toBeInstanceOf(PlaceUser);
        item = await SERVICE.currentUser({});
    });

    test('should allow creating new users', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.addUser({});
        expect(item).toBeInstanceOf(PlaceUser);
        item = await SERVICE.addUser({});
    });

    test('should allow updating user details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateUser('1', {});
        expect(item).toBeInstanceOf(PlaceUser);
        item = await SERVICE.updateUser('1', {}, 'patch');
    });

    test('should allow removing users', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        let item = await SERVICE.removeUser('1');
        expect(item).toBeFalsy();
        item = await SERVICE.removeUser('1', {
            force_removal: true,
        });
    });

    test('should allow querying user groups', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'get');
        httpSpy.mockImplementation(
            () =>
                Promise.resolve({
                    'user@example.com': ['group1', 'group2'],
                }) as any,
        );

        const result = await SERVICE.queryUserGroups({
            emails: 'user@example.com',
        });
        expect(result).toBeTruthy();
        expect(result!['user@example.com']).toEqual(['group1', 'group2']);
        expect(httpSpy).toHaveBeenCalledWith(
            expect.stringContaining('emails=user%40example.com'),
        );
    });

    test('should allow searching user metadata', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'get');
        httpSpy.mockImplementation(
            () => Promise.resolve([{ id: 'user-1', metadata: {} }]) as any,
        );

        const result = await SERVICE.searchUserMetadata({
            filter: '$.department == "engineering"',
        });
        expect(result).toBeTruthy();
        expect(result!.length).toBe(1);
        expect(httpSpy).toHaveBeenCalledWith(
            expect.stringContaining('metadata/search'),
        );
    });

    test('should allow getting current user resource token', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'post');
        httpSpy.mockImplementation(
            () => Promise.resolve({ token: 'abc123' }) as any,
        );

        const result = await SERVICE.currentUserResourceToken();
        expect(result).toBeTruthy();
        expect(result!.token).toBe('abc123');
        expect(httpSpy).toHaveBeenCalledWith(
            '/api/engine/v2/users/resource_token',
            {},
        );
    });

    test('should allow getting user metadata', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation(() => Promise.resolve({ key: 'value' }));
        let item = await SERVICE.userMetadata('1');
        expect(item).toEqual({ key: 'value' });
        item = await SERVICE.userMetadata('1', { name: 'test' });
    });

    test('should allow removing user resource token', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'del');
        httpSpy.mockImplementation(() => Promise.resolve(undefined) as any);

        await SERVICE.removeUserResourceToken('user-1');
        expect(httpSpy).toHaveBeenCalledWith(
            '/api/engine/v2/users/user-1/resource_token',
            { response_type: 'void' },
        );
    });

    test('should allow getting user resource token', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'post');
        httpSpy.mockImplementation(
            () => Promise.resolve({ token: 'xyz789' }) as any,
        );

        const result = await SERVICE.userResourceToken('user-1');
        expect(result).toBeTruthy();
        expect(result!.token).toBe('xyz789');
        expect(httpSpy).toHaveBeenCalledWith(
            '/api/engine/v2/users/user-1/resource_token',
            {},
        );
    });

    test('should allow reviving a user', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation((_: any) =>
            Promise.resolve(_.callback({}) as any),
        );
        const item = await SERVICE.reviveUser('user-1');
        expect(item).toBeInstanceOf(PlaceUser);
    });
});
