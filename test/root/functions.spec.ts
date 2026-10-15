import { afterEach, describe, expect, test, vi } from 'vitest';
import * as Auth from '../../src/auth/functions';
import * as Http from '../../src/http/functions';
import * as SERVICE from '../../src/root/functions';

describe('Root API', () => {
    afterEach(() => vi.restoreAllMocks());

    const status = {
        state: 'clearing',
        clear: true,
        started_at: '2026-10-15T00:00:00Z',
        cleared: 0,
        metadata: 0,
    };

    test('should allow starting a resync of the MQTT brokers', async () => {
        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        const http = vi
            .spyOn(Http, 'post')
            .mockImplementation(() => Promise.resolve(status) as any);

        expect(await SERVICE.sourceResync(true)).toEqual(status);
        expect(http).toHaveBeenCalledWith(
            '/api/engine/v2/source/resync?clear=true',
            {},
        );

        await SERVICE.sourceResync();
        expect(http).toHaveBeenLastCalledWith(
            '/api/engine/v2/source/resync?clear=false',
            {},
        );
    });

    test('should allow reading where the resync got to', async () => {
        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        const http = vi
            .spyOn(Http, 'get')
            .mockImplementation(() => Promise.resolve(status) as any);

        expect(await SERVICE.sourceResyncStatus()).toEqual(status);
        expect(http).toHaveBeenCalledWith('/api/engine/v2/source/resync');
    });
});
