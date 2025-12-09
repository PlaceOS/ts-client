import { beforeEach, describe, expect, test } from 'vitest';
import { PlaceShortUrl } from '../../src/short-url/short-url.class';

describe('PlaceShortUrl', () => {
    let shortUrl: PlaceShortUrl;

    beforeEach(() => {
        shortUrl = new PlaceShortUrl({
            id: 'short-123',
            name: 'Test Short URL',
            uri: 'https://example.com/long-url-path',
            description: 'A test short URL',
            user_id: 'user-456',
            user_email: 'user@example.com',
            user_name: 'Test User',
            redirect_count: 42,
            enabled: true,
            valid_from: '2024-01-01T00:00:00Z',
            valid_until: '2024-12-31T23:59:59Z',
            authority_id: 'auth-789',
            created_at: 1704067200,
            updated_at: 1704153600,
        });
    });

    test('should create instance', () => {
        expect(shortUrl).toBeTruthy();
        expect(shortUrl).toBeInstanceOf(PlaceShortUrl);
    });

    test('should expose id', () => {
        expect(shortUrl.id).toBe('short-123');
    });

    test('should expose name', () => {
        expect(shortUrl.name).toBe('Test Short URL');
    });

    test('should expose uri', () => {
        expect(shortUrl.uri).toBe('https://example.com/long-url-path');
    });

    test('should expose description', () => {
        expect(shortUrl.description).toBe('A test short URL');
    });

    test('should expose user_id', () => {
        expect(shortUrl.user_id).toBe('user-456');
    });

    test('should expose user_email', () => {
        expect(shortUrl.user_email).toBe('user@example.com');
    });

    test('should expose user_name', () => {
        expect(shortUrl.user_name).toBe('Test User');
    });

    test('should expose redirect_count', () => {
        expect(shortUrl.redirect_count).toBe(42);
    });

    test('should expose enabled', () => {
        expect(shortUrl.enabled).toBe(true);
    });

    test('should expose valid_from', () => {
        expect(shortUrl.valid_from).toBe('2024-01-01T00:00:00Z');
    });

    test('should expose valid_until', () => {
        expect(shortUrl.valid_until).toBe('2024-12-31T23:59:59Z');
    });

    test('should expose authority_id', () => {
        expect(shortUrl.authority_id).toBe('auth-789');
    });

    test('should expose created_at', () => {
        expect(shortUrl.created_at).toBe(1704067200);
    });

    test('should expose updated_at', () => {
        expect(shortUrl.updated_at).toBe(1704153600);
    });

    test('should use default values for missing properties', () => {
        const emptyShortUrl = new PlaceShortUrl({});
        expect(emptyShortUrl.id).toBe('');
        expect(emptyShortUrl.name).toBe('');
        expect(emptyShortUrl.uri).toBe('');
        expect(emptyShortUrl.description).toBe('');
        expect(emptyShortUrl.user_id).toBe('');
        expect(emptyShortUrl.user_email).toBe('');
        expect(emptyShortUrl.user_name).toBe('');
        expect(emptyShortUrl.redirect_count).toBe(0);
        expect(emptyShortUrl.enabled).toBe(true);
        expect(emptyShortUrl.valid_from).toBe('');
        expect(emptyShortUrl.valid_until).toBe('');
        expect(emptyShortUrl.authority_id).toBe('');
        expect(emptyShortUrl.created_at).toBe(0);
        expect(emptyShortUrl.updated_at).toBe(0);
    });

    test('should handle enabled=false explicitly', () => {
        const disabledShortUrl = new PlaceShortUrl({ enabled: false });
        expect(disabledShortUrl.enabled).toBe(false);
    });
});
