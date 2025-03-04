/* istanbul ignore file */

export { getModule, getSystem } from './realtime/binding';
export {
    bind,
    connectionState,
    debug,
    debug_events,
    execute,
    ignore,
    isConnected as is_connected,
    listen,
    status,
    unbind,
    value,
    websocketRoute,
} from './realtime/functions';
export { PlaceErrorCodes, PlaceLogLevel } from './realtime/interfaces';
export type {
    PlaceCommand,
    PlaceCommandRequest,
    PlaceCommandRequestMetadata,
    PlaceDebugEvent,
    PlaceExecRequestOptions,
    PlaceRequestOptions,
    PlaceResponse,
    PlaceWebsocketOptions,
    SimpleNetworkError,
} from './realtime/interfaces';

export { PlaceModuleBinding } from './realtime/module';
export { PlaceVariableBinding } from './realtime/status-variable';
export { PlaceSystemBinding } from './realtime/system';

export { deregisterSystem, mockSystem, registerSystem } from './realtime/mock';
export { MockPlaceWebsocketModule } from './realtime/mock-module';
export { MockPlaceWebsocketSystem } from './realtime/mock-system';
