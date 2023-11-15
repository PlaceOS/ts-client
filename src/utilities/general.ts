import { HashMap } from './types';

declare global {
    interface Window {
        debug: boolean;
    }
}
/**
 * @hidden
 */
export type ConsoleIOStream =
    | 'log'
    | 'warn'
    | 'debug'
    | 'error'
    | 'info'
    | 'group'
    | 'groupCollapsed'
    | 'groupEnd';
/* istanbul ignore next */
/**
 * Log message to the console
 * @hidden
 * @param type Where the message is from
 * @param msg Body of the message
 * @param args Javascript data to post after the message
 * @param out IO stream to post message to
 * @param color CSS colour to set the `type` value printed to the console
 */
export function log(
    type: string,
    msg: string,
    args?: any,
    out: ConsoleIOStream = 'debug',
    color?: string
) {
    if (window.debug) {
        const clr = color ? color : '#009688';
        const COLOURS = ['color: #0288D1', `color:${clr}`, 'color: default'];
        if (args) {
            if (consoleHasColours()) {
                console[out](
                    `%c[PlaceOS]%c[${type}] %c${msg}`,
                    ...COLOURS,
                    args
                );
            } else {
                console[out](`[PlaceOS][${type}] ${msg}`, args);
            }
        } else {
            if (consoleHasColours()) {
                console[out](`%c[PlaceOS]%c[${type}] %c${msg}`, ...COLOURS);
            } else {
                console[out](`[PlaceOS][${type}] ${msg}`);
            }
        }
    }
}
/* istanbul ignore next */
/**
 * @private
 * Whether the console has colours
 * @hidden
 */
export function consoleHasColours() {
    const doc = document as any;
    return !(doc.documentMode || /Edge/.test(navigator.userAgent));
}

/**
 * Get URL paramters from hash or query string
 */
export function getFragments(): HashMap<string> {
    const hash = window.location?.hash
        ? window.location?.hash.slice(1)
        : window.location?.href.split('#')[1] || '';
    let query = window.location?.search
        ? window.location?.search.slice(1)
        : window.location?.href.split('?')[1] || '';
    let hash_fragments = {};
    if (hash) {
        // Hash can also contain the query so we need to check for it
        if (hash.indexOf('?') >= 0) {
            const parts = hash.split('?');
            hash_fragments = convertPairStringToMap(parts[0]);
            /* istanbul ignore else */
            if (!query) {
                query = parts[1];
            }
        } else {
            hash_fragments = convertPairStringToMap(hash);
        }
    }
    let query_fragments = {};
    if (query) {
        query_fragments = convertPairStringToMap(query);
    }
    return { ...hash_fragments, ...query_fragments };
}

/**
 * @private
 * Convert string of key value pairs to a dictionary object
 * @param str String of values
 */
export function convertPairStringToMap(str: string): HashMap<string> {
    const map: HashMap<string> = {};
    const str_pairs = str.split('&');
    for (const str_pair of str_pairs) {
        const split_pair = str_pair.split('=');
        if (split_pair[1]) {
            map[decodeURIComponent(split_pair[0])] = decodeURIComponent(
                split_pair[1]
            );
        }
    }
    return map;
}

/**
 * @hidden
 */
const NONCE_CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * @private
 * Create a nonce with the given length
 * @param length Length of the nonce string. Defaults to 40 characters
 */
export function generateNonce(length: number = 40): string {
    let nonce = '';
    for (let i = 0; i < length; i++) {
        nonce += NONCE_CHARS.charAt(
            Math.floor(Math.random() * NONCE_CHARS.length)
        );
    }
    return nonce;
}

/**
 * @private
 * Replace the URL fragment with the given name
 * @param name Name of the fragment to remove
 */
export function removeFragment(name: string) {
    const new_hash = (window.location?.hash || '')
        .replace(new RegExp(`${name}[a-zA-Z0-9_+-.%=]*&?`, 'g'), '')
        .replace(/&&/g, '&')
        .replace(/#&/g, '#')
        .replace(/&$/g, '#');
    const new_search = (window.location?.search || '')
        .replace(new RegExp(`${name}[a-zA-Z0-9_+-.%=]*&?`, 'g'), '')
        .replace(/&&/g, '&')
        .replace(/\?&/g, '#')
        .replace(/&$/g, '#');
    if (window.history?.replaceState)
        window.history?.replaceState(
            null,
            '',
            `${window.location?.pathname}${new_hash}${new_search}`
        );
}

/**
 * Convert byte values into a display string
 * @param bytes Number of bytes
 */
export function humanReadableByteCount(bytes: number, si: boolean = false) {
    const unit = si ? 1000.0 : 1024.0;

    if (bytes < unit) {
        return bytes + (si ? ' iB' : ' B');
    }

    const exp = Math.floor(Math.log(bytes) / Math.log(unit));
    const pre = (si ? 'kMGTPE' : 'KMGTPE').charAt(exp - 1) + (si ? 'iB' : 'B');

    return (bytes / Math.pow(unit, exp)).toFixed(2) + ' ' + pre;
}

/**
 * @private
 * Parse URLs from Link header string
 * @param header Header value
 */
export function parseLinkHeader(header: string): HashMap<string> {
    if (header.length === 0) {
        throw new Error('Input must not be of zero length');
    }

    // Split parts by comma
    const parts = header.split(',');
    const links: HashMap<string> = {};
    // Parse each part into a named link
    for (const part of parts) {
        const section = part.split(';');
        if (section.length !== 2) {
            throw new Error("Section could not be split on ';'");
        }
        const url = section[0].replace(/<(.*)>/, '$1').trim();
        const name = section[1].replace(/rel="(.*)"/, '$1').trim();
        links[name] = url;
    }
    return links;
}

/**
 * @private
 * Remove properties from object with given values
 * @param object Object to clean
 * @param delete_values List of property values to remove
 */
export function cleanObject(object: HashMap, delete_values: any[]) {
    for (const key in object) {
        if (
            object.hasOwnProperty(key) &&
            delete_values.indexOf(object[key]) >= 0
        ) {
            delete object[key];
        }
    }
    return object;
}

export function isMobileSafari() {
    return (
        [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod',
        ].includes(navigator.platform) ||
        // iPad on iOS 13 detection
        (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
    );
}

export function isNestedFrame() {
    return window.location !== window.parent.location;
}

export function simplifiedTime(
    time: number = Date.now(),
    interval: number = 60 * 1000
) {
    return Math.floor(time / interval);
}
