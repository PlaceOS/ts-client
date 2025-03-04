import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';

import { PlaceSAMLSource } from '../../src/saml-sources/saml-source';

describe('PlaceSamlSource', () => {
    let auth_source: PlaceSAMLSource;

    beforeEach(() => {
        auth_source = new PlaceSAMLSource({
            id: 'dep-test',
            authority_id: 'test-authority',
            idp_cert: 'test',
            created_at: 999,
        });
    });

    test('should create instance', () => {
        expect(auth_source).toBeTruthy();
        expect(auth_source).toBeInstanceOf(PlaceSAMLSource);
    });

    test('should not allow editing the authority ID', () => {
        expect(auth_source.authority_id).toBe('test-authority');
    });

    test('should allow editing fields', () => {
        expect(auth_source.idp_cert).toBe('test');
    });
});
