import { afterEach, describe, expect, test, vi } from 'vitest';
import * as Auth from '../../src/auth';
import * as Http from '../../src/http/functions';
import * as Resources from '../../src/resources/functions';
import * as SERVICE from '../../src/signage/functions';
import {
    SignageTemplate,
    SignageTemplateMapping,
} from '../../src/signage/template.class';

describe('Signage API', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('should allow listing media tags', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!(['promo']) as any));

        const tags = await SERVICE.listSignageMediaTags({
            group_id: 'group-123',
        });

        expect(tags).toEqual(['promo']);
        expect(spy).toHaveBeenCalledWith({
            id: 'tags',
            query_params: { group_id: 'group-123' },
            fn: expect.any(Function),
            path: 'signage/media',
        });
    });

    test('should allow listing media tag counts', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) =>
            Promise.resolve(_.fn!({ promo: 3 }) as any),
        );

        const counts = await SERVICE.listSignageMediaTagCounts({
            group_id: 'group-123',
        });

        expect(counts).toEqual({ promo: 3 });
        expect(spy).toHaveBeenCalledWith({
            id: 'tag_counts',
            query_params: { group_id: 'group-123' },
            fn: expect.any(Function),
            path: 'signage/media',
        });
    });

    test('should allow unlinking media from a group', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockResolvedValue({});

        await SERVICE.removeSignageMedia('media-123', {
            group_id: 'group-123',
        });

        expect(spy).toHaveBeenCalledWith({
            id: 'media-123',
            query_params: { group_id: 'group-123' },
            path: 'signage/media',
        });
    });

    test('should allow unlinking templates from a group', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockResolvedValue({});

        await SERVICE.removeSignageTemplate('template-123', {
            group_id: 'group-123',
        });

        expect(spy).toHaveBeenCalledWith({
            id: 'template-123',
            query_params: { group_id: 'group-123' },
            path: 'signage/templates',
        });
    });

    test('should allow posting player metrics', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockResolvedValue({} as any);

        const metrics = {
            play_through_counts: { 'playlist-123': 2 },
            playlist_counts: { 'playlist-123': 5 },
            media_counts: { 'media-123': 7 },
        };
        await SERVICE.updateSignageMetrics('sys-123', metrics);

        expect(spy).toHaveBeenCalledWith({
            id: 'sys-123',
            task_name: 'metrics',
            form_data: metrics,
            method: 'post',
            path: 'signage',
        });
    });

    test('should allow scheduling playlist media', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation((_) => Promise.resolve(_.callback!({}) as any));

        await SERVICE.scheduleSignagePlaylistMedia('playlist-123', {
            item_id: 'media-123',
            schedules: [
                {
                    play_cron: '* * * * *',
                    play_period: 30,
                    play_takeover: false,
                },
            ],
        });

        expect(spy).toHaveBeenCalledWith({
            id: 'playlist-123',
            task_name: 'media/schedule',
            form_data: {
                item_id: 'media-123',
                schedules: [
                    {
                        play_cron: '* * * * *',
                        play_period: 30,
                        play_takeover: false,
                    },
                ],
            },
            method: 'post',
            path: 'signage/playlists',
            callback: expect.any(Function),
        });
    });

    test('should allow updating playlist media schedules', async () => {
        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        const spy = vi.spyOn(Http, 'patch');
        spy.mockImplementation((_) =>
            Promise.resolve({
                id: 'schedule-123',
                playlist_id: 'playlist-123',
                item_id: 'media-123',
            } as any),
        );

        const schedule = await SERVICE.updateSignagePlaylistMediaSchedule(
            'playlist-123',
            'media-123',
            {
                schedules: [
                    {
                        play_cron: '* * * * *',
                        play_period: 30,
                        play_takeover: true,
                    },
                ],
            },
        );

        expect(schedule.item_id).toBe('media-123');
        expect(spy).toHaveBeenCalledWith(
            '/api/engine/v2/signage/playlists/playlist-123/media/schedule/media-123',
            {
                schedules: [
                    {
                        play_cron: '* * * * *',
                        play_period: 30,
                        play_takeover: true,
                    },
                ],
            },
        );
    });

    test('should allow querying signage templates', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({
                total: 1,
                next: () => null,
                data: [_.fn!({ id: 'template-123' })],
            }),
        );

        const result = await SERVICE.querySignageTemplates({
            group_id: 'group-123',
        });

        expect(result.data[0]).toBeInstanceOf(SignageTemplate);
        expect(spy).toHaveBeenCalledWith({
            query_params: { group_id: 'group-123' },
            fn: expect.any(Function),
            path: 'signage/templates',
        });
    });

    test('should allow creating signage templates in a group', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) =>
            Promise.resolve(_.fn!({ id: 'template-123', ..._.form_data })),
        );

        const template = await SERVICE.addSignageTemplate(
            { name: 'Welcome' },
            { group_id: 'group-123' },
        );

        expect(template).toBeInstanceOf(SignageTemplate);
        expect(spy).toHaveBeenCalledWith({
            form_data: { name: 'Welcome' },
            query_params: { group_id: 'group-123' },
            fn: expect.any(Function),
            path: 'signage/templates',
        });
    });

    test('should allow managing signage template approval', async () => {
        const spy = vi.spyOn(Resources, 'task');
        spy.mockImplementation((_) =>
            Promise.resolve(_.callback ? _.callback({ id: _.id }) : {}),
        );

        const approved = await SERVICE.approveSignageTemplate('template-123');
        await SERVICE.requestApprovalSignageTemplate(
            'template-123',
            'group-123',
            'Please review',
            'user-123',
        );
        await SERVICE.removeSignageTemplateDraft('template-123');

        expect(approved).toBeInstanceOf(SignageTemplate);
        expect(spy).toHaveBeenNthCalledWith(1, {
            id: 'template-123',
            task_name: 'approve',
            method: 'post',
            path: 'signage/templates',
            callback: expect.any(Function),
        });
        expect(spy).toHaveBeenNthCalledWith(2, {
            id: 'template-123',
            task_name:
                'request_approval?group_id=group-123&approver_id=user-123',
            method: 'post',
            path: 'signage/templates',
            form_data: { message: 'Please review' },
        });
        expect(spy).toHaveBeenNthCalledWith(3, {
            id: 'template-123',
            task_name: 'draft',
            method: 'del',
            path: 'signage/templates',
        });
    });

    test('should allow sharing signage templates', async () => {
        vi.spyOn(Auth, 'apiEndpoint').mockReturnValue('/api/engine/v2');
        const spy = vi.spyOn(Http, 'post');
        spy.mockResolvedValue({
            linked: ['template-123'],
            already_present: [],
        });

        const result = await SERVICE.shareSignageTemplates({
            items: ['template-123', 'template-456'],
            to: 'group-123',
        });

        expect(result.linked).toEqual(['template-123']);
        expect(spy).toHaveBeenCalledWith(
            '/api/engine/v2/signage/templates/share?items=template-123%2Ctemplate-456&to=group-123',
            {},
        );
    });

    test('should allow updating signage template mappings', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) =>
            Promise.resolve(_.fn!({ id: _.id, ..._.form_data })),
        );

        const mapping = await SERVICE.updateSignageTemplateMapping(
            'mapping-123',
            { schedule: null },
        );

        expect(mapping).toBeInstanceOf(SignageTemplateMapping);
        expect(mapping.schedule).toBeNull();
        expect(spy).toHaveBeenCalledWith({
            id: 'mapping-123',
            form_data: { schedule: null },
            query_params: {},
            method: 'patch',
            fn: expect.any(Function),
            path: 'signage/template_mappings',
        });
    });
});
