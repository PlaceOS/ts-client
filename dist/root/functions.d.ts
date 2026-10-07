import { HashMap } from '../utilities/types';
import { PlacePlatformInfo, PlaceVersion, ReindexOptions } from './interfaces';
/** Check API health */
export declare function healthCheck(): Promise<void>;
/** Get platform release details */
export declare function platformInfo(): Promise<PlacePlatformInfo>;
/** Get this service version */
export declare function serviceVersion(): Promise<PlaceVersion>;
/** Get core node versions */
export declare function coreVersions(): Promise<PlaceVersion[]>;
/** List available API scopes */
export declare function apiScopes(): Promise<string[]>;
/** Signal a channel in a similar manner to a webhook for drivers */
export declare function signal(channel: string, body?: HashMap): Promise<void>;
/** @deprecated No-op since PlaceOS moved search to PostgreSQL (PPT-2644); will be removed */
export declare function reindex(query_params?: ReindexOptions): Promise<void>;
/** @deprecated No-op since PlaceOS moved search to PostgreSQL (PPT-2644); will be removed */
export declare function backfill(): Promise<void>;
