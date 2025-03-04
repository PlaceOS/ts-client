import { PlaceResource } from '../resources/resource';

export class PlaceEdge extends PlaceResource {
    public readonly description: string;
    public readonly secret: string;
    public readonly x_api_key: string;

    constructor(raw_data: Partial<PlaceEdge> = {}) {
        super(raw_data);
        this.description = raw_data.description || '';
        this.secret = raw_data.secret || '';
        this.x_api_key = raw_data.x_api_key || '';
    }
}
