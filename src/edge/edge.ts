import { PlaceResource } from '../resources/resource';
import { HashMap } from '../utilities/types';

export class PlaceEdge extends PlaceResource {
    public readonly description: string;
    public readonly secret: string;
    public readonly x_api_key: string;
    public readonly online: boolean;
    public readonly last_seen: number;

    constructor(raw_data: Partial<PlaceEdge> = {}) {
        super(raw_data);
        this.description = raw_data.description || '';
        this.secret = raw_data.secret || '';
        this.x_api_key = raw_data.x_api_key || '';
        this.last_seen = (raw_data.last_seen || 0) * 1000 || Date.now();
        this.online = raw_data.online || false;
    }

    public toJSON(): HashMap {
        const obj = super.toJSON();
        delete obj.last_seen;
        return obj;
    }
}
