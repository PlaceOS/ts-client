import { MicrosoftNotification } from './interfaces';
/** Receive a Google push notification */
export declare function googleNotification(body?: unknown): Promise<void>;
/** Receive a Microsoft Graph push notification */
export declare function office365Notification(body: MicrosoftNotification): Promise<void>;
