import { PlaceAuthority } from '../auth/interfaces';
import { PlaceResource } from '../resources/resource';
import { PlaceUser } from '../users/user';
import { HashMap } from '../utilities/types';

export type PlaceApiKeyPermission =
    | 'user'
    | 'support'
    | 'admin'
    | 'admin_support';

export class PlaceApiKey extends PlaceResource {
    public readonly description: string;
    public readonly scopes: HashMap[];
    public readonly permissions: PlaceApiKeyPermission | '';
    public readonly secret: string;
    public readonly user_id: string;
    public readonly authority_id: string;
    public readonly x_api_key: string;
    public readonly user?: PlaceUser;
    public readonly authority?: PlaceAuthority;

    constructor(raw_data: Partial<PlaceApiKey> = {}) {
        super(raw_data);
        this.description = raw_data.description || '';
        this.scopes = raw_data.scopes || [];
        this.permissions = raw_data.permissions || '';
        this.secret = raw_data.secret || '';
        this.user_id = raw_data.user_id || '';
        this.authority_id = raw_data.authority_id || '';
        this.x_api_key = raw_data.x_api_key || '';
        this.user = raw_data.user ? new PlaceUser(raw_data.user) : undefined;
        this.authority = raw_data.authority;
    }
}
