import { of } from 'rxjs';
import { describe, expect, test, vi } from 'vitest';
import { PlaceShortUrl } from '../../src/short-url/short-url.class';
import * as SERVICE from '../../src/short-url/functions';
import * as Resources from '../../src/resources/functions';
import * as Http from '../../src/http/functions';
import * as Auth from '../../src/auth/functions';

describe('Short URL API', () => {
    test('should allow querying short URLs', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) => of({ data: [_.fn!({})] } as any));
        let list = await SERVICE.queryShortUrls().toPromise();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceShortUrl);
        list = await SERVICE.queryShortUrls({}).toPromise();
    });

    test('should allow showing short URL details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.showShortUrl('1').toPromise();
        expect(item).toBeInstanceOf(PlaceShortUrl);
        item = await SERVICE.showShortUrl('1', {}).toPromise();
    });

    test('should allow creating new short URLs', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        const item = await SERVICE.addShortUrl({}).toPromise();
        expect(item).toBeInstanceOf(PlaceShortUrl);
    });

    test('should allow updating short URL details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.updateShortUrl('1', {}).toPromise();
        expect(item).toBeInstanceOf(PlaceShortUrl);
        item = await SERVICE.updateShortUrl('1', {}, 'patch').toPromise();
        item = await SERVICE.updateShortUrl('1', {}, 'put').toPromise();
    });

    test('should allow removing short URLs', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        let item = await SERVICE.removeShortUrl('1', {}).toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeShortUrl('1').toPromise();
    });
});

describe('Short URL Redirect', () => {
    test('should generate correct redirect URL', () => {
        const spy = vi.spyOn(Auth, 'apiEndpoint');
        spy.mockReturnValue('/api/engine/v2/');
        const url = SERVICE.shortUrlRedirectUrl('test-id');
        expect(url).toBe('/api/engine/v2/short_url/test-id/redirect');
    });

    test('should encode special characters in ID', () => {
        const spy = vi.spyOn(Auth, 'apiEndpoint');
        spy.mockReturnValue('/api/engine/v2/');
        const url = SERVICE.shortUrlRedirectUrl('test/id with spaces');
        expect(url).toBe('/api/engine/v2/short_url/test%2Fid%20with%20spaces/redirect');
    });
});

describe('Short URL QR Code SVG', () => {
    test('should fetch SVG QR code', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'get');
        httpSpy.mockImplementation(() => of('<svg>...</svg>') as any);

        const result = await SERVICE.getShortUrlQrCodeSvg('test-id').toPromise();
        expect(result).toBe('<svg>...</svg>');
        expect(httpSpy).toHaveBeenCalledWith(
            '/api/engine/v2/short_url/test-id/qr_code.svg',
            { response_type: 'text' }
        );
    });
});

describe('Short URL QR Code PNG URL', () => {
    test('should generate correct PNG QR code URL', () => {
        const spy = vi.spyOn(Auth, 'apiEndpoint');
        spy.mockReturnValue('/api/engine/v2/');
        const url = SERVICE.shortUrlQrCodePngUrl('test-id');
        expect(url).toBe('/api/engine/v2/short_url/test-id/qr_code.png');
    });

    test('should include size parameter', () => {
        const spy = vi.spyOn(Auth, 'apiEndpoint');
        spy.mockReturnValue('/api/engine/v2/');
        const url = SERVICE.shortUrlQrCodePngUrl('test-id', { size: 256 });
        expect(url).toBe('/api/engine/v2/short_url/test-id/qr_code.png?size=256');
    });

    test('should encode special characters in ID', () => {
        const spy = vi.spyOn(Auth, 'apiEndpoint');
        spy.mockReturnValue('/api/engine/v2/');
        const url = SERVICE.shortUrlQrCodePngUrl('test/id');
        expect(url).toBe('/api/engine/v2/short_url/test%2Fid/qr_code.png');
    });
});

describe('QR Code URL Generator', () => {
    test('should generate correct QR code URL with required params', () => {
        const spy = vi.spyOn(Auth, 'apiEndpoint');
        spy.mockReturnValue('/api/engine/v2/');
        const url = SERVICE.qrCodeUrl({ content: 'https://example.com', id: 'qr-123' });
        expect(url).toContain('/api/engine/v2/short_url/qr_code?');
        expect(url).toContain('content=https%3A%2F%2Fexample.com');
        expect(url).toContain('id=qr-123');
        expect(url).toContain('format=svg');
    });

    test('should support PNG format', () => {
        const spy = vi.spyOn(Auth, 'apiEndpoint');
        spy.mockReturnValue('/api/engine/v2/');
        const url = SERVICE.qrCodeUrl({ content: 'test', id: 'qr-123', format: 'png' });
        expect(url).toContain('format=png');
    });

    test('should include size parameter', () => {
        const spy = vi.spyOn(Auth, 'apiEndpoint');
        spy.mockReturnValue('/api/engine/v2/');
        const url = SERVICE.qrCodeUrl({ content: 'test', id: 'qr-123', size: 128 });
        expect(url).toContain('size=128');
    });
});

describe('Generate QR Code', () => {
    test('should generate SVG QR code with custom content', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'get');
        httpSpy.mockImplementation(() => of('<svg>custom</svg>') as any);

        const result = await SERVICE.generateQrCode({
            content: 'https://example.com',
            id: 'qr-123'
        }).toPromise();

        expect(result).toBe('<svg>custom</svg>');
        expect(httpSpy).toHaveBeenCalledWith(
            expect.stringContaining('/api/engine/v2/short_url/qr_code?'),
            { response_type: 'text' }
        );
    });

    test('should include size in request', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'get');
        httpSpy.mockImplementation(() => of('<svg></svg>') as any);

        await SERVICE.generateQrCode({
            content: 'test',
            id: 'qr-123',
            size: 200
        }).toPromise();

        expect(httpSpy).toHaveBeenCalledWith(
            expect.stringContaining('size=200'),
            expect.any(Object)
        );
    });
});
