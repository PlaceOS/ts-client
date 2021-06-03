import { HashMap } from '../utilities/types';

export interface TriggerActions {
    /** List of functions to execute when the trigger is activated */
    functions: TriggerFunction[];
    /** List of emails to send when the trigger is activated */
    mailers: TriggerMailer[];
}

export interface TriggerMailer {
    /** List of email addresses to mail to */
    emails: string[];
    /** Contents of the email to send */
    content: string;
}

export interface TriggerFunction {
    /** Module to execute the function on */
    mod: string;
    /** Name of the function to execute */
    method: string;
    /** Map of arguments to pass to the function */
    args?: ExecuteArgs;
}

/** Mapping of method parameters to argument value */
export type ExecuteArgs = HashMap;

export interface TriggerConditions {
    /** List of comparisions used to activate the trigger */
    comparisons: TriggerComparison[];
    /** List of time based activators for the trigger */
    time_dependents: TriggerTimeCondition[];
}

export interface TriggerComparison {
    /** Left hand side details for the comparision */
    left: TriggerConditionValue;
    /** Operator to use for comparing both sides */
    operator: TriggerConditionOperator;
    /** Right hand side details for the comparision */
    right: TriggerConditionValue;
}

export enum TriggerConditionOperator {
    EQ = 'equal',
    NEQ = 'not_equal',
    GT = 'greater_than',
    GTE = 'greater_than_or_equal',
    LT = 'less_than',
    LTE = 'less_than_or_equal',
    AND = 'and',
    OR = 'or',
    XOR = 'exclusive_or',
}

export type TriggerConditionValue =
    | TriggerStatusVariable
    | TriggerConditionConstant;

export type TriggerConditionConstant = number | string | boolean;

export interface TriggerStatusVariable {
    /** Module class name associated with the status variable */
    mod: string;
    /** Name of the status variable */
    status: string;
    /** Sub keys to look at in the status variable's data */
    keys: string[];
}

export type TriggerTimeCondition =
    | TriggerAtTimeCondition
    | TriggerCronTimeCondition;

export interface TriggerAtTimeCondition {
    /** Type of time condition. Either a specific time or cron string */
    type: TriggerTimeConditionType.AT;
    /** Unix epoch in seconds */
    time: number;
}

export interface TriggerCronTimeCondition {
    /** Type of time condition. Either a specific time or cron string */
    type: TriggerTimeConditionType.CRON;
    /** CRON tab string */
    cron: string;
    /** Timezone associated with the schedule */
    timezone: string;
}

export enum TriggerTimeConditionType {
    AT = 'at',
    CRON = 'cron',
}

export interface TriggerWebhook {
    type: TriggerWebhookType;
    payload?: string;
}

export enum TriggerWebhookType {
    ExecuteBefore,
    ExecuteAfter,
    PayloadOnly,
    IgnorePayload,
}
