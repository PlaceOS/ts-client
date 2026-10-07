import { AlertSeverity } from '../alerts/alert';
import { PlaceResource } from '../resources/resource';
import { PlaceSettings } from '../settings/settings';
import { PlaceDriverRole } from './enums';
export declare class PlaceDriver extends PlaceResource {
    /** Place class name of the driver */
    readonly class_name: string;
    /** Description of the driver functionality */
    readonly description: string;
    /** Name to use for modules that inherit this driver */
    readonly module_name: string;
    /** Role of the driver in engine */
    readonly role: PlaceDriverRole;
    /** Default URI for the driver */
    readonly default_uri: string;
    /** Default port number for the driver */
    readonly default_port: number;
    /** ID of the repository the driver is from */
    readonly repository_id: string;
    /** Name of the file from the repository to load the driver logic from */
    readonly file_name: string;
    /** Version of the driver logic to use */
    readonly commit: string;
    /** Ignore connection issues */
    readonly ignore_connected: boolean;
    /** Whether newer version of driver is available */
    readonly update_available: boolean;
    readonly update_info?: {
        commit: string;
        message: string;
        author: string;
        date: string;
    };
    /**  */
    readonly alert_level: AlertSeverity;
    /** Tuple of user settings of differring encryption levels for the driver */
    readonly settings: [
        PlaceSettings | null,
        PlaceSettings | null,
        PlaceSettings | null,
        PlaceSettings | null
    ];
    constructor(raw_data?: Partial<PlaceDriver>);
}
