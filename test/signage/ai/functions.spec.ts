import { afterEach, describe, expect, test, vi } from 'vitest';
import * as Auth from '../../../src/auth';
import * as Http from '../../../src/http/functions';
import * as Resources from '../../../src/resources/functions';
import * as SERVICE from '../../../src/signage/ai/functions';

describe('Signage AI API', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('should allow listing AI capabilities', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) =>
            Promise.resolve(
                _.fn!({
                    enabled: true,
                    providers: [],
                    aspect_ratios: ['16:9'],
                    qualities: ['standard'],
                    max_candidates: 4,
                    logo_layer: true,
                    quota: {
                        user_remaining_today: 12,
                        domain_remaining_month: 400,
                    },
                }) as any,
            ),
        );

        const capabilities = await SERVICE.signageAICapabilities();

        expect(capabilities.enabled).toBe(true);
        expect(capabilities.quota.user_remaining_today).toBe(12);
        expect(spy).toHaveBeenCalledWith({
            id: 'capabilities',
            query_params: {},
            fn: expect.any(Function),
            path: 'signage/ai',
        });
    });

    test('should allow generating an image', async () => {
        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        const spy = vi.spyOn(Http, 'post');
        spy.mockResolvedValue({ id: 'job-123', state: 'queued' } as any);

        const request = {
            prompt: 'A quiet foyer at dawn',
            aspect_ratio: '16:9',
            candidates: 2,
            group_id: 'group-123',
            idempotency_key: 'key-123',
        };
        const job = await SERVICE.generateSignageImage(request);

        expect(job.id).toBe('job-123');
        expect(spy).toHaveBeenCalledWith(
            '/api/engine/v2/signage/ai/generate',
            request,
        );
    });

    test('should allow editing an image', async () => {
        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        const spy = vi.spyOn(Http, 'post');
        spy.mockResolvedValue({ id: 'job-456', kind: 'edit' } as any);

        const request = {
            prompt: 'Warmer light',
            source_upload_id: 'upload-123',
            source_item_id: 'item-123',
            parent_job_id: 'job-123',
            group_id: 'group-123',
        };
        const job = await SERVICE.editSignageImage(request);

        expect(job.kind).toBe('edit');
        expect(spy).toHaveBeenCalledWith(
            '/api/engine/v2/signage/ai/edit',
            request,
        );
    });

    test('should long poll an AI job without the query cache', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) =>
            Promise.resolve(_.fn!({ id: 'job-123', version: 4 }) as any),
        );

        const job = await SERVICE.showSignageAIJob(
            'job-123',
            { wait: 25, since: 3 },
            { skip_auth_flow: true },
        );

        expect(job.version).toBe(4);
        expect(spy).toHaveBeenCalledWith({
            id: 'job-123',
            query_params: { wait: 25, since: 3 },
            fn: expect.any(Function),
            path: 'signage/ai/jobs',
            options: { skip_auth_flow: true },
        });
    });

    test('should allow listing recent AI jobs', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) =>
            Promise.resolve(_.fn!([{ id: 'job-123' }]) as any),
        );

        const jobs = await SERVICE.querySignageAIJobs({ mine: true, limit: 5 });

        expect(jobs.length).toBe(1);
        expect(jobs[0].id).toBe('job-123');
        expect(spy).toHaveBeenCalledWith({
            id: 'jobs',
            query_params: { mine: true, limit: 5 },
            fn: expect.any(Function),
            path: 'signage/ai',
        });
    });

    test('should allow cancelling and claiming AI jobs', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation((_) =>
            Promise.resolve(_.callback!({ id: _.id }) as any),
        );

        const cancelled = await SERVICE.cancelSignageAIJob('job-123');
        const claimed = await SERVICE.claimSignageAIImage('job-123', {
            upload_id: 'upload-123',
            item_id: 'item-123',
        });

        expect(cancelled.id).toBe('job-123');
        expect(claimed.id).toBe('job-123');
        expect(spy).toHaveBeenNthCalledWith(1, {
            id: 'job-123',
            task_name: 'cancel',
            method: 'post',
            path: 'signage/ai/jobs',
            callback: expect.any(Function),
        });
        expect(spy).toHaveBeenNthCalledWith(2, {
            id: 'job-123',
            task_name: 'claim',
            form_data: { upload_id: 'upload-123', item_id: 'item-123' },
            method: 'post',
            path: 'signage/ai/jobs',
            callback: expect.any(Function),
        });
    });

    test('should allow listing AI usage', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) =>
            Promise.resolve(
                _.fn!([
                    {
                        provider: 'OPENAI',
                        model: 'gpt-image-1',
                        jobs: 3,
                        candidates: 6,
                        images_produced: 6,
                        cost_units: 0.42,
                    },
                ]) as any,
            ),
        );

        const usage = await SERVICE.signageAIUsage({ from: 1, to: 2 });

        expect(usage[0].cost_units).toBe(0.42);
        expect(spy).toHaveBeenCalledWith({
            id: 'usage',
            query_params: { from: 1, to: 2 },
            fn: expect.any(Function),
            path: 'signage/ai',
        });
    });

    test('should allow querying AI providers', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({
                total: 1,
                next: () => null,
                data: [_.fn!({ id: 'provider-123' })],
            }),
        );

        const result = await SERVICE.querySignageAIProviders({
            authority_id: 'authority-123',
            include_shared: false,
        });

        expect(result.data[0].id).toBe('provider-123');
        expect(spy).toHaveBeenCalledWith({
            query_params: {
                authority_id: 'authority-123',
                include_shared: false,
            },
            fn: expect.any(Function),
            path: 'signage/ai/providers',
        });
    });

    test('should allow showing an AI provider', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) =>
            Promise.resolve(_.fn!({ id: 'provider-123' }) as any),
        );

        const provider = await SERVICE.showSignageAIProvider('provider-123');

        expect(provider.id).toBe('provider-123');
        expect(spy).toHaveBeenCalledWith({
            id: 'provider-123',
            query_params: {},
            fn: expect.any(Function),
            path: 'signage/ai/providers',
        });
    });

    test('should allow adding an AI provider', async () => {
        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        const spy = vi.spyOn(Http, 'post');
        spy.mockResolvedValue({ id: 'provider-123' } as any);

        const form_data = {
            name: 'OpenAI',
            provider: 'OPENAI' as const,
            credentials: { api_key: 'secret' },
        };
        const provider = await SERVICE.addSignageAIProvider(form_data);

        expect(provider.id).toBe('provider-123');
        expect(spy).toHaveBeenCalledWith(
            '/api/engine/v2/signage/ai/providers',
            form_data,
        );
    });

    test('should update an AI provider without a version', async () => {
        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        const patch_spy = vi.spyOn(Http, 'patch');
        patch_spy.mockResolvedValue({ id: 'provider-123' } as any);
        const put_spy = vi.spyOn(Http, 'put');
        put_spy.mockResolvedValue({ id: 'provider-123' } as any);

        await SERVICE.updateSignageAIProvider('provider-123', {
            enabled: false,
        });
        await SERVICE.updateSignageAIProvider(
            'provider-123',
            { enabled: true },
            'put',
        );

        expect(patch_spy).toHaveBeenCalledWith(
            '/api/engine/v2/signage/ai/providers/provider-123',
            { enabled: false },
        );
        expect(put_spy).toHaveBeenCalledWith(
            '/api/engine/v2/signage/ai/providers/provider-123',
            { enabled: true },
        );
    });

    test('should allow removing an AI provider', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockResolvedValue({});

        await SERVICE.removeSignageAIProvider('provider-123');

        expect(spy).toHaveBeenCalledWith({
            id: 'provider-123',
            query_params: {},
            path: 'signage/ai/providers',
        });
    });

    test('should allow testing an AI provider', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation((_) =>
            Promise.resolve(_.callback!({ ok: true, latency_ms: 1200 }) as any),
        );

        const result = await SERVICE.testSignageAIProvider('provider-123');

        expect(result.ok).toBe(true);
        expect(result.latency_ms).toBe(1200);
        expect(spy).toHaveBeenCalledWith({
            id: 'provider-123',
            task_name: 'test',
            method: 'post',
            path: 'signage/ai/providers',
            callback: expect.any(Function),
        });
    });
});
