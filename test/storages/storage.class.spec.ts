import { beforeEach, describe, expect, test } from 'vitest';
import { PlaceStorage } from '../../src/storages/storage.class';

describe('PlaceStorage', () => {
    let storage: PlaceStorage;

    beforeEach(() => {
        storage = new PlaceStorage({
            id: 'storage-123',
            storage_type: 's3',
            bucket_name: 'my-bucket',
            region: 'us-east-1',
            access_key: 'AKIAIOSFODNN7EXAMPLE',
            access_secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
            authority_id: 'auth-456',
            endpoint: 'https://s3.us-east-1.amazonaws.com',
            is_default: true,
            ext_filter: ['.jpg', '.png', '.pdf'],
            mime_filter: ['image/jpeg', 'image/png', 'application/pdf'],
            created_at: 1704067200,
            updated_at: 1704153600,
        });
    });

    test('should create instance', () => {
        expect(storage).toBeTruthy();
        expect(storage).toBeInstanceOf(PlaceStorage);
    });

    test('should expose id', () => {
        expect(storage.id).toBe('storage-123');
    });

    test('should expose storage_type', () => {
        expect(storage.storage_type).toBe('s3');
    });

    test('should expose bucket_name', () => {
        expect(storage.bucket_name).toBe('my-bucket');
    });

    test('should expose region', () => {
        expect(storage.region).toBe('us-east-1');
    });

    test('should expose access_key', () => {
        expect(storage.access_key).toBe('AKIAIOSFODNN7EXAMPLE');
    });

    test('should expose access_secret', () => {
        expect(storage.access_secret).toBe('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
    });

    test('should expose authority_id', () => {
        expect(storage.authority_id).toBe('auth-456');
    });

    test('should expose endpoint', () => {
        expect(storage.endpoint).toBe('https://s3.us-east-1.amazonaws.com');
    });

    test('should expose is_default', () => {
        expect(storage.is_default).toBe(true);
    });

    test('should expose ext_filter', () => {
        expect(storage.ext_filter).toEqual(['.jpg', '.png', '.pdf']);
    });

    test('should expose mime_filter', () => {
        expect(storage.mime_filter).toEqual(['image/jpeg', 'image/png', 'application/pdf']);
    });

    test('should expose created_at', () => {
        expect(storage.created_at).toBe(1704067200);
    });

    test('should expose updated_at', () => {
        expect(storage.updated_at).toBe(1704153600);
    });

    test('should use default values for missing properties', () => {
        const emptyStorage = new PlaceStorage({});
        expect(emptyStorage.id).toBe('');
        expect(emptyStorage.storage_type).toBe(null);
        expect(emptyStorage.bucket_name).toBe('');
        expect(emptyStorage.region).toBe('');
        expect(emptyStorage.access_key).toBe('');
        expect(emptyStorage.access_secret).toBe('');
        expect(emptyStorage.authority_id).toBe('');
        expect(emptyStorage.endpoint).toBe('');
        expect(emptyStorage.is_default).toBe(false);
        expect(emptyStorage.ext_filter).toEqual([]);
        expect(emptyStorage.mime_filter).toEqual([]);
        expect(emptyStorage.created_at).toBe(0);
        expect(emptyStorage.updated_at).toBe(0);
    });

    test('should handle is_default=false explicitly', () => {
        const nonDefaultStorage = new PlaceStorage({ is_default: false });
        expect(nonDefaultStorage.is_default).toBe(false);
    });

    test('should support azure storage type', () => {
        const azureStorage = new PlaceStorage({ storage_type: 'azure' });
        expect(azureStorage.storage_type).toBe('azure');
    });

    test('should support google storage type', () => {
        const googleStorage = new PlaceStorage({ storage_type: 'google' });
        expect(googleStorage.storage_type).toBe('google');
    });
});
