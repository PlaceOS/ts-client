import { afterEach, describe, expect, test, vi } from 'vitest';
import * as Auth from '../../src/auth/functions';
import { showGroupFeatures } from '../../src/groups/functions';
import { PlaceGroup } from '../../src/groups/group';
import * as Http from '../../src/http/functions';

describe('Groups API', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('should get effective group features', async () => {
        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        const features = { signage: { templates: true } };
        const spy = vi.spyOn(Http, 'get').mockResolvedValue(features);

        expect(await showGroupFeatures('grp-1')).toEqual(features);
        expect(spy).toHaveBeenLastCalledWith(
            '/api/engine/v2/groups/grp-1/features',
        );

        await showGroupFeatures('grp-1', { subsystem: 'signage' });
        expect(spy).toHaveBeenLastCalledWith(
            '/api/engine/v2/groups/grp-1/features?subsystem=signage',
        );
    });

    test('should default group features to empty', () => {
        expect(new PlaceGroup().features).toEqual({});
    });
});
