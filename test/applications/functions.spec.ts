import { describe, expect, test, vi } from 'vitest';
import { PlaceApplication } from '../../src/applications/application';
import * as SERVICE from '../../src/applications/functions';
import * as Resources from '../../src/resources/functions';

describe('Applications API', () => {
    test('should allow querying applications', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        let list = await SERVICE.queryApplications();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceApplication);
        list = await SERVICE.queryApplications({});
    });

    test('should allow showing application details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.showApplication('1');
        expect(item).toBeInstanceOf(PlaceApplication);
    });

    test('should allow creating new applications', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.addApplication({});
        expect(item).toBeInstanceOf(PlaceApplication);
    });

    test('should allow updating application details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateApplication('1', {});
        expect(item).toBeInstanceOf(PlaceApplication);
        item = await SERVICE.updateApplication('1', {}, 'patch');
    });

    test('should allow removing applications', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeApplication('1');
        expect(item).toBeFalsy();
    });
});
