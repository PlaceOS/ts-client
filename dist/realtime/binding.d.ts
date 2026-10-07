import { PlaceModuleBinding } from './module';
import { PlaceSystemBinding } from './system';
/**
 * Get binding interface for an engine system
 * @param system_id ID of the system
 */
export declare function getSystem(system_id: string): PlaceSystemBinding;
/**
 * Get binding interface for an engine module
 * @param system_id ID of the system
 * @param module_id ID of the module withing the system
 * @param index Index of the module within the system
 */
export declare function getModule(system_id: string, module_id: string, index?: number): PlaceModuleBinding;
