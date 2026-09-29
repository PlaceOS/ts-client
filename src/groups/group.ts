/** Representation of a group in PlaceOS. */
export class PlaceGroup {
    /** ISO8601 timestamp of the creation time of the group */
    public readonly created_at: string;
    /** ISO8601 timestamp of the last update time of the group */
    public readonly updated_at: string;
    /** Unique identifier of the group */
    public readonly id: string;
    /** Human readable name of the group */
    public readonly name: string;
    /** Description of the group's purpose */
    public readonly description: string;
    /** Subsystems this group participates in */
    public readonly subsystems: string[];
    /** ID of the authority associated with the group */
    public readonly authority_id: string;
    /** ID of the parent group */
    public readonly parent_id: string;
    /**
     * Feature flags per subsystem, i.e. `{ signage: { templates: true } }`.
     * Child groups inherit and can override ancestor keys
     */
    public readonly features: PlaceGroupFeatures;
    /** Permission bitmask given to users added without explicit permissions */
    public readonly default_permissions: number;
    /** AD group ID mapped to its display name and permission bitmask */
    public readonly ad_group_mappings: PlaceGroupAdMappings;
    /** Count of child groups for this group */
    public readonly children_count?: number;

    constructor(raw_data: Partial<PlaceGroup> = {}) {
        this.created_at = raw_data.created_at || '';
        this.updated_at = raw_data.updated_at || '';
        this.id = raw_data.id || '';
        this.name = raw_data.name || '';
        this.description = raw_data.description || '';
        this.subsystems = raw_data.subsystems || [];
        this.authority_id = raw_data.authority_id || '';
        this.parent_id = raw_data.parent_id || '';
        this.features = raw_data.features || {};
        this.default_permissions = raw_data.default_permissions || 0;
        this.ad_group_mappings = raw_data.ad_group_mappings || {};
        if (isFinite(Number(raw_data.children_count))) {
            this.children_count = raw_data.children_count;
        }
    }
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
