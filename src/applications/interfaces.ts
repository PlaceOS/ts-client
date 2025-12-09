import { PlaceResourceQueryOptions } from '../resources/interface';

/** Mapping of available query parameters for the OAuth apps index endpoint */
export interface PlaceApplicationQueryOptions extends PlaceResourceQueryOptions {
    /** The ID of the domain to list applications for */
    authority_id?: string;
}
