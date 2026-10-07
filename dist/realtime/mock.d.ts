import { HashMap } from '../utilities/types';
import { MockPlaceWebsocketSystem } from './mock-system';
/** Register a mock system for websocket bindings */
export declare function registerSystem(id: string, details: HashMap<HashMap[]>): MockPlaceWebsocketSystem;
/** Retrieve a mock system for websocket bindings */
export declare function mockSystem(id: string): MockPlaceWebsocketSystem;
/** Remove a mock system for websocket bindings */
export declare function deregisterSystem(id: string): void;
