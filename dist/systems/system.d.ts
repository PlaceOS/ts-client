import { PlaceModule } from '../modules/module';
import { PlaceResource } from '../resources/resource';
import { PlaceSettings } from '../settings/settings';
/**
 * @hidden
 */
export interface PlaceSystemComplete extends Partial<PlaceSystem> {
    module_data?: PlaceModule[];
}
export declare class PlaceSystem extends PlaceResource {
    /** ID of the organisation that owns this row; empty when unowned */
    readonly organisation_id: string;
    /** Tuple of user settings of differring encryption levels for the system */
    readonly settings: [
        PlaceSettings | null,
        PlaceSettings | null,
        PlaceSettings | null,
        PlaceSettings | null
    ];
    /** Display name of the system */
    readonly display_name: string;
    /** Description of the system */
    readonly description: string;
    /** Email address associated with the system */
    readonly email: string;
    /** Email address associated with the system */
    readonly code: string;
    /** Capacity of the space associated with the system */
    readonly capacity: number;
    /** Features associated with the system */
    readonly features: string[];
    /** Whether system is bookable by end users */
    readonly bookable: boolean;
    /** Whether system is public accessible */
    readonly public: boolean;
    /** Count of UI devices attached to the system */
    readonly installed_ui_devices: number;
    /** Support URL for the system */
    readonly support_url: string;
    /** URL for the timetable UI linked to the system */
    readonly timetable_url: string;
    /** URLs for requesting snapshots of the assosiated camera */
    readonly camera_snapshot_url: string;
    /** URLs for requesting snapshots of the assosiated camera */
    readonly camera_snapshot_urls: string[];
    /** URL for managing the attached camera */
    readonly camera_url: string;
    /** External booking URL for the system */
    readonly room_booking_url: string;
    /** ID on the SVG Map associated with this system */
    readonly map_id: string;
    /** List of module IDs that belong to the system */
    readonly modules: readonly string[];
    /** List of images associated with the system */
    readonly images: readonly string[];
    /** List of the zone IDs that the system belongs */
    readonly zones: readonly string[];
    /** Timezone of the associated real world space */
    readonly timezone: string;
    /**
     * List of modules associated with the system.
     * Only available from the show method with the `complete` query parameter
     */
    module_list: readonly PlaceModule[];
    /** Whether the system has signage capabilities */
    readonly signage: boolean;
    /** List of playlist IDs associated with the system */
    readonly playlists: readonly string[];
    /** List of security groups with access to the system */
    readonly security_groups: readonly string[];
    /** Unix timestamp of the last ping from the signage player UI */
    readonly signage_last_seen: number;
    readonly approval: boolean;
    /** Orientation of the signage system */
    readonly orientation: 'unspecified' | 'portrait' | 'landscape' | 'square';
    constructor(raw_data?: PlaceSystemComplete);
}
