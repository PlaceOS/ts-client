/** Vendors an AI provider row can be pointed at */
export type SignageAIProviderType = 'OPENAI' | 'AZURE_OPENAI' | 'GOOGLE_VERTEX';

/** Lifecycle of an image generation job */
export type SignageAIJobState =
    | 'queued'
    | 'running'
    | 'done'
    | 'failed'
    | 'cancelled';

/** Whether a job started from a prompt alone or from an existing image */
export type SignageAIJobKind = 'generate' | 'edit';

/** What a single model on a provider is able to do */
export interface SignageAIModelCapabilities {
    /** Vendor identifier for the model, sent back as `model` on a request */
    id: string;
    /** Display name for the model */
    name: string;
    /** Model can create an image from a prompt alone */
    generate: boolean;
    /** Model can edit a supplied source image */
    edit: boolean;
    /** Model can enhance an image without a new brief */
    enhance: boolean;
    /** Maximum number of reference images accepted in one request */
    max_references: number;
    /** Maximum number of candidates the model will return in one request */
    max_candidates: number;
    /** Quality levels the model accepts */
    qualities: string[];
    /** Aspect ratios the model accepts */
    aspect_ratios: string[];
}

/** A configured provider as seen by a user, without its credentials */
export interface SignageAIProviderCapabilities {
    /** ID of the provider row */
    id: string;
    /** Display name for the provider */
    name: string;
    /** Vendor the provider talks to */
    provider: SignageAIProviderType;
    /** Vendor region the provider is deployed in, when it has one */
    region?: string;
    /** Model used when a request does not name one */
    default_model?: string;
    /** Models available on this provider */
    models: SignageAIModelCapabilities[];
}

/** Images the caller has left of their allowance. `null` when the feature is off */
export interface SignageAIQuota {
    /** Candidates the current user may still request today */
    user_remaining_today: number | null;
    /** Candidates the current domain may still request this month */
    domain_remaining_month: number | null;
}

/** What image generation can do on the current domain, and for the current user */
export interface SignageAICapabilities {
    /** Whether image generation can be used at all */
    enabled: boolean;
    /** Why the feature is unavailable. Only set when `enabled` is false */
    reason?: string;
    /** Providers configured for this domain */
    providers: SignageAIProviderCapabilities[];
    /** ID of the provider used when a request does not name one */
    default_provider_id?: string;
    /** Aspect ratios accepted across the platform */
    aspect_ratios: string[];
    /** Quality levels accepted across the platform */
    qualities: string[];
    /** Most candidates that may be asked for in one request */
    max_candidates: number;
    /** Whether the domain has a logo that can be composited over a generated image */
    logo_layer: boolean;
    /** Remaining allowance for the caller and their domain */
    quota: SignageAIQuota;
}

/**
 * One candidate produced by a job. Slots are `null` in `SignageAIJob.images`
 * until the candidate for that slot lands
 */
export interface SignageAIImage {
    /** State of the candidate */
    state: string;
    /** Position of the candidate in the job's image list */
    index: number;
    /** ID of the upload holding the image */
    upload_id: string;
    /** Endpoint returning a signed URL for the image */
    url: string;
    /** Width of the image in pixels, when it could be read */
    width: number | null;
    /** Height of the image in pixels, when it could be read */
    height: number | null;
    /** Content type of the stored image */
    mime: string;
    /** Size of the stored image in bytes */
    bytes: number;
    /** ID of the media item the candidate was kept as. Set by claiming the image */
    item_id?: string;
}

/** An image generation or edit job */
export interface SignageAIJob {
    /** ID of the job */
    id: string;
    /** Lifecycle state of the job */
    state: SignageAIJobState;
    /** Whether the job generates or edits */
    kind: SignageAIJobKind;
    /** Vendor the job was sent to */
    provider?: SignageAIProviderType;
    /** Model the job was sent to */
    model?: string;
    /** Number of candidates asked for */
    candidates: number;
    /** Number of candidates that have landed so far */
    images_produced: number;
    /** ID of the job this one refines, when it is a refine */
    parent_job_id?: string;
    /**
     * Bumped on every change to the job. Pass it back as `since` when long
     * polling so the request only returns once something new has landed
     */
    version: number;
    /** Brief the user asked for */
    prompt?: string;
    /** Candidate slots in order, `null` until that candidate lands */
    images: (SignageAIImage | null)[];
    /** Class of failure, when the job failed */
    error_kind?: string;
    /** Description of the failure, when the job failed */
    error_message?: string;
    /** Vendor spend attributed to the job */
    cost_units?: number;
    /** Time the job took, in milliseconds */
    latency_ms?: number;
    /** Unix epoch in seconds at which the job was accepted */
    created_at?: number;
    /** Unix epoch in seconds at which the job stopped */
    finished_at?: number;
}

