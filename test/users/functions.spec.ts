import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { of } from 'rxjs';
import * as Resources from '../../src/resources/functions';
import * as SERVICE from '../../src/users/functions';
import { PlaceUser } from '../../src/users/user';

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
        let item = await SERVICE.removeUser('1', {}).toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeUser('1').toPromise();
    });
});
