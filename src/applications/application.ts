import { PlaceResource } from '../resources/resource';

export class PlaceApplication extends PlaceResource {
    /** Unique identifier of the application */
    public readonly uid: string;
    /** Secret associated with the application */
    public readonly secret: string;
    /** ID of the domain that owns this application */
    public readonly owner_id: string;
    /** Access scopes required by users to access the application */
    public readonly scopes: string;
    /** Authentication redirect URI */
    public readonly redirect_uri: string;
    /** Whether the application uses a confidential client secret */
    public readonly confidential: boolean;
    /** Skip authorization checks for the application */
    public readonly skip_authorization: boolean;
    /** Subsystems the application has access to */
    public readonly subsystems: string[];
    /** Whether Client ID should be updated on changes */
    public readonly preserve_client_id: boolean;

    constructor(raw_data: Partial<PlaceApplication> = {}) {
        super(raw_data);
        this.uid = raw_data.uid || '';
        this.secret = raw_data.secret || '';
        this.owner_id = raw_data.owner_id || '';
        this.scopes = raw_data.scopes || '';
        this.redirect_uri = raw_data.redirect_uri || '';
        this.confidential = raw_data.confidential || false;
        this.skip_authorization = raw_data.skip_authorization || false;
        this.subsystems = raw_data.subsystems || [];
        this.preserve_client_id = raw_data.preserve_client_id || false;
    }
}
