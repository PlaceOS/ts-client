export type SignalListener<T> = (value: T, previous: T) => void;
export type Unsubscribe = () => void;

export interface SubscribeOptions {
    emitCurrent?: boolean;
}

export interface Signal<T> {
    (): T;
    readonly value: T;
    subscribe(
        listener: SignalListener<T>,
        options?: SubscribeOptions,
    ): Unsubscribe;
}

export interface WritableSignal<T> extends Signal<T> {
    set(value: T): void;
    update(fn: (value: T) => T): void;
    asReadonly(): Signal<T>;
}

export function createSignal<T>(initial: T): WritableSignal<T> {
    let current = initial;
    const listeners = new Set<SignalListener<T>>();

    const signal = (() => current) as WritableSignal<T>;
    Object.defineProperty(signal, 'value', {
        get: () => current,
        enumerable: true,
    });
    signal.subscribe = (
        listener: SignalListener<T>,
        options: SubscribeOptions = {},
    ) => {
        listeners.add(listener);
        if (options.emitCurrent !== false) listener(current, current);
        return () => listeners.delete(listener);
    };
    signal.set = (value: T) => {
        if (Object.is(value, current)) return;
        const previous = current;
        current = value;
        for (const listener of [...listeners]) {
            listener(current, previous);
        }
    };
    signal.update = (fn: (value: T) => T) => signal.set(fn(current));
    signal.asReadonly = () => signal as Signal<T>;
    return signal;
}

export function computedSignal<T>(
    compute: () => T,
    dependencies: Signal<any>[],
): Signal<T> {
    const signal = createSignal(compute());
    for (const dependency of dependencies) {
        dependency.subscribe(() => signal.set(compute()), {
            emitCurrent: false,
        });
    }
    return signal.asReadonly();
}

export function waitForSignal<T>(
    signal: Signal<T>,
    predicate: (value: T) => boolean = Boolean as any,
): Promise<T> {
    if (predicate(signal.value)) return Promise.resolve(signal.value);
    return new Promise<T>((resolve) => {
        const unsubscribe = signal.subscribe(
            (value) => {
                if (!predicate(value)) return;
                unsubscribe();
                resolve(value);
            },
            { emitCurrent: false },
        );
    });
}

export function sleep(delay: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delay));
}
