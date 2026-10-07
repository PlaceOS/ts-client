import { HashMap } from '../utilities/types';
export declare class MockPlaceWebsocketSystem {
    [name: string]: any;
    constructor(properties: HashMap);
    /**
     * Add new module to the system
     * @param mod_name Module class
     * @param properties Properties of the new module
     */
    private addModule;
}
