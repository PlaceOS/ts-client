import { create, query, remove, show, update } from '../resources/functions';
import { get } from '../http/functions';
import { apiEndpoint } from '../auth/functions';
import { PlaceApiKey } from './api-key';
import { PlaceApiKeyJwt, PlaceApiKeyQueryOptions } from './interfaces';

const PATH = 'api_keys';

function process(item: Partial<PlaceApiKey>) {
    return new PlaceApiKey(item);
}

/** Query API keys */
export function queryApiKeys(query_params: PlaceApiKeyQueryOptions = {}) {
    return query({ query_params, fn: process, path: PATH });
}

/** Show an API key */
export function showApiKey(id: string) {
    return show({ id, query_params: {}, fn: process, path: PATH });
}

/** Create an API key */
export function addApiKey(form_data: Partial<PlaceApiKey>) {
    return create({ form_data, query_params: {}, fn: process, path: PATH });
}

/** Update an API key */
export function updateApiKey(
    id: string,
    form_data: Partial<PlaceApiKey>,
    method: 'put' | 'patch' = 'patch',
) {
    return update({ id, form_data, query_params: {}, method, fn: process, path: PATH });
}

/** Remove an API key */
export function removeApiKey(id: string) {
    return remove({ id, query_params: {}, path: PATH });
}

/** Inspect the current API key permissions as a JWT payload */
export function inspectApiKey() {
    return get(`${apiEndpoint()}/${PATH}/inspect`) as any as import('rxjs').Observable<PlaceApiKeyJwt>;
}
