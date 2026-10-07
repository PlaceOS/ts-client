import { PlaceTrigger } from '../triggers/trigger';
import { WebhookShowOptions } from './interfaces';
/** Get webhook trigger details */
export declare function showWebhook(id: string, query_params?: WebhookShowOptions): Promise<PlaceTrigger>;
