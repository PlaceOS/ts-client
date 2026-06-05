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
): Promise<PlaceTrigger> {
    const q = toQueryString(query_params);
    const url = `${apiEndpoint()}/${PATH}/${encodeURIComponent(id)}${q ? '?' + q : ''}`;
    return get(url).then((resp: HashMap) => new PlaceTrigger(resp));
}
