import { Signal } from '../utilities/signal';
import { HashMap } from '../utilities/types';
import { MockPlaceWebsocketSystem } from './mock-system';
export declare class MockPlaceWebsocketModule {
    protected _system: MockPlaceWebsocketSystem;
    [name: string]: any;
    constructor(_system: MockPlaceWebsocketSystem, properties: HashMap);
    /**
     * Call method on the module
     * @param command Name of the method to call on the module
     * @param args Array of arguments to pass to the method being called
     */
    call<T = any>(command: string, args?: any[]): T | null;
    /**
     * Subscribe to value changes on the given property
     * @param prop_name Name of the property
     * @param next Callback for changes to the property
     */
    listen<T = any>(prop_name: string): Signal<T>;
    /**
     * Add method to module
     * @param prop_name Name of the method
     * @param fn Method logic
     */
    private addMethod;
    /**
     * Add signal property to module
     * @param prop_name Name of the property
     * @param value Initial value of the property
     */
    private addProperty;
}
