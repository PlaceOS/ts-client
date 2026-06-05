import { apiEndpoint } from '../auth/functions';
import { post } from '../http/functions';
import { MicrosoftNotification } from './interfaces';

const PATH = 'notifications';

/** Receive a Google push notification */
export function googleNotification(body: unknown = {}): Promise<void> {
    return post(`${apiEndpoint()}/${PATH}/google`, body).then(() => undefined);
}

/** Receive a Microsoft Graph push notification */
export function office365Notification(
    body: MicrosoftNotification,
): Promise<void> {
    return post(`${apiEndpoint()}/${PATH}/office365`, body).then(
        () => undefined,
    );
}
