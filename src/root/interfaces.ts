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

export interface ReindexOptions {
    backfill?: boolean;
}
