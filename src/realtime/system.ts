import { HashMap } from '../utilities/types';
import { PlaceModuleBinding } from './module';

export class PlaceSystemBinding {
    /** Unique idetifier of the system */
    public readonly id: string;
    /** Mapping of engine modules within the system */
    private _module_list: HashMap<PlaceModuleBinding[]> = {};

    constructor(_id: string) {
        this.id = _id;
    }

    /**
     * Get binding interface for the given module
     * @param module_id ID of the module
     * @param index Index of the module within the system
     */
    public module(module_id: string, index: number = 1) {
        if (!module_id) {
            throw new Error('Invalid module ID');
        }
        const parts = module_id.split('_');
        // Check if module index is part of given ID
        if (parts.length > 1 && Number.isInteger(+parts[parts.length - 1])) {
            index = +parts[parts.length - 1];
            parts.pop();
        }
        // Make sure index is not invalid
        if (index < 1) {
            index = 1;
        }
        const module = parts.join('_');
        // Initialise module list for type
        if (!this._module_list[module]) {
            this._module_list[module] = [];
        }
        // Initialise module if it does not exist
        while (this._module_list[module].length < index) {
            this._module_list[module].push(
                new PlaceModuleBinding(
                    this,
                    `${module}_${this._module_list[module].length + 1}`,
                ),
            );
        }
        return this._module_list[module][index - 1];
    }
}
