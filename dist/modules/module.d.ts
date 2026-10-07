import { AlertSeverity } from '../alerts/alert';
import { PlaceDriver } from '../drivers/driver';
import { PlaceDriverRole } from '../drivers/enums';
import { PlaceResource } from '../resources/resource';
import { PlaceSettings } from '../settings/settings';
import { PlaceSystem } from '../systems/system';
import { HashMap } from '../utilities/types';
/**
 * @hidden
 */
export interface PlaceModuleComplete extends Partial<PlaceModule> {
    dependency_id?: string;
    dependency?: PlaceDriver;
    control_system?: PlaceSystem;
}
/** Function to request the server to stop emitting debug events */
export type EndDebugFn = () => void;
export declare class PlaceModule extends PlaceResource {
    /** ID of the organisation that owns this row; empty when unowned */
    readonly organisation_id: string;
    /** Whether the associated hardware is connected */
    readonly connected: boolean | undefined;
    /** Whether the module driver is running */
    readonly running: boolean;
    /** Timestamp of last update in ms since UTC epoch */
    readonly updated_at: number;
    /** ID of the edge associated with the module */
    readonly edge_id: string;
    /** ID of the driver associated with the module */
    readonly driver_id: string;
    /** Driver/dependancy associated with the module */
    readonly driver?: PlaceDriver;
    /** ID of the system associated with the module */
    readonly control_system_id: string;
    /** System associated with the module */
    readonly system?: PlaceSystem;
    /** IP address of the hardware associated with the module */
    readonly ip: string;
    /** Whether the hardware connection requires TLS */
    readonly tls: boolean;
    /** Whether the hardware connection is over UDP */
    readonly udp: boolean;
    /** Port number connections to the hardware are made on */
    readonly port: number;
    /**  */
    readonly makebreak: boolean;
    /** URI associated with the module */
    readonly uri: string;
    /** Custom name of the module */
    readonly custom_name: string;
    /** Type of module */
    readonly role: PlaceDriverRole;
    /** Notes associated with the module */
    readonly notes: string;
    /** Ignore connection issues */
    readonly ignore_connected: boolean;
    /** Tuple of user settings of differring encryption levels for the module */
    readonly settings: [
        PlaceSettings | null,
        PlaceSettings | null,
        PlaceSettings | null,
        PlaceSettings | null
    ];
    /** Whether the module has a runtime error */
    readonly has_runtime_error: boolean;
    /** Timestamp of the last runtime error in ms since UTC epoch */
    readonly error_timestamp: number;
    /**  */
    readonly alert_level: AlertSeverity;
    /** ID of the system associated with the module */
    get system_id(): string;
    constructor(raw_data?: PlaceModuleComplete);
    /**
     * Convert object into plain object
     */
    toJSON(keep_system?: boolean): HashMap;
}
