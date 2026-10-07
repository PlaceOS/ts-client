import { PlaceGroupZone } from './group-zone';
import { PlaceGroupZoneQueryOptions } from './interfaces';
/** Query group zone access rows */
export declare function queryGroupZones(query_params?: PlaceGroupZoneQueryOptions): import('..').QueryResponse<PlaceGroupZone>;
/** Get a group zone access row */
export declare function showGroupZone(group_id: string, zone_id: string): Promise<PlaceGroupZone>;
/** Add group access to a zone */
export declare function addGroupZone(form_data: Partial<PlaceGroupZone>): Promise<PlaceGroupZone>;
/** Update group access to a zone */
export declare function updateGroupZone(group_id: string, zone_id: string, form_data: Partial<PlaceGroupZone>, method?: 'put' | 'patch'): Promise<PlaceGroupZone>;
/** Remove group access from a zone */
export declare function removeGroupZone(group_id: string, zone_id: string): Promise<void>;
