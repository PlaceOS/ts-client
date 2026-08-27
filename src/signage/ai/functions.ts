import { query, remove, show } from '../../api';
import { apiEndpoint } from '../../auth';
import { patch, post, put } from '../../http/functions';
import { HttpJsonOptions } from '../../http/interfaces';
import { task } from '../../resources/functions';
import { HashMap } from '../../utilities/types';
import {
    SignageAICapabilities,
    SignageAIClaimRequest,
    SignageAIEditRequest,
    SignageAIGenerateRequest,
    SignageAIJob,
    SignageAIJobQueryOptions,
    SignageAIJobShowOptions,
    SignageAIProvider,
    SignageAIProviderQueryOptions,
    SignageAIProviderRequest,
    SignageAIProviderTestResult,
    SignageAIUsageOptions,
    SignageAIUsageRow,
} from './interfaces';

/**
 * @private
 */
const PATH = 'signage/ai';

/**
 * @private
 */
const JOBS_PATH = 'signage/ai/jobs';

/**
 * @private
 */
const PROVIDERS_PATH = 'signage/ai/providers';

/**
 * Get what image generation can do on the current domain, and what the caller
 * has left of their image allowance
 */
export function signageAICapabilities() {
    return show<SignageAICapabilities>({
        id: 'capabilities',
        query_params: {},
        fn: (response) => response as SignageAICapabilities,
        path: PATH,
    });
}

/**
 * Start generating an image from a brief. Answers as soon as the job is
 * accepted, long poll `showSignageAIJob` for the candidates
 * @param request Brief and generation settings
 */
export function generateSignageImage(request: SignageAIGenerateRequest) {
    return post(`${apiEndpoint()}/${PATH}/generate`, request).then(
        (response) => response as unknown as SignageAIJob,
    );
}

/**
 * Start editing an existing image, or refining an earlier job. Answers as soon
 * as the job is accepted, long poll `showSignageAIJob` for the candidates
 * @param request Instruction, source image and generation settings
 */
export function editSignageImage(request: SignageAIEditRequest) {
    return post(`${apiEndpoint()}/${PATH}/edit`, request).then(
        (response) => response as unknown as SignageAIJob,
    );
}

/**
 * Get an image generation job, optionally holding the request open until the
 * job changes.
 *
 * Uses `show` rather than `query` on purpose: a `wait` of up to 25 seconds must
 * not be served from the query dedupe cache, or two pollers share one response
 * and one of them waits twice as long as it asked to. Pass
 * `{ skip_auth_flow: true }` as `options` to stop a failed poll being retried
 * four times before it rejects
 * @param id ID of the job
 * @param query_params Query parameters to add the to request URL
 * @param options Options to add to the request
 */
export function showSignageAIJob(
    id: string,
    query_params: SignageAIJobShowOptions = {},
    options?: HttpJsonOptions,
) {
    return show<SignageAIJob>({
        id,
        query_params,
        fn: (response) => response as SignageAIJob,
        path: JOBS_PATH,
        options,
    });
}

/**
 * List recent image generation jobs, for the recent generations list.
 *
 * The endpoint answers with a plain array rather than a paged index, and the
 * list is polled alongside the jobs themselves, so this uses `show` to stay out
 * of the query dedupe cache
 * @param query_params Query parameters to add the to request URL
 */
export function querySignageAIJobs(
    query_params: SignageAIJobQueryOptions = {},
) {
    return show<SignageAIJob[]>({
        id: 'jobs',
        query_params,
        fn: (response) => response as SignageAIJob[],
        path: PATH,
    });
}

/**
 * Ask a running job to stop. Candidates already with the vendor run to
 * completion, so the returned job may still gain images
 * @param id ID of the job
 */
export function cancelSignageAIJob(id: string) {
    return task<SignageAIJob>({
        id,
        task_name: 'cancel',
        method: 'post',
        path: JOBS_PATH,
        callback: (response) => response as SignageAIJob,
    });
}

/**
 * Record that a candidate was kept as a media item, so the sweep that clears
 * unused candidates leaves it alone
 * @param id ID of the job the candidate belongs to
 * @param request The candidate's upload and the media item now using it
 */
export function claimSignageAIImage(
    id: string,
    request: SignageAIClaimRequest,
) {
    return task<SignageAIJob>({
        id,
        task_name: 'claim',
        form_data: request,
        method: 'post',
        path: JOBS_PATH,
        callback: (response) => response as SignageAIJob,
    });
}

/**
 * Get image generation spend for the current domain, broken down by provider
 * and model
 * @param query_params Query parameters to add the to request URL
 */
export function signageAIUsage(query_params: SignageAIUsageOptions = {}) {
    return show<SignageAIUsageRow[]>({
        id: 'usage',
        query_params,
        fn: (response) => response as SignageAIUsageRow[],
        path: PATH,
    });
}

/** Convert raw server data to an AI provider object */
function processProvider(item: Partial<SignageAIProvider>) {
    return item as SignageAIProvider;
}

/**
 * Query the configured AI providers
 * @param query_params Query parameters to add the to request URL
 */
export function querySignageAIProviders(
    query_params: SignageAIProviderQueryOptions = {},
) {
    return query({
        query_params,
        fn: processProvider,
        path: PROVIDERS_PATH,
    });
}

/**
 * Get the details of an AI provider
 * @param id ID of the provider
 */
export function showSignageAIProvider(id: string) {
    return show({
        id,
        query_params: {},
        fn: processProvider,
        path: PROVIDERS_PATH,
    });
}

/**
 * Add a new AI provider
 * @param form_data Provider details, including the vendor credentials
 */
export function addSignageAIProvider(form_data: SignageAIProviderRequest) {
    return post(`${apiEndpoint()}/${PROVIDERS_PATH}`, form_data).then(
        (response) => response as unknown as SignageAIProvider,
    );
}

/**
 * Update an AI provider. Leaving `credentials` out keeps the stored value.
 *
 * Bypasses the `update` helper because that appends `version` to the query
 * string and provider rows are not versioned
 * @param id ID of the provider
 * @param form_data New values for the provider
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export function updateSignageAIProvider(
    id: string,
    form_data: SignageAIProviderRequest,
    method: 'put' | 'patch' = 'patch',
) {
    return (method === 'put' ? put : patch)(
        `${apiEndpoint()}/${PROVIDERS_PATH}/${id}`,
        form_data,
    ).then((response: HashMap) => response as unknown as SignageAIProvider);
}

/**
 * Remove an AI provider. Jobs it produced keep the vendor and model they
 * recorded
 * @param id ID of the provider
 */
export function removeSignageAIProvider(id: string) {
    return remove({ id, query_params: {}, path: PROVIDERS_PATH });
}

/**
 * Prove an AI provider's credentials work by generating one small image and
 * discarding it
 * @param id ID of the provider
 */
export function testSignageAIProvider(id: string) {
    return task<SignageAIProviderTestResult>({
        id,
        task_name: 'test',
        method: 'post',
        path: PROVIDERS_PATH,
        callback: (response) => response as SignageAIProviderTestResult,
    });
}
