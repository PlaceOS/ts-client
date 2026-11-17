/**
 * The PlaceOS REST API client.
 *
 * ```ts
 * import { configure, zones } from '@placeos/ts-client';
 *
 * configure({ baseUrl: '', auth: { kind: 'bearer', token: () => token } });
 * const result = await zones.show({ id: 'zone-1234' });
 * if (result.ok) console.log(result.value.data.name);
 * ```
 *
 * @module
 */
export { assert, unreachable } from './core/assert.ts';
export {
    call,
    configure,
    createClient,
    operation,
    RESPONSE_BYTES_MAX_DEFAULT,
    TIMEOUT_MS_DEFAULT,
    type AnyOperation,
    type Auth,
    type CallError,
    type CallOptions,
    type CallResult,
    type Client,
    type ClientConfig,
    type FetchFunction,
    type HttpMethod,
    type Operation,
    type OperationData,
    type OperationInput,
    type Reply,
} from './core/client.ts';
export { pageInfo, type PageInfo } from './core/pagination.ts';
export type { Result } from './core/result.ts';
export {
    checkRequest,
    parseResponse,
    type Input,
    type JsonValue,
    type Output,
    type Schema,
    type SchemaError,
} from './core/schema.ts';
export * from './generated/operations/index.ts';
export * from './generated/schemas.ts';
