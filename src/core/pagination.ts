/** A longer `Link` header is not from this API. The parser ignores it. */
export const LINK_HEADER_LENGTH_MAX = 8_192;

/** The pagination data of a `query` response. */
export interface PageInfo {
    /** The `X-Total-Count` header: the number of results for all pages. */
    readonly total: number | null;
    /** The `offset` of the next page, from the `Link` header. `null` on the last page. */
    readonly next_offset: number | null;
}

/**
 * Reads the pagination headers of a `query` response. `next()` of the reply uses `next_offset`
 * to request the next page.
 *
 * ```ts
 * const first = await zones.query({ limit: 100 });
 * if (first.ok) {
 *     const { total, next_offset } = pageInfo(first.value.headers);
 * }
 * ```
 */
export function pageInfo(headers: Headers): PageInfo {
    return {
        total: parseCount(headers.get('x-total-count')),
        next_offset: parseNextOffset(headers.get('link')),
    };
}

function parseCount(text: string | null): number | null {
    if (text === null) return null;
    const count = Number(text);
    if (Number.isSafeInteger(count) && count >= 0) return count;
    return null;
}

/** The server sends `<path?query>; rel="next"`. Other links are ignored. */
function parseNextOffset(header: string | null): number | null {
    if (header === null) return null;
    if (header.length > LINK_HEADER_LENGTH_MAX) return null;
    for (const link of header.split(',')) {
        const match = /^\s*<([^>]*)>\s*;\s*rel="?next"?\s*$/.exec(link);
        if (match === null) continue;
        const target = match[1] ?? '';
        // The target is often a path only. The base makes it a URL that `URL` can parse.
        if (!URL.canParse(target, 'http://base.invalid')) return null;
        const offset = new URL(target, 'http://base.invalid').searchParams.get('offset');
        return parseCount(offset);
    }
    return null;
}
