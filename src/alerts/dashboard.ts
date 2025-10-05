import { PlaceResource } from '../resources/resource';

export class PlaceAlertDashboard extends PlaceResource {
    // Domain authority that the dashboard exists under
    public readonly authority_id: string;
    // Description of the dashboard's purpose
    public readonly description: string;
    // Whether the dashboard is enabled or not
    public readonly enabled: boolean;

    constructor(data: Partial<PlaceAlertDashboard>) {
        super(data);
        this.authority_id = data.authority_id || '';
        this.description = data.description || '';
        this.enabled = data.enabled || false;
    }
}
