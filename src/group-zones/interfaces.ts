import { PlaceResourceQueryOptions } from '../resources/interface';

/** Mapping of available query parameters for the group zones index endpoint */
export interface PlaceGroupZoneQueryOptions extends PlaceResourceQueryOptions {
    /** ID of the group to filter zone access by */
    group_id?: string;
    /** ID of the zone to filter group access by */
    zone_id?: string;
}
