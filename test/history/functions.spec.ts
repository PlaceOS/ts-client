import { afterEach, describe, expect, test, vi } from 'vitest';

import * as Auth from '../../src/auth/functions';
import {
    queryGroupHistory,
    showGroupHistory,
} from '../../src/groups/functions';
import * as SERVICE from '../../src/history/functions';
import { PlaceHistory } from '../../src/history/history';
import * as Http from '../../src/http/functions';
import * as Resources from '../../src/resources/functions';

describe('History API', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('should allow querying history', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        const list = await SERVICE.queryHistory({
            resource_types: ['zone', 'sys'],
            correlation_id: 'group-1',
        });
        expect(list.data[0]).toBeInstanceOf(PlaceHistory);
        expect(spy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                path: 'history',
                query_params: {
                    resource_types: ['zone', 'sys'],
                    correlation_id: 'group-1',
                },
            }),
        );
    });

    test('should allow showing a history entry', async () => {
        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        const spy = vi.spyOn(Http, 'get').mockResolvedValue({ id: 'h-1' });
        const item = await SERVICE.showHistory('h-1');
        expect(item).toBeInstanceOf(PlaceHistory);
        expect(item.id).toBe('h-1');
        expect(spy).toHaveBeenLastCalledWith('/api/engine/v2/history/h-1');
    });

    test('should allow restoring a deleted resource', async () => {
        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        const spy = vi
            .spyOn(Http, 'post')
            .mockResolvedValue({ id: 'zone-1' } as any);
        expect(await SERVICE.undeleteResource('zone', 'zone-1')).toEqual({
            id: 'zone-1',
        });
        expect(spy).toHaveBeenLastCalledWith(
            '/api/engine/v2/history/undelete?resource_type=zone&resource_id=zone-1',
            null,
        );
    });

    test('should return group history as history entries', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        const list = await queryGroupHistory({ group_id: 'group-1' });
        expect(list.data[0]).toBeInstanceOf(PlaceHistory);

        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        vi.spyOn(Http, 'get').mockResolvedValue({ id: 'h-1' });
        expect(await showGroupHistory('h-1')).toBeInstanceOf(PlaceHistory);
    });
});
