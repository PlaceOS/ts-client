import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { clearAsyncTimeout, timeout } from '../utilities/async';
import { log } from '../utilities/general';

import { bind, listen, status, unbind, value } from './functions';
import { PlaceRequestOptions } from './interfaces';
import { PlaceModuleBinding } from './module';

enum PENDING {
    NONE,
    BIND,
    UNBIND,
}

export class PlaceVariableBinding<T = any> {
    /** Status variable name */
    public readonly name: string;
    /** Active pending state of the variable binding */
    private _pending = PENDING.NONE;
    /** Number of active bindings to this variable */
    private _binding_count: number = 0;
    /** Number of bindings to restore on reconnection */
    private _stale_bindings: number = 0;

    constructor(private _module: PlaceModuleBinding, _name: string) {
        this.name = _name;
        // Listen for state changes in the websocket connection
        status()
            .pipe(distinctUntilChanged())
            .subscribe((connected: boolean) => {
                if (connected && this._stale_bindings) {
                    log('VAR', 'Re-binding to status variable', this.binding());
                    this.rebind();
                } else if (!connected) {
                    clearAsyncTimeout(
                        `rebind:${JSON.stringify(this.binding())}`
                    );
                    log(
                        'VAR',
                        'Binding dropped due to disconnection, re-binding when possible.',
                        this.binding()
                    );
                    this._stale_bindings =
                        this._binding_count || this._stale_bindings;
                    this._binding_count = 0;
                }
            });
    }

    /** Number of bindings to this status variable */
    public get count(): number {
        return this._binding_count;
    }

    /** Current value of the binding */
    public get value(): T | undefined {
        return value<T>(this.binding());
    }

    /**
     * Subscribe to changes of the variable's binding value
     * @param next Callback for changes to the bindings value
     */
    public listen(): Observable<T> {
        return listen(this.binding());
    }

    /**
     * Bind to the status variable's value
     */
    public bind(): () => void {
        /* istanbul ignore else */
        if (
            (this._binding_count <= 0 && this._stale_bindings <= 0) ||
            this._pending === PENDING.UNBIND
        ) {
            this._pending = PENDING.BIND;
            bind(this.binding()).then(() => {
                this._binding_count++;
                this._pending = PENDING.NONE;
            });
        }
        return () => this.unbind();
    }

    /**
     * Unbind from status variable
     */
    public unbind() {
        if (this._binding_count === 1 && this._pending === PENDING.NONE) {
            this._pending = PENDING.UNBIND;
            unbind(this.binding()).then(() => {
                if (this._pending === PENDING.UNBIND)
                    this._pending = PENDING.NONE;
                this._binding_count--;
            });
        } else {
            this._binding_count = Math.max(this._binding_count - 1, 0);
        }
    }

    /**
     * Rebind to the status variable
     */
    private async rebind() {
        if (!this._stale_bindings) return;
        timeout(
            `rebind:${JSON.stringify(this.binding())}`,
            async () => {
                await bind(this.binding());
                this._binding_count = this._stale_bindings;
                this._stale_bindings = 0;
            },
            100
        );
    }

    /**
     * Generate binding details for the status variable
     */
    private binding(): PlaceRequestOptions {
        return {
            sys: this._module.system.id,
            mod: this._module.name,
            index: this._module.index,
            name: this.name,
        };
    }
}
