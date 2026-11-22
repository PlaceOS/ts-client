/**
 * Stops the operation on a programmer error. Also narrows the type for the compiler.
 *
 * Use it for facts that the types cannot say. Do not catch the error and continue.
 */
export function assert(condition: boolean, message: string): asserts condition {
    if (!condition) throw new Error(`Assertion failed: ${message}`);
}

/** Marks the end of an exhaustive `switch`. A new case is then a compile error. */
export function unreachable(value: never): never {
    throw new Error(`Unreachable: ${JSON.stringify(value)}`);
}
