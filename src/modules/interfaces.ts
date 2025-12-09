import { PlaceResourceQueryOptions } from '../resources/interface';

/** Mapping of available query parameters for the modules index endpoint */
export interface PlaceModuleQueryOptions extends PlaceResourceQueryOptions {
    /** Only return modules updated before this time (unix epoch) */
    as_of?: number;
    /** Only return modules running in this system (query params are ignored if this is provided) */
    control_system_id?: string;
    /** Return results that connected state matches this value */
    connected?: boolean;
    /** Only return instances of this driver */
    driver_id?: string;
    /** Do not return logic modules (return only modules that can exist in multiple systems) */
    no_logic?: boolean;
    /** Return only running modules */
    running?: boolean;
}

/** Mapping of available query parameters for the modules show endpoint */
export interface PlaceModuleShowOptions {
    /** Return the driver details along with the module */
    complete?: boolean;
}

/** Place response from `ping` module task endpoint `/api/engine/v2/<mod_id>/ping` */
export interface PlaceModulePingOptions {
    /** Host address of the module device */
    host: string;
    /** Whether the host address was pingable */
    pingable: boolean;
    /** Any warning returned from the ping attempt */
    warning?: string;
    /** Any exception thrown from the ping attempt */
    exception?: string;
}
