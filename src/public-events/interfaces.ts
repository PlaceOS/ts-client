import { PlaceResourceQueryOptions } from '../resources/interface';

export interface PublicEventTokenRequest {
    captcha: string;
    name: string;
    email: string;
}

export interface PublicEventRegistrationRequest {
    event_id: string;
    name: string;
    email: string;
}

export interface PublicEventQueryOptions extends PlaceResourceQueryOptions {}
