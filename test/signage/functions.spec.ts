import { describe, expect, test, vi } from 'vitest';
import * as Resources from '../../src/resources/functions';
import * as SERVICE from '../../src/signage/functions';

describe('Signage API', () => {
    test('should allow listing media tags', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!(['promo']) as any));

        const tags = await SERVICE.listSignageMediaTags({
            group_id: 'group-123',
        });

        expect(tags).toEqual(['promo']);
        expect(spy).toHaveBeenCalledWith({
            id: 'tags',
            query_params: { group_id: 'group-123' },
            fn: expect.any(Function),
            path: 'signage/media',
        });
    });
});
