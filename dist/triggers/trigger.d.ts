import { HttpVerb } from '../http/interfaces';
import { PlaceResource } from '../resources/resource';
import { PlaceSystem } from '../systems/system';
import { TriggerActions, TriggerConditions } from './interfaces';
/**
 * @hidden
 */
export interface PlaceTriggerComplete extends Partial<PlaceTrigger> {
    trigger_count?: number;
    control_system?: PlaceSystem;
}
export declare class PlaceTrigger extends PlaceResource {
    /** ID of the organisation that owns this row; empty when unowned */
    readonly organisation_id: string;
    /** Name of the system assocaited with the trigger */
    readonly system_name: string;
    /** Number of times the trigger has been activated/triggered */
    readonly activated_count: number;
    /** Description of the trigger */
    readonly description: string;
    /** Duration with which to ignore sequential activations of the trigger */
    readonly debounce_period: number;
    /** Whether the trigger should take priority */
    readonly important: boolean;
    /** Whether trigger is enabled on the associated zone or system */
    readonly enabled: boolean;
    /** Whether the trigger can call webhooks */
    readonly enable_webhook: boolean;
    /** Whether the trigger instance can execute methods */
    readonly exec_enabled: boolean;
    /** Auth key for trigger's webhook */
    readonly webhook_secret: string;
    /** HTTP verbs supported by the webhook */
    readonly supported_methods: readonly HttpVerb[];
    /** ID of the system associated with the trigger */
    readonly control_system_id: string;
    /** ID of the zone associated with the trigger */
    readonly zone_id: string;
    /** ID of the Parent trigger */
    readonly trigger_id: string;
    /** List of playlist IDs associated with the system */
    readonly playlists: readonly string[];
    readonly any_match: boolean;
    /** ID of the system associated with the trigger */
    get system_id(): string;
    /** Actions to perform when the trigger is activated */
    get actions(): TriggerActions;
    /** Conditions for activating the trigger */
    get conditions(): TriggerConditions;
    /** Actions to perform when the trigger is activated */
    private _actions;
    /** Conditions for activating the trigger */
    private _conditions;
    constructor(raw_data?: PlaceTriggerComplete);
}
