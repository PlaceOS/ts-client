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
    /** Return only bookable or non-bookable rooms (returns both when not specified) */
    bookable?: boolean;
    /** Return only rooms with capacity equal or greater than provided */
    capacity?: number;
    /** Return only systems whose resource address matches one of the emails provided */
    email?: string;
    /** Comma separated list of features. Return only rooms with all requested features */
    features?: string;
    /** Return only systems which have this module ID */
    module_id?: string;
    /** Return systems using this trigger ID */
    trigger_id?: string;
    /** Zone ID to filter the returned values on */
    zone_id?: string;
    /** Return systems which are public */
    public?: boolean;
    /** Only return systems that have signage capabilities */
    signage?: boolean;
}

/** Allowable query parameters for systems with_emails endpoint */
export interface PlaceSystemsWithEmailsOptions {
    /** Comma separated list of email addresses (required) */
    in: string;
}

/** Allowable query parameters for systems show endpoint */
export interface PlaceSystemShowOptions {
    /** Return the system with zone, module, and driver information collected */
    complete?: boolean;
}

/** Allowable query parameters for systems update endpoint */
export interface PlaceSystemUpdateOptions {
    /** Version number to prevent overwriting newer config (required for PUT/PATCH) */
    version: number;
}

/** Allowable query parameters for system start/stop endpoints */
export interface PlaceSystemStartStopOptions {
    /** Start/stop modules that only occur in the selected system */
    single_occurrence?: boolean;
}

/** Allowable query parameters for system triggers index endpoint */
export interface PlaceSystemTriggersQueryOptions extends PlaceResourceQueryOptions {
    /** Provide the control system details */
    complete?: boolean;
    /** Only return triggers marked as important */
    important?: boolean;
    /** Only return triggers that have recently been triggered */
    triggered?: boolean;
    /** Filter by a particular trigger type */
    trigger_id?: string;
    /** Return triggers updated before the time specified (unix epoch) */
    as_of?: number;
}
