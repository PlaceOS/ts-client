import { afterEach, describe, expect, test, vi } from 'vitest';
import * as Auth from '../../src/auth';
import * as Http from '../../src/http/functions';
import * as Resources from '../../src/resources/functions';
import * as SERVICE from '../../src/signage/functions';

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
});
