import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { apiEndpoint } from '../auth/functions';
import { get } from '../http/functions';
import { PlaceTrigger } from '../triggers/trigger';
import { toQueryString } from '../utilities/api';
import { HashMap } from '../utilities/types';
import { WebhookShowOptions } from './interfaces';

const PATH = 'webhook';

/** Get webhook trigger details */
export function showWebhook(
    id: string,
    query_params: WebhookShowOptions = {},
): Observable<PlaceTrigger> {
    const q = toQueryString(query_params);
    const url = `${apiEndpoint()}/${PATH}/${encodeURIComponent(id)}${q ? '?' + q : ''}`;
    return get(url).pipe(map((resp: HashMap) => new PlaceTrigger(resp)));
}
