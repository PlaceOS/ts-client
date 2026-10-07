import { PlaceResource } from '../resources/resource';
export declare class PlaceApplication extends PlaceResource {
    /** Unique identifier of the application */
    readonly uid: string;
    /** Secret associated with the application */
    readonly secret: string;
    /** ID of the domain that owns this application */
    readonly owner_id: string;
    /** Access scopes required by users to access the application */
    readonly scopes: string;
    /** Authentication redirect URI */
    readonly redirect_uri: string;
    /** Whether the application uses a confidential client secret */
    readonly confidential: boolean;
    /** Skip authorization checks for the application */
    readonly skip_authorization: boolean;
    /** Subsystems the application has access to */
    readonly subsystems: string[];
    /** Whether Client ID should be updated on changes */
    readonly preserve_client_id: boolean;
    constructor(raw_data?: Partial<PlaceApplication>);
}
