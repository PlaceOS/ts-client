import { describe, expect, test, vi } from 'vitest';
import * as Auth from '../../src/auth/functions';
import { PlaceEdge } from '../../src/edge/edge';
import * as SERVICE from '../../src/edge/functions';
import * as Resources from '../../src/resources/functions';

describe('Edge API', () => {
    test('should allow querying Edges', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        let list = await SERVICE.queryEdges();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceEdge);
        list = await SERVICE.queryEdges({});
    });

    test('should allow showing Edge details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.showEdge('1');
        expect(item).toBeInstanceOf(PlaceEdge);
    });

    test('should allow creating new Edges', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.addEdge({});
        expect(item).toBeInstanceOf(PlaceEdge);
        item = await SERVICE.addEdge({});
    });

    test('should allow updating Edge details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateEdge('1', {});
        expect(item).toBeInstanceOf(PlaceEdge);
        item = await SERVICE.updateEdge('1', {}, 'patch');
    });

    test('should allow removing Edges', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeEdge('1');
        expect(item).toBeFalsy();
    });

    test('should allow getting token for Edge', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation(() => Promise.resolve({ token: 's' }));
        const item = await SERVICE.retrieveEdgeToken('1');
        expect(item).toBeTruthy();
        expect(item.token).toBe('s');
    });

    test('should generate correct edge control websocket URL for HTTPS', () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('https://example.com/api/engine/v2/');

        const url = SERVICE.edgeControlUrl();
        expect(url).toBe('wss://example.com/api/engine/v2/edges/control');
    });

    test('should generate correct edge control websocket URL for HTTP', () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('http://example.com/api/engine/v2/');

        const url = SERVICE.edgeControlUrl();
        expect(url).toBe('ws://example.com/api/engine/v2/edges/control');
    });
});
