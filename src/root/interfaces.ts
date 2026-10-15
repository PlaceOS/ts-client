export interface PlacePlatformInfo {
    version: string;
    changelog: string;
}

export interface PlaceVersion {
    service: string;
    commit: string;
    version: string;
    build_time: string;
    platform_version: string;
}

export interface SignalOptions {
    channel: string;
}

/** Where a resync of the MQTT brokers got to */
export interface PlaceSourceResyncStatus {
    state: 'idle' | 'clearing' | 'resyncing' | 'complete' | 'failed';
    /** Whether everything source publishes was removed from the brokers first */
    clear: boolean;
    started_at?: string;
    finished_at?: string;
    /** Retained topics removed, when clearing */
    cleared: number;
    /** Models whose metadata was published again */
    metadata: number;
    error?: string;
}
