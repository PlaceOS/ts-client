import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { of } from 'rxjs';
import { PlaceApplication } from '../../src/applications/application';
import * as SERVICE from '../../src/applications/functions';
import * as Resources from '../../src/resources/functions';

describe('Applications API', () => {
    test('should allow querying applications', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) => of({ data: [_.fn!({})] } as any));
        let list = await SERVICE.queryApplications().toPromise();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceApplication);
        list = await SERVICE.queryApplications({}).toPromise();
    });

    test('should allow showing application details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.showApplication('1').toPromise();
        expect(item).toBeInstanceOf(PlaceApplication);
        item = await SERVICE.showApplication('1', {}).toPromise();
    });

    test('should allow creating new applications', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.addApplication({}).toPromise();
        expect(item).toBeInstanceOf(PlaceApplication);
    });

    test('should allow updating application details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.updateApplication('1', {}).toPromise();
        expect(item).toBeInstanceOf(PlaceApplication);
        item = await SERVICE.updateApplication('1', {}, 'patch').toPromise();
    });

    test('should allow removing applications', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        let item = await SERVICE.removeApplication('1', {}).toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeApplication('1').toPromise();
    });
});
