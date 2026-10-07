import { PlaceModuleBinding } from './module';
export declare class PlaceSystemBinding {
    /** Unique idetifier of the system */
    readonly id: string;
    /** Mapping of engine modules within the system */
    private _module_list;
    constructor(_id: string);
    /**
     * Get binding interface for the given module
     * @param module_id ID of the module
     * @param index Index of the module within the system
     */
    module(module_id: string, index?: number): PlaceModuleBinding;
}
