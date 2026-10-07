export type SignalListener<T> = (value: T, previous: T) => void;
export type Unsubscribe = () => void;
export interface SubscribeOptions {
    emitCurrent?: boolean;
}
export interface Signal<T> {
    (): T;
    readonly value: T;
    subscribe(listener: SignalListener<T>, options?: SubscribeOptions): Unsubscribe;
}
export interface WritableSignal<T> extends Signal<T> {
    set(value: T): void;
    update(fn: (value: T) => T): void;
    asReadonly(): Signal<T>;
}
export declare function createSignal<T>(initial: T): WritableSignal<T>;
export declare function computedSignal<T>(compute: () => T, dependencies: Signal<any>[]): Signal<T>;
export declare function waitForSignal<T>(signal: Signal<T>, predicate?: (value: T) => boolean): Promise<T>;
export declare function sleep(delay: number): Promise<void>;
