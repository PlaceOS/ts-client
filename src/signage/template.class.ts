import { SignagePlaylistSchedule } from './interfaces';

export type SignageTemplateLayoutPosition =
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'floating';

export interface SignageTemplateLayout {
    plugin_id?: string;
    position: SignageTemplateLayoutPosition;
    x_pos?: number;
    y_pos?: number;
    plugin_params: Record<string, object>;
}

export class SignageTemplate {
    public readonly created_at: string;
    public readonly updated_at: string;
    public readonly id: string;
    public readonly name: string;
    public readonly description: string;
    public readonly tags: string[];
    public readonly authority_id: string;
    public readonly background_item_id: string;
    public readonly layouts: SignageTemplateLayout[];
    public readonly full_screen_takeover: boolean;
    public readonly approval_requested: boolean;
    public readonly requested_by_id: string;
    public readonly approved: boolean;
    public readonly approved_by_id: string;
    public readonly approved_by_name: string;
    public readonly approved_by_email: string;
    public readonly live_template_id: string;

    constructor(data: Partial<SignageTemplate> = {}) {
        this.created_at = data.created_at || '';
        this.updated_at = data.updated_at || '';
        this.id = data.id || '';
        this.name = data.name || '';
        this.description = data.description || '';
        this.tags = data.tags || [];
        this.authority_id = data.authority_id || '';
        this.background_item_id = data.background_item_id || '';
        this.layouts = data.layouts || [];
        this.full_screen_takeover = data.full_screen_takeover || false;
        this.approval_requested = data.approval_requested || false;
        this.requested_by_id = data.requested_by_id || '';
        this.approved = data.approved || false;
        this.approved_by_id = data.approved_by_id || '';
        this.approved_by_name = data.approved_by_name || '';
        this.approved_by_email = data.approved_by_email || '';
        this.live_template_id = data.live_template_id || '';
    }
}

export class SignageTemplateMapping {
    public readonly created_at: string;
    public readonly updated_at: string;
    public readonly id: string;
    public readonly control_system_id: string;
    public readonly zone_id: string;
    public readonly template_id: string;
    public readonly schedule: SignagePlaylistSchedule | null;

    constructor(data: Partial<SignageTemplateMapping> = {}) {
        this.created_at = data.created_at || '';
        this.updated_at = data.updated_at || '';
        this.id = data.id || '';
        this.control_system_id = data.control_system_id || '';
        this.zone_id = data.zone_id || '';
        this.template_id = data.template_id || '';
        this.schedule = data.schedule || null;
    }
}
