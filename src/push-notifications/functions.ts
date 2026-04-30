import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiEndpoint } from '../auth/functions';
import { post } from '../http/functions';
import { MicrosoftNotification } from './interfaces';

const PATH = 'notifications';

/** Receive a Google push notification */
export function googleNotification(body: unknown = {}): Observable<void> {
    return post(`${apiEndpoint()}/${PATH}/google`, body).pipe(map(() => undefined));
}

/** Receive a Microsoft Graph push notification */
export function office365Notification(
    body: MicrosoftNotification,
): Observable<void> {
    return post(`${apiEndpoint()}/${PATH}/office365`, body).pipe(
        map(() => undefined),
    );
}
