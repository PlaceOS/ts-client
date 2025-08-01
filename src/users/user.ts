import { PlaceResource } from '../resources/resource';

export interface WorktimePreference {
    /* Index of the day of the week. `0` being Sunday */
    day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    blocks: WorktimeBlock[];
}

export interface WorktimeBlock {
    /* Start time of work hours. e.g. `7.5` being 7:30AM */
    start_time: number;
    /* End time of work hours. e.g. `18.5` being 6:30PM */
    end_time: number;
    /** Name of the location the work is being performed at */
    location?: string;
}

/**
 * Representation of the user model in Place
 */
export class PlaceUser extends PlaceResource {
    /** Hash of the email address of the user */
    public readonly email_digest: string;
    /** ID of the authority associated with the user */
    public readonly authority_id: string;
    /** Email address of the user */
    public readonly email: string;
    /** Phone number of the user */
    public readonly phone: string;
    /** Country that the user resides in */
    public readonly country: string;
    /** Office building the user is associated */
    public readonly building: string;
    /** Access control groups that user is associated */
    public readonly groups: string[];
    /** Avatar image for the user */
    public readonly image: string;
    /** Additional metadata associated with the user */
    public readonly metadata: string;
    /** Username credential of the user */
    public readonly login_name: string;
    /** Organisation ID of the user */
    public readonly staff_id: string;
    /** First name of the user */
    public readonly first_name: string;
    /** Last name of the user */
    public readonly last_name: string;
    /** Whether user is a support role */
    public readonly support: boolean;
    /** Whether user is a system admin role */
    public readonly sys_admin: boolean;
    /** Name of the active theme on the displayed UI */
    public readonly ui_theme: string;
    /** Card Number associated with the user */
    public readonly card_number: string;
    /** Organisational department the user belongs */
    public readonly department: string;
    /** Default worktime preferences for the user */
    public readonly work_preferences: WorktimePreference[];
    /** Overrides of the worktime preferences for the user */
    public readonly work_overrides: Record<string, WorktimePreference>;
    /** ID of the user's photo in the PlaceOS uploads service */
    public readonly photo_upload_id: string;
    /** Whether the user has opted in to location tracking */
    public readonly locatable: boolean;
    /** Password */
    protected password = '';
    /** Password */
    protected confirm_password = '';

    constructor(raw_data: Partial<PlaceUser> = {}) {
        super(raw_data);
        this.authority_id = raw_data.authority_id || '';
        this.email = raw_data.email || '';
        this.email_digest = raw_data.email_digest || '';
        this.phone = raw_data.phone || '';
        this.country = raw_data.country || '';
        this.building = raw_data.building || '';
        this.image = raw_data.image || '';
        this.metadata = raw_data.metadata || '';
        this.login_name = raw_data.login_name || '';
        this.staff_id = raw_data.staff_id || '';
        this.first_name = raw_data.first_name || '';
        this.last_name = raw_data.last_name || '';
        this.support = !!raw_data.support;
        this.sys_admin = !!raw_data.sys_admin;
        this.ui_theme = raw_data.ui_theme || '';
        this.card_number = raw_data.card_number || '';
        this.groups = raw_data.groups || [];
        this.department = raw_data.department || '';
        this.photo_upload_id = raw_data.photo_upload_id || '';
        this.work_preferences = raw_data.work_preferences || [];
        this.work_overrides = raw_data.work_overrides || ({} as any);
        this.locatable = raw_data.locatable ?? true;
    }
}
