import { HashMap } from '../utilities/types';
import { MockPlaceWebsocketSystem } from './mock-system';

/**
 * @private
 * List of registered mock systems for websocket bindings
 */
const _mock_systems: HashMap<MockPlaceWebsocketSystem> = {};

/** Register a mock system for websocket bindings */
export function registerSystem(
    id: string,
    details: HashMap<HashMap[]>,
): MockPlaceWebsocketSystem {
    _mock_systems[id] = new MockPlaceWebsocketSystem(details);
    return _mock_systems[id];
}

/** Retrieve a mock system for websocket bindings */
export function mockSystem(id: string): MockPlaceWebsocketSystem {
    return _mock_systems[id];
}

/** Remove a mock system for websocket bindings */
export function deregisterSystem(id: string): void {
    delete _mock_systems[id];
}
