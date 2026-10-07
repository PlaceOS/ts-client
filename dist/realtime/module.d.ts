import { PlaceVariableBinding } from './status-variable';
import { PlaceSystemBinding } from './system';
export declare class PlaceModuleBinding {
    private _system;
    private _id;
    /** Mapping of module bindings */
    private _bindings;
    constructor(_system: PlaceSystemBinding, _id: string);
    get id(): string;
    /** Parent system of the module */
    get system(): PlaceSystemBinding;
    /** Module index */
    get index(): number;
    /** Module name */
    get name(): string;
    /**
     * Get binding with the given name
     * @param name Name of the binding
     * @deprecated Use `variable` instead
     */
    binding<T = any>(name: string): PlaceVariableBinding<T>;
    /**
     * Get binding with the given name
     * @param name Name of the binding
     */
    variable<T = any>(name: string): PlaceVariableBinding<T>;
    /**
     * Execute method on the engine module
     * @param method Name of the method
     * @param args Array of arguments to pass to the method
     */
    execute<T = any>(method: string, args?: any[], timeout_delay?: number): Promise<T>;
}
