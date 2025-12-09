import { of } from 'rxjs';
import { describe, expect, test, vi } from 'vitest';
import * as Resources from '../../src/resources/functions';
import * as SERVICE from '../../src/users/functions';
import { PlaceUser } from '../../src/users/user';
import * as Http from '../../src/http/functions';
import * as Auth from '../../src/auth/functions';

describe('Users API', () => {
    test('should allow querying users', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) => of({ data: [_.fn!({})] } as any));
        let list = await SERVICE.queryUsers().toPromise();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceUser);
        list = await SERVICE.queryUsers({}).toPromise();
    });

    test('should allow showing user details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.showUser('1').toPromise();
        expect(item).toBeInstanceOf(PlaceUser);
        item = await SERVICE.showUser('1', {}).toPromise();
    });

    test('should allow showing current user details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.currentUser().toPromise();
        expect(item).toBeInstanceOf(PlaceUser);
        item = await SERVICE.currentUser({}).toPromise();
    });

    test('should allow creating new users', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.addUser({}).toPromise();
        expect(item).toBeInstanceOf(PlaceUser);
        item = await SERVICE.addUser({}).toPromise();
    });

    test('should allow updating user details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.updateUser('1', {}).toPromise();
        expect(item).toBeInstanceOf(PlaceUser);
        item = await SERVICE.updateUser('1', {}, 'patch').toPromise();
    });

    test('should allow removing users', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        let item = await SERVICE.removeUser('1').toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeUser('1', { force_removal: true }).toPromise();
    });

    test('should allow querying user groups', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'get');
        httpSpy.mockImplementation(() => of({ 'user@example.com': ['group1', 'group2'] }) as any);

        const result = await SERVICE.queryUserGroups({ emails: 'user@example.com' }).toPromise();
        expect(result).toBeTruthy();
        expect(result!['user@example.com']).toEqual(['group1', 'group2']);
        expect(httpSpy).toHaveBeenCalledWith(expect.stringContaining('emails=user%40example.com'));
    });

    test('should allow searching user metadata', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'get');
        httpSpy.mockImplementation(() => of([{ id: 'user-1', metadata: {} }]) as any);

        const result = await SERVICE.searchUserMetadata({ filter: '$.department == "engineering"' }).toPromise();
        expect(result).toBeTruthy();
        expect(result!.length).toBe(1);
        expect(httpSpy).toHaveBeenCalledWith(expect.stringContaining('metadata/search'));
    });

    test('should allow getting current user resource token', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'post');
        httpSpy.mockImplementation(() => of({ token: 'abc123' }) as any);

        const result = await SERVICE.currentUserResourceToken().toPromise();
        expect(result).toBeTruthy();
        expect(result!.token).toBe('abc123');
        expect(httpSpy).toHaveBeenCalledWith('/api/engine/v2/users/resource_token', {});
    });

    test('should allow getting user metadata', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation(() => of({ key: 'value' }));
        let item = await SERVICE.userMetadata('1').toPromise();
        expect(item).toEqual({ key: 'value' });
        item = await SERVICE.userMetadata('1', { name: 'test' }).toPromise();
    });

    test('should allow removing user resource token', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'del');
        httpSpy.mockImplementation(() => of(undefined) as any);

        await SERVICE.removeUserResourceToken('user-1').toPromise();
        expect(httpSpy).toHaveBeenCalledWith(
            '/api/engine/v2/users/user-1/resource_token',
            { response_type: 'void' }
        );
    });

    test('should allow getting user resource token', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'post');
        httpSpy.mockImplementation(() => of({ token: 'xyz789' }) as any);

        const result = await SERVICE.userResourceToken('user-1').toPromise();
        expect(result).toBeTruthy();
        expect(result!.token).toBe('xyz789');
        expect(httpSpy).toHaveBeenCalledWith('/api/engine/v2/users/user-1/resource_token', {});
    });

    test('should allow reviving a user', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation((_: any) => of(_.callback({}) as any));
        const item = await SERVICE.reviveUser('user-1').toPromise();
        expect(item).toBeInstanceOf(PlaceUser);
    });
});
