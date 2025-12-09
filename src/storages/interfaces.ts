import { PlaceResourceQueryOptions } from '../resources/interface';

/** Mapping of available query parameters for the storages index endpoint */
export interface PlaceStorageQueryOptions extends PlaceResourceQueryOptions {
    /** Return storages which are in the authority provided */
    auth_id?: string;
}
