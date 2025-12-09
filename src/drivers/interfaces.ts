import { PlaceResourceQueryOptions } from '../resources/interface';

/** Mapping of available query parameters for the drivers index endpoint */
export interface PlaceDriverQueryOptions extends PlaceResourceQueryOptions {
    /** Filter result by type of driver */
    role?: 'ssh' | 'device' | 'service' | 'logic' | 'websocket';
    /** Only return drivers that have an update available */
    update_available?: boolean;
}

/** Mapping of available query parameters for the drivers show endpoint */
export interface PlaceDriverShowOptions {
    /** Check if the driver is compiled */
    compilation_status?: boolean;
}

/** List of details that can be assigned to a new Driver */
export interface PlaceDriverDetails {
    /** Default name for the driver */
    readonly descriptive_name: string;
    /** Default class name for the driver */
    readonly generic_name: string;
    /** Default TCP port for the driver */
    readonly tcp_port: number;
    /** Default settings for the driver */
    readonly default_settings: string;
    /** Default description for the driver */
    readonly description: string;
    /** Default UDP port for the driver */
    readonly udp_port: number;
    /** Default URI for the driver */
    readonly uri_base: string;
    /** Default makebreak for the driver */
    readonly makebreak: boolean;
}
