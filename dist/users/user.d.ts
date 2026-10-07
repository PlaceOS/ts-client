import { PlaceResource } from '../resources/resource';
export interface WorktimePreference {
    day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    blocks: WorktimeBlock[];
}
export interface WorktimeBlock {
    start_time: number;
    end_time: number;
    /** Name of the location the work is being performed at */
    location?: string;
}
/**
 * Representation of the user model in Place
 */
export declare class PlaceUser extends PlaceResource {
    /** Hash of the email address of the user */
    readonly email_digest: string;
    /** ID of the authority associated with the user */
    readonly authority_id: string;
    /** Email address of the user */
    readonly email: string;
    /** Phone number of the user */
    readonly phone: string;
    /** Display nickname of the user */
    readonly nickname: string;
    /** Country that the user resides in */
    readonly country: string;
    /** Office building the user is associated */
    readonly building: string;
    /** Access control groups that user is associated */
    readonly groups: string[];
    /** Avatar image for the user */
    readonly image: string;
    /** Additional metadata associated with the user */
    readonly metadata: string;
    /** Miscellaneous user data */
    readonly misc: string;
    /** Username credential of the user */
    readonly login_name: string;
    /** Organisation ID of the user */
    readonly staff_id: string;
    /** First name of the user */
    readonly first_name: string;
    /** Last name of the user */
    readonly last_name: string;
    /** Whether user is a support role */
    readonly support: boolean;
    /** Whether user is a system admin role */
    readonly sys_admin: boolean;
    /** Name of the active theme on the displayed UI */
    readonly ui_theme: string;
    /** Preferred language of the user */
    readonly preferred_language: string;
    /** Card Number associated with the user */
    readonly card_number: string;
    /** Organisational department the user belongs */
    readonly department: string;
    /** Default worktime preferences for the user */
    readonly work_preferences: WorktimePreference[];
    /** Overrides of the worktime preferences for the user */
    readonly work_overrides: Record<string, WorktimePreference>;
    /** ID of the user's photo in the PlaceOS uploads service */
    readonly photo_upload_id: string;
    /** Whether the user has opted in to location tracking */
    readonly locatable: boolean;
    /** Password */
    protected password: string;
    /** Password */
    protected confirm_password: string;
    readonly deleted?: boolean;
    constructor(raw_data?: Partial<PlaceUser>);
}
