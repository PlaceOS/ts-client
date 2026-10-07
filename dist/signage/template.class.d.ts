import { SignagePlaylistSchedule } from './interfaces';
export type SignageTemplateLayoutPosition = 'top' | 'bottom' | 'left' | 'right' | 'floating';
export interface SignageTemplateLayout {
    plugin_id?: string;
    position: SignageTemplateLayoutPosition;
    x_pos?: number;
    y_pos?: number;
    plugin_params: Record<string, object>;
}
export declare class SignageTemplate {
    readonly created_at: string;
    readonly updated_at: string;
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly tags: string[];
    readonly authority_id: string;
    readonly background_item_id: string;
    readonly layouts: SignageTemplateLayout[];
    readonly full_screen_takeover: boolean;
    readonly merge: boolean;
    readonly approval_requested: boolean;
    readonly requested_by_id: string;
    readonly approved: boolean;
    readonly approved_by_id: string;
    readonly approved_by_name: string;
    readonly approved_by_email: string;
    readonly live_template_id: string;
    readonly shared_with: {
        id: string;
        name: string;
    }[];
    constructor(data?: Partial<SignageTemplate>);
}
export declare class SignageTemplateMapping {
    readonly created_at: string;
    readonly updated_at: string;
    readonly id: string;
    readonly control_system_id: string;
    readonly zone_id: string;
    readonly template_id: string;
    readonly schedule: SignagePlaylistSchedule | null;
    constructor(data?: Partial<SignageTemplateMapping>);
}
