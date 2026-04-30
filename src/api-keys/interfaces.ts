import { PlaceResourceQueryOptions } from '../resources/interface';
import { HashMap } from '../utilities/types';

export interface PlaceApiKeyQueryOptions extends PlaceResourceQueryOptions {
    /** ID of the authority to filter API keys by */
    authority_id?: string;
}

export interface PlaceApiKeyJwt {
    [key: string]: unknown;
}

export interface PlaceApiKeyScope extends HashMap {}
