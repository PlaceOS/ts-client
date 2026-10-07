import { HttpJsonOptions } from '../../http/interfaces';
import { HashMap } from '../../utilities/types';
import { SignageAICapabilities, SignageAIClaimRequest, SignageAIEditRequest, SignageAIGenerateRequest, SignageAIJob, SignageAIJobQueryOptions, SignageAIJobShowOptions, SignageAIProvider, SignageAIProviderQueryOptions, SignageAIProviderRequest, SignageAIProviderTestResult, SignageAIUsageOptions, SignageAIUsageRow } from './interfaces';
/**
 * Get what image generation can do on the current domain, and what the caller
 * has left of their image allowance
 */
export declare function signageAICapabilities(): Promise<SignageAICapabilities>;
/**
 * Start generating an image from a brief. Answers as soon as the job is
 * accepted, long poll `showSignageAIJob` for the candidates
 * @param request Brief and generation settings
 */
export declare function generateSignageImage(request: SignageAIGenerateRequest): Promise<SignageAIJob>;
/**
 * Start editing an existing image, or refining an earlier job. Answers as soon
 * as the job is accepted, long poll `showSignageAIJob` for the candidates
 * @param request Instruction, source image and generation settings
 */
export declare function editSignageImage(request: SignageAIEditRequest): Promise<SignageAIJob>;
/**
 * Get an image generation job, optionally holding the request open until the
 * job changes.
 *
 * Pass `{ skip_auth_flow: true }` as `options` to stop a failed poll being
 * retried four times before it rejects
 * @param id ID of the job
 * @param query_params Query parameters to add the to request URL
 * @param options Options to add to the request
 */
export declare function showSignageAIJob(id: string, query_params?: SignageAIJobShowOptions, options?: HttpJsonOptions): Promise<SignageAIJob>;
/**
 * List recent image generation jobs, for the recent generations list.
 * @param query_params Query parameters to add the to request URL
 */
export declare function querySignageAIJobs(query_params?: SignageAIJobQueryOptions): Promise<SignageAIJob[]>;
/**
 * Ask a running job to stop. Candidates already with the vendor run to
 * completion, so the returned job may still gain images
 * @param id ID of the job
 */
export declare function cancelSignageAIJob(id: string): Promise<SignageAIJob>;
/**
 * Record that a candidate was kept as a media item, so the sweep that clears
 * unused candidates leaves it alone
 * @param id ID of the job the candidate belongs to
 * @param request The candidate's upload and the media item now using it
 */
export declare function claimSignageAIImage(id: string, request: SignageAIClaimRequest): Promise<SignageAIJob>;
/**
 * Get image generation spend for the current domain, broken down by provider
 * and model
 * @param query_params Query parameters to add the to request URL
 */
export declare function signageAIUsage(query_params?: SignageAIUsageOptions): Promise<SignageAIUsageRow[]>;
/**
 * Query the configured AI providers
 * @param query_params Query parameters to add the to request URL
 */
export declare function querySignageAIProviders(query_params?: SignageAIProviderQueryOptions): import('../..').QueryResponse<SignageAIProvider>;
/**
 * Get the details of an AI provider
 * @param id ID of the provider
 */
export declare function showSignageAIProvider(id: string): Promise<SignageAIProvider>;
/**
 * Add a new AI provider
 * @param form_data Provider details, including the vendor credentials
 */
export declare function addSignageAIProvider(form_data: SignageAIProviderRequest): Promise<SignageAIProvider>;
/**
 * Update an AI provider. Leaving `credentials` out keeps the stored value.
 * @param id ID of the provider
 * @param form_data New values for the provider
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateSignageAIProvider(id: string, form_data: SignageAIProviderRequest, method?: 'put' | 'patch'): Promise<SignageAIProvider>;
/**
 * Remove an AI provider. Jobs it produced keep the vendor and model they
 * recorded
 * @param id ID of the provider
 */
export declare function removeSignageAIProvider(id: string): Promise<HashMap<any>>;
/**
 * Prove an AI provider's credentials work by generating one small image and
 * discarding it
 * @param id ID of the provider
 */
export declare function testSignageAIProvider(id: string): Promise<SignageAIProviderTestResult>;
