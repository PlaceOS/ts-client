/**
 * The two hashes that the login needs, without a dependency.
 *
 * - MD5 makes the OAuth client ID from the redirect URI. PlaceOS registers applications with this
 *   ID, so it must stay MD5. It is not used for security.
 * - SHA-256 makes the PKCE challenge. `crypto.subtle` has SHA-256, but only in a secure context,
 *   and PlaceOS kiosks can run on plain HTTP. This version is synchronous and runs everywhere.
 */
import { assert } from '../core/assert.ts';

/** A redirect URI is short. This stops a hash of a value that is not a URI by mistake. */
export const HASH_INPUT_BYTES_MAX = 64 * 1024;

/** The MD5 of the UTF-8 bytes of `text`, as 32 lower case hex characters. */
export function md5Hex(text: string): string {
    const input = new TextEncoder().encode(text);
    assert(
        input.length <= HASH_INPUT_BYTES_MAX,
        'the hash input is less than HASH_INPUT_BYTES_MAX',
    );
    const blocks = padBlocks(input, 'little');
    const state = new Uint32Array([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476]);
    const words = new Uint32Array(16);
    for (let offset = 0; offset < blocks.length; offset += 64) {
        for (let index = 0; index < 16; index += 1) {
            words[index] = readUint32(blocks, offset + index * 4, 'little');
        }
        let a = state[0] ?? 0;
        let b = state[1] ?? 0;
        let c = state[2] ?? 0;
        let d = state[3] ?? 0;
        for (let step = 0; step < 64; step += 1) {
            let mix: number;
            let wordIndex: number;
            if (step < 16) {
                mix = (b & c) | (~b & d);
                wordIndex = step;
            } else if (step < 32) {
                mix = (d & b) | (~d & c);
                wordIndex = (5 * step + 1) % 16;
            } else if (step < 48) {
                mix = b ^ c ^ d;
                wordIndex = (3 * step + 5) % 16;
            } else {
                mix = c ^ (b | ~d);
                wordIndex = (7 * step) % 16;
            }
            const sum = (a + mix + (MD5_CONSTANTS[step] ?? 0) + (words[wordIndex] ?? 0)) | 0;
            a = d;
            d = c;
            c = b;
            b = (b + rotateLeft(sum, MD5_SHIFTS[step] ?? 0)) | 0;
        }
        state[0] = (state[0] ?? 0) + a;
        state[1] = (state[1] ?? 0) + b;
        state[2] = (state[2] ?? 0) + c;
        state[3] = (state[3] ?? 0) + d;
    }
    let hex = '';
    for (const word of state) {
        for (let byte = 0; byte < 4; byte += 1) {
            hex += ((word >>> (byte * 8)) & 0xff).toString(16).padStart(2, '0');
        }
    }
    return hex;
}

/** The SHA-256 of `input`. */
export function sha256(input: Uint8Array): Uint8Array {
    assert(
        input.length <= HASH_INPUT_BYTES_MAX,
        'the hash input is less than HASH_INPUT_BYTES_MAX',
    );
    const blocks = padBlocks(input, 'big');
    const state = new Uint32Array([
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab,
        0x5be0cd19,
    ]);
    const words = new Uint32Array(64);
    for (let offset = 0; offset < blocks.length; offset += 64) {
        for (let index = 0; index < 16; index += 1) {
            words[index] = readUint32(blocks, offset + index * 4, 'big');
        }
        for (let index = 16; index < 64; index += 1) {
            const w15 = words[index - 15] ?? 0;
            const w2 = words[index - 2] ?? 0;
            const s0 = rotateRight(w15, 7) ^ rotateRight(w15, 18) ^ (w15 >>> 3);
            const s1 = rotateRight(w2, 17) ^ rotateRight(w2, 19) ^ (w2 >>> 10);
            words[index] = (words[index - 16] ?? 0) + s0 + (words[index - 7] ?? 0) + s1;
        }
        let a = state[0] ?? 0;
        let b = state[1] ?? 0;
        let c = state[2] ?? 0;
        let d = state[3] ?? 0;
        let e = state[4] ?? 0;
        let f = state[5] ?? 0;
        let g = state[6] ?? 0;
        let h = state[7] ?? 0;
        for (let index = 0; index < 64; index += 1) {
            const s1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
            const choice = (e & f) ^ (~e & g);
            const t1 = (h + s1 + choice + (SHA256_CONSTANTS[index] ?? 0) + (words[index] ?? 0)) | 0;
            const s0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
            const majority = (a & b) ^ (a & c) ^ (b & c);
            const t2 = (s0 + majority) | 0;
            h = g;
            g = f;
            f = e;
            e = (d + t1) | 0;
            d = c;
            c = b;
            b = a;
            a = (t1 + t2) | 0;
        }
        const results = [a, b, c, d, e, f, g, h];
        for (let index = 0; index < 8; index += 1) {
            state[index] = (state[index] ?? 0) + (results[index] ?? 0);
        }
    }
    const output = new Uint8Array(32);
    for (let index = 0; index < 8; index += 1) {
        const word = state[index] ?? 0;
        output[index * 4] = word >>> 24;
        output[index * 4 + 1] = (word >>> 16) & 0xff;
        output[index * 4 + 2] = (word >>> 8) & 0xff;
        output[index * 4 + 3] = word & 0xff;
    }
    return output;
}

/** Base64 with the URL alphabet and no padding, as PKCE needs (RFC 7636). */
export function base64Url(bytes: Uint8Array): string {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

type Endian = 'little' | 'big';

/** Adds the padding of MD5 and SHA-256: a 1 bit, zeros, and the bit length in 8 bytes. */
function padBlocks(input: Uint8Array, endian: Endian): Uint8Array {
    const blockCount = Math.ceil((input.length + 9) / 64);
    const blocks = new Uint8Array(blockCount * 64);
    blocks.set(input);
    blocks[input.length] = 0x80;
    // The input is less than HASH_INPUT_BYTES_MAX, so the bit length fits in 32 bits.
    const bitLength = input.length * 8;
    assert(bitLength < 2 ** 32, 'the bit length fits in 32 bits');
    const lengthOffset = blocks.length - 8;
    for (let byte = 0; byte < 4; byte += 1) {
        const value = (bitLength >>> (byte * 8)) & 0xff;
        if (endian === 'little') {
            blocks[lengthOffset + byte] = value;
        } else {
            blocks[blocks.length - 1 - byte] = value;
        }
    }
    return blocks;
}

function readUint32(bytes: Uint8Array, offset: number, endian: Endian): number {
    const b0 = bytes[offset] ?? 0;
    const b1 = bytes[offset + 1] ?? 0;
    const b2 = bytes[offset + 2] ?? 0;
    const b3 = bytes[offset + 3] ?? 0;
    if (endian === 'little') return (b0 | (b1 << 8) | (b2 << 16) | (b3 << 24)) >>> 0;
    return ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;
}

function rotateLeft(value: number, count: number): number {
    return (value << count) | (value >>> (32 - count));
}

function rotateRight(value: number, count: number): number {
    return (value >>> count) | (value << (32 - count));
}

const MD5_SHIFTS: readonly number[] = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9,
    14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

/** `floor(abs(sin(i + 1)) * 2^32)` for each step, as the MD5 specification gives them. */
const MD5_CONSTANTS: readonly number[] = Array.from(
    { length: 64 },
    (_, index) => Math.floor(Math.abs(Math.sin(index + 1)) * 2 ** 32) | 0,
);

const SHA256_CONSTANTS: readonly number[] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];
