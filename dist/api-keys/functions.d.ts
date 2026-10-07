import { PlaceApiKey } from './api-key';
import { PlaceApiKeyJwt, PlaceApiKeyQueryOptions } from './interfaces';
/** Query API keys */
export declare function queryApiKeys(query_params?: PlaceApiKeyQueryOptions): import('..').QueryResponse<PlaceApiKey>;
/** Show an API key */
export declare function showApiKey(id: string): Promise<PlaceApiKey>;
/** Create an API key */
export declare function addApiKey(form_data: Partial<PlaceApiKey>): Promise<PlaceApiKey>;
/** Update an API key */
export declare function updateApiKey(id: string, form_data: Partial<PlaceApiKey>, method?: 'put' | 'patch'): Promise<PlaceApiKey>;
/** Remove an API key */
export declare function removeApiKey(id: string): Promise<import('../utilities/types').HashMap<any>>;
/** Inspect the current API key permissions as a JWT payload */
export declare function inspectApiKey(): Promise<PlaceApiKeyJwt>;
