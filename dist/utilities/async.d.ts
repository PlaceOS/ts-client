import { Unsubscribe } from './signal';
/**
 * @private
 * Store for named subscription unsub callbacks
 */
type SubscriptionLike = {
    unsubscribe: () => void;
} | Unsubscribe;
/**
 * @private
 * Perform any cleanup actions needed before the item is deleted
 */
export declare function destroyWaitingAsync(): void;
/**
 * @private
 * Creates a named timer
 * @param name Name of the timer
 * @param fn Callback function for the timer
 * @param delay Callback delay
 */
export declare function timeout(name: string, fn: () => void, delay?: number): void;
/**
 * @private
 * Clears the named timer
 * @param name Timer name
 */
export declare function clearAsyncTimeout(name: string): void;
/**
 * @private
 * Creates a named interval
 * @param name Name of the interval
 * @param fn Callback function for the interval
 * @param delay Callback delay
 */
export declare function interval(name: string, fn: () => void, delay?: number): void;
/**
 * @private
 * Clears the named interval
 * @param name Timer name
 */
export declare function clearAsyncInterval(name: string): void;
/**
 * @private
 * Store named subscription
 * @param name Name of the subscription
 * @param fn Unsubscribe callback or Subscription-like object
 */
export declare function subscription(name: string, fn: SubscriptionLike): void;
/**
 * @private
 * Call unsubscribe callback with the given name
 * @param name Name of the subscription
 */
export declare function unsub(name: string): void;
export {};