/** Body of a request to generate an image from a brief */
export interface SignageAIGenerateRequest {
    /** What the image should show. Required */
    prompt: string;
    /** Shape of the image. Defaults to `16:9` */
    aspect_ratio?: string;
    /** Quality level to ask the vendor for. Defaults to `standard` */
    quality?: string;
    /** Number of candidates to produce. Clamped to the platform maximum */
    candidates?: number;
    /** IDs of uploads to hand the vendor as visual references */
    references?: string[];
    /** Composite the domain logo over the result. Defaults to `true` */
    include_logo?: boolean;
    /** Keep wording out of the image so it can be laid over. Defaults to `true` */
    add_text_with_layer?: boolean;
    /** Wording the image is being made for, used to leave room for it */
    words?: string;
    /** Provider to use. Defaults to the domain's default provider */
    provider_id?: string;
    /** Model to use. Defaults to the provider's default model */
    model?: string;
    /** Signage group the caller is acting in. Required unless the caller is support */
    group_id?: string;
    /** Repeating a key returns the job it first created rather than spending again */
    idempotency_key?: string;
}

/** Body of a request to edit an existing image, or refine an earlier job */
export interface SignageAIEditRequest extends SignageAIGenerateRequest {
    /** ID of the upload to edit. Required */
    source_upload_id: string;
    /** Media item proving the caller may read a source they do not own */
    source_item_id?: string;
    /** ID of the job being refined, so its brief carries into the new prompt */
    parent_job_id?: string;
}

/** Body of a request recording that a candidate became a media item */
export interface SignageAIClaimRequest {
    /** ID of the candidate's upload */
    upload_id: string;
    /** ID of the media item now using the upload */
    item_id: string;
}

/** Allowable query parameters for the AI job show endpoint */
export interface SignageAIJobShowOptions {
    /**
     * Seconds to hold the request open until the job changes, up to `25`.
     * Defaults to `0`, which answers immediately
     */
    wait?: number;
    /** Version the caller already holds. Defaults to the job's current version */
    since?: number;
}

/** Allowable query parameters for the AI jobs index endpoint */
export interface SignageAIJobQueryOptions {
    /** Only return the caller's own jobs. Defaults to `true` */
    mine?: boolean;
    /** Number of jobs to return. Clamped to `100`. Defaults to `20` */
    limit?: number;
}

/** Allowable query parameters for the AI usage endpoint */
export interface SignageAIUsageOptions {
    /** Unix epoch in seconds to report from. Defaults to 30 days ago */
    from?: number;
    /** Unix epoch in seconds to report to. Defaults to now */
    to?: number;
}

/** Spend on one provider and model over the reported period */
export interface SignageAIUsageRow {
    /** Vendor the jobs were sent to */
    provider: string;
    /** Model the jobs were sent to */
    model: string;
    /** Number of jobs */
    jobs: number;
    /** Candidates asked for across those jobs */
    candidates: number;
    /** Candidates that landed across those jobs */
    images_produced: number;
    /** Vendor spend attributed to those jobs */
    cost_units: number;
}

/** A stored provider row. Credentials are never returned */
export interface SignageAIProvider {
    /** ID of the provider row */
    id: string;
    /** Display name for the provider */
    name: string;
    /** Vendor the provider talks to */
    provider: SignageAIProviderType;
    /** Domain the row belongs to. `null` on the shared fallback row */
    authority_id: string | null;
    /** Vendor endpoint, for deployments that have their own */
    endpoint: string | null;
    /** Vendor region, for deployments that have one */
    location: string | null;
    /** Model used when a request does not name one */
    default_model: string | null;
    /** Models this row may be asked for. Empty allows every model the vendor offers */
    allowed_models: string[];
    /** Whether the row may be used */
    enabled: boolean;
    /** Whether the row is the default for its domain */
    is_default: boolean;
    /** Per user and per domain image allowances */
    quotas: Record<string, number>;
    /** Unix epoch in seconds at which the row was created */
    created_at: number;
    /** Unix epoch in seconds at which the row was last changed */
    updated_at: number;
}

/**
 * Body of a request creating or updating a provider row. `credentials` is
 * required on create; left out of an update the stored value is kept
 */
export interface SignageAIProviderRequest {
    /** Display name for the provider */
    name?: string;
    /** Vendor the provider talks to */
    provider?: SignageAIProviderType;
    /** Domain the row belongs to. Leave unset for the shared fallback row */
    authority_id?: string;
    /** Vendor credentials, in the shape that vendor expects */
    credentials?: Record<string, any>;
    /** Vendor endpoint, for deployments that have their own */
    endpoint?: string;
    /** Vendor region, for deployments that have one */
    location?: string;
    /** Model used when a request does not name one */
    default_model?: string;
    /** Models this row may be asked for */
    allowed_models?: string[];
    /** Whether the row may be used */
    enabled?: boolean;
    /** Whether the row is the default for its domain */
    is_default?: boolean;
    /** Per user and per domain image allowances */
    quotas?: Record<string, number>;
}

/** Allowable query parameters for the AI providers index endpoint */
export interface SignageAIProviderQueryOptions {
    /** Return the rows belonging to this domain */
    authority_id?: string;
    /** Include the shared fallback row. Defaults to `true` */
    include_shared?: boolean;
}

/** Outcome of proving a provider row's credentials work */
export interface SignageAIProviderTestResult {
    /** Whether the vendor answered with an image */
    ok: boolean;
    /** Time the vendor took, in milliseconds */
    latency_ms: number;
    /** Model the test was run against */
    model?: string;
    /** Description of the failure, when the test failed */
    error?: string;
    /** Class of failure, when the test failed */
    kind?: string;
}
