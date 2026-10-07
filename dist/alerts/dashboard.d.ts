import { PlaceResource } from '../resources/resource';
export declare class PlaceAlertDashboard extends PlaceResource {
    readonly authority_id: string;
    readonly description: string;
    readonly enabled: boolean;
    constructor(data: Partial<PlaceAlertDashboard>);
}
