import { afterEach, describe, expect, test, vi } from 'vitest';
import * as Auth from '../../src/auth/functions';
import * as Http from '../../src/http/functions';
import { proxyUrl } from '../../src/url-proxy/functions';

describe('URL proxy API', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('should proxy binary content without leaking PlaceOS auth', async () => {
        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        const blob = new Blob(['image-data'], { type: 'image/png' });
        const spy = vi.spyOn(Http, 'get');
        spy.mockResolvedValue(blob);

        const result = await proxyUrl(
            'https://example.com/image.png?size=large',
            { headers: { Accept: 'image/png' } },
        );

        expect(result).toBe(blob);
        expect(spy).toHaveBeenCalledWith(
            '/api/engine/v2/proxy?url=https%3A%2F%2Fexample.com%2Fimage.png%3Fsize%3Dlarge',
            {
                headers: { Accept: 'image/png' },
                response_type: 'blob',
                skip_auth: true,
            },
        );
    });
});
