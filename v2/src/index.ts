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
export {
    browserEnvironment,
    FRAME_MESSAGE_TYPE,
    memoryStore,
    type AuthEnvironment,
    type FrameError,
    type KeyValueStore,
} from './auth/environment.ts';
export {
    createAuthSession,
    DomainAuthority,
    type AuthError,
    type DomainAuthorityInput,
    type AuthSession,
    type AuthSessionConfig,
    type AuthStatus,
    type Grant,
} from './auth/session.ts';
export { assert, unreachable } from './core/assert.ts';
export {
    browserRealtimeEnvironment,
    type RealtimeEnvironment,
    type RealtimeSocket,
    type SocketHandlers,
    type TokenTransport,
} from './realtime/environment.ts';
export {
    createRealtime,
    splitModuleId,
    type BindingState,
    type DebugMessage,
    type DebugTarget,
    type Realtime,
    type RealtimeConfig,
    type RealtimeError,
    type RealtimeStatus,
    type RealtimeTarget,
} from './realtime/realtime.ts';
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
    type Credential,
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
