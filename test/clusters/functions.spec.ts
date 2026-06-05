import { describe, expect, test, vi } from 'vitest';
import * as Auth from '../../src/auth/functions';
import { PlaceCluster } from '../../src/clusters/cluster';
import * as SERVICE from '../../src/clusters/functions';
import { PlaceProcess } from '../../src/clusters/process';
import * as Http from '../../src/http/functions';
import * as Resources from '../../src/resources/functions';

vi.mock('../../src/resources/functions');

describe('Cluster API', () => {
    test('should allow querying clusters', async () => {
        (Resources.query as any) = vi
            .fn()
            .mockImplementation((_) => Promise.resolve({ data: [_.fn({})] }));
        const list = await SERVICE.queryClusters();
        expect(list).toBeTruthy();
        expect(list?.data.length).toBe(1);
        expect(list?.data[0]).toBeInstanceOf(PlaceCluster);
    });

    test('should allow querying processes', async () => {
        (Resources.show as any) = vi
            .fn()
            .mockImplementation((_) => Promise.resolve(_.fn([{}]) as any));
        const list = await SERVICE.queryProcesses('1');
        expect(list).toBeTruthy();
        expect(list.length).toBe(1);
        expect(list[0]).toBeInstanceOf(PlaceProcess);
    });

    test('should allow terminating processes', async () => {
        (Resources.remove as any) = vi
            .fn()
            .mockImplementation(() => Promise.resolve());
        await SERVICE.terminateProcess('1', { driver: 'driver-1' });
    });

    test('should allow triggering cluster rebalance', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'post');
        httpSpy.mockImplementation(() => Promise.resolve({}) as any);

        await SERVICE.clusterRebalance();
        expect(httpSpy).toHaveBeenCalledWith(
            '/api/engine/v2/cluster/rebalance',
            {},
        );
    });

    test('should allow getting cluster versions', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'get');
        httpSpy.mockImplementation(
            () =>
                Promise.resolve({
                    'node-1': '1.0.0',
                    'node-2': '1.0.1',
                }) as any,
        );

        const result = await SERVICE.clusterVersions();
        expect(result).toBeTruthy();
        expect(result!['node-1']).toBe('1.0.0');
        expect(httpSpy).toHaveBeenCalledWith('/api/engine/v2/cluster/versions');
    });
});
