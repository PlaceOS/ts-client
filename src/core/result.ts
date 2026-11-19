/**
 * The value of an operation that can fail for an expected reason, such as a network error.
 *
 * Check `ok` before you use `value`. A `throw` is only for programmer errors.
 */
export type Result<T, E> =
    { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E };
