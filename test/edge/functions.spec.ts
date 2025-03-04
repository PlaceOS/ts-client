import { of } from 'rxjs';
import { describe, expect, test, vi } from 'vitest';
import { PlaceEdge } from '../../src/edge/edge';
import * as SERVICE from '../../src/edge/functions';
import * as Resources from '../../src/resources/functions';

describe('SAML Auth Sources API', () => {
    test('should allow querying Edges', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) => of({ data: [_.fn!({})] } as any));
        let list = await SERVICE.queryEdges().toPromise();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceEdge);
        list = await SERVICE.queryEdges({}).toPromise();
    });

    test('should allow showing Edge details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.showEdge('1').toPromise();
        expect(item).toBeInstanceOf(PlaceEdge);
        item = await SERVICE.showEdge('1', {}).toPromise();
    });

    test('should allow creating new Edges', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.addEdge({}).toPromise();
        expect(item).toBeInstanceOf(PlaceEdge);
        item = await SERVICE.addEdge({}).toPromise();
    });

    test('should allow updating Edge details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.updateEdge('1', {}).toPromise();
        expect(item).toBeInstanceOf(PlaceEdge);
        item = await SERVICE.updateEdge('1', {}, 'patch').toPromise();
    });

    test('should allow removing Edges', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        let item = await SERVICE.removeEdge('1').toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeEdge('1', {}).toPromise();
    });

    test('should allow removing Edges', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        let item = await SERVICE.removeEdge('1').toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeEdge('1', {}).toPromise();
    });

    test('should allow getting token for Edge', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation(() => of({ token: 's' }));
        const item = await SERVICE.retrieveEdgeToken('1').toPromise();
        expect(item).toBeTruthy();
        expect(item.token).toBe('s');
    });
});
