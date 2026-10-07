/** Representation of a group in PlaceOS. */
export declare class PlaceGroup {
    /** ISO8601 timestamp of the creation time of the group */
    readonly created_at: string;
    /** ISO8601 timestamp of the last update time of the group */
    readonly updated_at: string;
    /** Unique identifier of the group */
    readonly id: string;
    /** Human readable name of the group */
    readonly name: string;
    /** Description of the group's purpose */
    readonly description: string;
    /** Subsystems this group participates in */
    readonly subsystems: string[];
    /** ID of the authority associated with the group */
    readonly authority_id: string;
    /** ID of the parent group */
    readonly parent_id: string;
    /**
     * Feature flags per subsystem, i.e. `{ signage: { templates: true } }`.
     * Child groups inherit and can override ancestor keys
     */
    readonly features: PlaceGroupFeatures;
    /** Permission bitmask given to users added without explicit permissions */
    readonly default_permissions: number;
    /** AD group ID mapped to its display name and permission bitmask */
    readonly ad_group_mappings: PlaceGroupAdMappings;
    /** Count of child groups for this group */
    readonly children_count?: number;
    constructor(raw_data?: Partial<PlaceGroup>);
}
/** Feature flags keyed by subsystem, then by feature key */
export type PlaceGroupFeatures = Record<string, Record<string, unknown>>;
/**
 * AD group ID mapped to `[display name, permission bitmask]`.
 * Users in a mapped AD group are added to the group automatically
 */
export type PlaceGroupAdMappings = Record<string, [string, number]>;
/** Groups the current user is a member of with effective permissions. */
export interface PlaceCurrentGroup {
    /** Group details */
    group: PlaceGroup;
    /** Effective permission bitmask for the current user */
    permissions: number;
}
