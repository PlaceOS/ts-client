import { Signal, Unsubscribe } from '../utilities/signal';
import { PlaceModuleBinding } from './module';
export declare class PlaceVariableBinding<T = any> {
    private _module;
    /** Status variable name */
    readonly name: string;
    /** Active pending state of the variable binding */
    private _pending;
    /** Number of active bindings to this variable */
    private _binding_count;
    /** Number of bindings to restore on reconnection */
    private _stale_bindings;
    constructor(_module: PlaceModuleBinding, _name: string);
    /** Number of bindings to this status variable */
    get count(): number;
    /** Current value of the binding */
    get value(): T | undefined;
    /**
     * Get a signal that emits the current value of the binding
     */
    listen(): Signal<T>;
    /**
     * Subscribe to changes of the variable's binding value.
     * Note: Initial value emitted may be `undefined`
     * @param next Callback for changes to the bindings value
     */
    subscribe(next: (value: T) => void): Unsubscribe;
    bindThenSubscribe(next: (value: T) => void): Unsubscribe;
    /**
     * Bind to the status variable's value
     */
    bind(): () => void;
    /**
     * Unbind from status variable
     */
    unbind(): void;
    /**
     * Rebind to the status variable
     */
    private rebind;
    /**
     * Generate binding details for the status variable
     */
    private binding;
}
