import { HashMap } from '../utilities/types';

export type SignagePlaybackType = 'static' | 'interactive' | 'playsthrough';

/** Whether the plugin renders as full content or as a template widget */
export type SignagePluginType = 'plugin' | 'widget';

export class SignagePlugin {
    public readonly id: string;
    public readonly created_at: number;
    public readonly updated_at: number;
    public readonly name: string;
    public readonly description: string;
    public readonly uri: string;
    public readonly playback_type: SignagePlaybackType;
    public readonly plugin_type: SignagePluginType;
    public readonly authority_id: string;
    public readonly enabled: boolean;
    public readonly params: HashMap;
    public readonly defaults: HashMap;

    constructor(data: Partial<SignagePlugin> = {}) {
        this.id = data.id || '';
        this.created_at = data.created_at || 0;
        this.updated_at = data.updated_at || 0;
        this.name = data.name || '';
        this.description = data.description || '';
        this.uri = data.uri || '';
        this.playback_type = data.playback_type || 'static';
        this.plugin_type = data.plugin_type || 'plugin';
        this.authority_id = data.authority_id || '';
        this.enabled = data.enabled ?? true;
        this.params = data.params || {};
        this.defaults = data.defaults || {};
    }
}
