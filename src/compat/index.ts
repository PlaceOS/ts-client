/**
 * Helpers for code that moves from 6.x, at `@placeos/ts-client/compat`. The migration tool moves
 * the 6.x imports of these names here.
 *
 * - `orThrow` and `orThrowPage` give the data of a 7.x call, and throw on an error, as 6.x did.
 * - `mockReply` and `mockPage` make 7.x results for the test doubles of 7.x calls.
 * - `registerMockEndpoint` and `mockFetch` are the 6.x mock endpoints, for the 7.x client.
 * - `registerSystem` and `mockRealtimeEnvironment` are the 6.x mock systems, for `createRealtime`.
 * - The 6.x enums, with the values of 7.x.
 *
 * @module
 */
export * from './enums.ts';
export * from './http-mock.ts';
export * from './realtime-mock.ts';
export * from './result.ts';
