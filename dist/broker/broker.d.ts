import { PlaceResource } from '../resources/resource';
export declare enum AuthType {
    Certificate = 0,
    NoAuth = 1,
    UserPassword = 2
}
export declare class PlaceMQTTBroker extends PlaceResource {
    /** ID of the organisation that owns this row; empty when unowned */
    readonly organisation_id: string;
    /** Unique identifier for the Broker */
    readonly id: string;
    /** Name of the Broker */
    readonly name: string;
    /** Type of authentication used for connecting to the Broker */
    readonly auth_type: AuthType;
    /** Details of the Broker */
    readonly description: string;
    /** Host name of the Broker endpoint */
    readonly host: string;
    /** Port number of the Broker endpoint */
    readonly port: number;
    /** Whether connection to the Broker endpoint has TLS */
    readonly tls: boolean;
    /** Username to use for connecting to Broker */
    readonly username: string;
    /** Password to use for connecting to Broker */
    readonly password: string;
    /** Certificate details */
    readonly certificate: string;
    /** User secret */
    readonly secret: string;
    /**  */
    readonly filters: string[];
    constructor(data?: Partial<PlaceMQTTBroker>);
}
