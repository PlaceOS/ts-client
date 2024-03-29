/** Mapping of available query paramters for the dependencies index */
export interface PlaceDriverQueryOptions {
    /** Set maximum number of results to return. Defaults to `20` */
    limit?: number;
    /** Set number of results to skip. Defaults to `0` */
    offset?: number;
    /** Filter result by type of driver. One of either `ssh`, `device`, `service` or `logic` */
    role?: 'ssh' | 'device' | 'service' | 'logic' | 'websocket';
    /** Only return drivers that have an update available */
    update_available?: boolean;
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
