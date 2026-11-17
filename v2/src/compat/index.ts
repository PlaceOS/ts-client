/**
 * Helpers for code that moves from v1, at `@placeos/ts-client/compat`. The migration tool moves
 * the v1 imports of these names here.
 *
 * - `orThrow` and `orThrowPage` give the data of a v2 call, and throw on an error, as v1 did.
 * - `mockReply` and `mockPage` make v2 results for the test doubles of v2 calls.
 * - `registerMockEndpoint` and `mockFetch` are the v1 mock endpoints, for the v2 client.
 * - `registerSystem` and `mockRealtimeEnvironment` are the v1 mock systems, for `createRealtime`.
 * - The v1 enums, with the values of v2.
 *
 * @module
 */
export * from './enums.ts';
export * from './http-mock.ts';
export * from './realtime-mock.ts';
export * from './result.ts';
