import { PlaceResourceQueryOptions } from '../resources/interface';
import { HashMap } from '../utilities/types';

export interface PlaceModuleFunctionMap extends HashMap<PlaceModuleFunction> {}

export interface PlaceModuleFunction {
    /** Arity of the function. See https://apidock.com/ruby/Method/arity */
    arity: number;
    /** Map of available paramters for the function */
    params: HashMap<[string, any] | [string]>;
    /** Order of the parameters to pass to the server */
    order: string[];
}

/** Allowable query parameters for systems index endpoint */
export interface PlaceSystemsQueryOptions extends PlaceResourceQueryOptions {
    /** Comma seperated list of email addresses to filter on */
    email?: string;
    /** Zone ID to filter the returned values on */
    zone_id?: string;
    /** Driver ID to filter the returned values on */
    module_id?: string;
}

/** Allowable query parameters for systems show endpoint */
export interface PlaceSystemShowOptions {
    /** Whether to return zone and module data for the system */
    complete?: boolean;
}
