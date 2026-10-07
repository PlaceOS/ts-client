import { PlacePartner } from '../partners/partner';
import { PlaceResourceQueryOptions } from '../resources/interface';
import { PlaceOrganisation } from './organisation';
/** Mapping of available query parameters for the organisations index endpoint */
export interface PlaceOrganisationQueryOptions extends PlaceResourceQueryOptions {
    /** Only organisations under this partner */
    partner_id?: string;
}
/** Values that are not mass-assignable and travel as query parameters on create and update */
export interface PlaceOrganisationWriteOptions {
    /** Who is invoiced: the partner or the organisation */
    payer?: 'partner' | 'organisation';
    /** True for the partner's own staff organisation */
    partner_staff?: boolean;
}
/** Which organisation a newly created domain, zone or module belongs to (cluster admins only) */
export interface PlaceOrganisationOwnerOptions {
    organisation_id?: string;
}
/** The caller's reach, as resolved by the API for the current request */
export interface PlaceReach {
    /** `cluster` sees every organisation, `partner` every organisation under one partner, `organisation` one */
    reach: 'cluster' | 'partner' | 'organisation';
    /** Whether the API is refusing cross-organisation access or only logging it */
    enforcing: boolean;
    /** The caller's own organisation, if their domain has one */
    organisation: PlaceOrganisation | null;
    /** The caller's own partner, if their organisation has one */
    partner: PlacePartner | null;
    /** The organisations in reach; null for cluster reach */
    organisations: PlaceOrganisation[] | null;
}
/** Rows adopted by a claim */
export interface PlaceOrganisationClaimResult {
    zones: number;
    systems: number;
    modules: number;
    triggers: number;
}
