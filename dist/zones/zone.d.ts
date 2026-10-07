import { PlaceResource } from '../resources/resource';
import { PlaceSettings } from '../settings/settings';
import { PlaceTrigger } from '../triggers/trigger';
/**
 * @hidden
 */
export interface PlaceZoneComplete extends Partial<PlaceZone> {
    trigger_data?: PlaceTrigger[];
}
export declare class PlaceZone extends PlaceResource {
    /** ID of the organisation that owns this row; empty when unowned */
    readonly organisation_id: string;
    /** Tuple of user settings of differring encryption levels for the zone */
    readonly settings: [
        PlaceSettings | null,
        PlaceSettings | null,
        PlaceSettings | null,
        PlaceSettings | null
    ];
    /** Description of the zone's purpose */
    readonly description: string;
    /** ID of the parent zone */
    readonly parent_id: string;
    /** List of triggers associated with the zone */
    readonly triggers: readonly string[];
    /** List of tags associated with the zone */
    readonly tags: string[];
    /** Geo-location details associated with the zone */
    readonly location: string;
    /** Custom display name for the zone */
    readonly display_name: string;
    /** Organisational code associated with the zone */
    readonly code: string;
    /** Organisational categorisation of the zone */
    readonly type: string;
    /** Count of resources associated with the zone */
    readonly count: number;
    /** Count of child zones for this zone */
    readonly children_count?: number;
    /** Amount of physical capacity associated with the zone */
    readonly capacity: number;
    /** ID or URL of or in a map associated with the zone */
    readonly map_id: string;
    /** List of image URLs */
    readonly images: string[];
    /** Timezone of the associated real world location */
    readonly timezone: string;
    /** List of playlist IDs associated with the system */
    readonly playlists: readonly string[];
    /**
     * List of modules associated with the system.
     * Only available from the show method with the `complete` query parameter
     */
    readonly trigger_list: readonly PlaceTrigger[];
    constructor(raw_data?: PlaceZoneComplete);
}
