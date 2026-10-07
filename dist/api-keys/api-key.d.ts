import { PlaceAuthority } from '../auth/interfaces';
import { PlaceResource } from '../resources/resource';
import { PlaceUser } from '../users/user';
import { HashMap } from '../utilities/types';
export type PlaceApiKeyPermission = 'user' | 'support' | 'admin' | 'admin_support';
export declare class PlaceApiKey extends PlaceResource {
    readonly description: string;
    readonly scopes: HashMap[];
    readonly permissions: PlaceApiKeyPermission | '';
    readonly secret: string;
    readonly user_id: string;
    readonly authority_id: string;
    readonly x_api_key: string;
    readonly user?: PlaceUser;
    readonly authority?: PlaceAuthority;
    readonly expires_at?: number;
    readonly ttl?: number;
    constructor(raw_data?: Partial<PlaceApiKey>);
}
