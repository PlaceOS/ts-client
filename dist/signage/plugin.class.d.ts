import { HashMap } from '../utilities/types';
export type SignagePlaybackType = 'static' | 'interactive' | 'playsthrough';
/** Whether the plugin renders as full content or as a template widget */
export type SignagePluginType = 'plugin' | 'widget';
export declare class SignagePlugin {
    readonly id: string;
    readonly created_at: number;
    readonly updated_at: number;
    readonly name: string;
    readonly description: string;
    readonly uri: string;
    readonly playback_type: SignagePlaybackType;
    readonly plugin_type: SignagePluginType;
    readonly authority_id: string;
    readonly enabled: boolean;
    readonly params: HashMap;
    readonly defaults: HashMap;
    constructor(data?: Partial<SignagePlugin>);
}
