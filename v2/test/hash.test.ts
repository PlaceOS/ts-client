/**
 * Goal: the hashes give the standard values, so the client ID matches v1 and PKCE matches the
 * server. Method: compare with published test vectors and with the hashes of Bun.
 */
import { expect, test } from 'bun:test';
import { base64Url, md5Hex, sha256 } from '../src/auth/hash.ts';

const hex = (bytes: Uint8Array) =>
    [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');

test('MD5 gives the RFC 1321 test values', () => {
    expect(md5Hex('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(md5Hex('abc')).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(md5Hex('The quick brown fox jumps over the lazy dog')).toBe(
        '9e107d9d372bb6826bd81d3542a419d6',
    );
});

test('SHA-256 gives the PKCE challenge of the RFC 7636 example', () => {
    const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
    expect(base64Url(sha256(new TextEncoder().encode(verifier)))).toBe(
        'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    );
});

test('both hashes match Bun for each length across the block boundaries', () => {
    // Lengths 0 to 199 cover inputs of one, two and four blocks, and multi-byte characters.
    for (let length = 0; length < 200; length += 1) {
        const text = 'é'.repeat(length % 9) + 'x'.repeat(length);
        expect(md5Hex(text)).toBe(new Bun.CryptoHasher('md5').update(text).digest('hex'));
        const bytes = new TextEncoder().encode(text);
        expect(hex(sha256(bytes))).toBe(new Bun.CryptoHasher('sha256').update(text).digest('hex'));
    }
});
