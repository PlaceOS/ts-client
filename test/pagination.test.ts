/**
 * Goal: `pageInfo` reads the pagination headers that the server sends, and ignores bad values.
 * Method: give it headers in the server format, and headers that are malformed.
 */
import { expect, test } from 'bun:test';
import { pageInfo } from '../src/core/pagination.ts';

test('reads the total and the offset of the next page', () => {
    const headers = new Headers({
        'X-Total-Count': '250',
        Link: '</api/engine/v2/zones?limit=100&offset=100>; rel="next"',
    });
    expect(pageInfo(headers)).toEqual({ total: 250, nextOffset: 100 });
});

test('gives null on the last page and for values that are not counts', () => {
    expect(pageInfo(new Headers({ 'X-Total-Count': '3' }))).toEqual({ total: 3, nextOffset: null });
    const bad = new Headers({ 'X-Total-Count': '-1', Link: '</zones?offset=1.5>; rel="next"' });
    expect(pageInfo(bad)).toEqual({ total: null, nextOffset: null });
    const other = new Headers({ Link: '</zones?offset=5>; rel="prev"' });
    expect(pageInfo(other)).toEqual({ total: null, nextOffset: null });
});
