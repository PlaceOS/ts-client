import { PlaceResource } from '../resources/resource';

export enum AuthType {
    Certificate,
    NoAuth,
    UserPassword,
}

export class PlaceMQTTBroker extends PlaceResource {
    /** Unique identifier for the Broker */
    public readonly id: string;
    /** Name of the Broker */
    public readonly name: string;
    /** Type of authentication used for connecting to the Broker */
    public readonly auth_type: AuthType;
    /** Details of the Broker */
    public readonly description: string;
    /** Host name of the Broker endpoint */
    public readonly host: string;
    /** Port number of the Broker endpoint */
    public readonly port: number;
    /** Whether connection to the Broker endpoint has TLS */
    public readonly tls: boolean;
    /** Username to use for connecting to Broker */
    public readonly username: string;
    /** Password to use for connecting to Broker */
    public readonly password: string;
    /** Certificate details */
    public readonly certificate: string;
    /** User secret */
    public readonly secret: string;
    /**  */
    public readonly filters: string[];

    constructor(data: Partial<PlaceMQTTBroker> = {}) {
        super();
        this.id = data.id || '';
        this.name = data.name || '';
        this.auth_type = data.auth_type || AuthType.UserPassword;
        this.description = data.description || '';
        this.host = data.host || '';
        this.port = data.port || 1883;
        this.tls = data.tls || false;
        this.username = data.username || '';
        this.password = data.password || '';
        this.certificate = data.certificate || '';
        this.secret = data.secret || '';
        this.filters = data.filters || [];
    }
}
