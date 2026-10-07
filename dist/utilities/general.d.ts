import { HashMap } from './types';
declare global {
    interface Window {
        debug: boolean;
    }
}
/**
 * @hidden
 */
export type ConsoleIOStream = 'log' | 'warn' | 'debug' | 'error' | 'info' | 'group' | 'groupCollapsed' | 'groupEnd';
/**
 * Log message to the console
 * @hidden
 * @param type Where the message is from
 * @param msg Body of the message
 * @param args Javascript data to post after the message
 * @param out IO stream to post message to
 * @param color CSS colour to set the `type` value printed to the console
 */
export declare function log(type: string, msg: string, args?: any, out?: ConsoleIOStream, color?: string): void;
export declare function scoped_log(scope: string): {
    (msg: string, ...args: any): void;
    debug(msg: string, ...args: any): void;
    info(msg: string, ...args: any): void;
    error(msg: string, ...args: any): void;
    warn(msg: string, ...args: any): void;
    log(msg: string, ...args: any): void;
    group(msg: string, ...args: any): void;
    groupCollapsed(msg: string, ...args: any): void;
    groupEnd(msg: string, ...args: any): void;
};
/**
 * @private
 * Whether the console has colours
 * @hidden
 */
export declare function consoleHasColours(): boolean;
/**
 * Get URL paramters from hash or query string
 */
export declare function getFragments(): HashMap<string>;
/**
 * @private
 * Convert string of key value pairs to a dictionary object
 * @param str String of values
 */
export declare function convertPairStringToMap(str: string): HashMap<string>;
/**
 * @private
 * Create a nonce with the given length
 * @param length Length of the nonce string. Defaults to 40 characters
 */
export declare function generateNonce(length?: number): string;
/**
 * @private
 * Replace the URL fragment with the given name
 * @param name Name of the fragment to remove
 */
export declare function removeFragment(name: string): void;
/**
 * Convert byte values into a display string
 * @param bytes Number of bytes
 */
export declare function humanReadableByteCount(bytes: number, si?: boolean): string;
/**
 * @private
 * Parse URLs from Link header string
 * @param header Header value
 */
export declare function parseLinkHeader(header: string): HashMap<string>;
/**
 * @private
 * Remove properties from object with given values
 * @param object Object to clean
 * @param delete_values List of property values to remove
 */
export declare function cleanObject(object: HashMap, delete_values: any[]): HashMap<any>;
export declare function isMobileSafari(): boolean;
export declare function isNestedFrame(): boolean;
export declare function simplifiedTime(time?: number, interval?: number): number;
