import { of } from 'rxjs';
import { describe, expect, test, vi } from 'vitest';
import * as SERVICE from '../../src/webrtc/functions';
import * as Http from '../../src/http/functions';
import * as Auth from '../../src/auth/functions';

describe('WebRTC Rooms API', () => {
    test('should query public chat rooms', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'get');
        httpSpy.mockImplementation(() => of([{ system: { name: 'Room 1' } }]) as any);

        const result = await SERVICE.queryWebrtcRooms().toPromise();
        expect(result).toBeTruthy();
        expect(result!.length).toBe(1);
        expect(httpSpy).toHaveBeenCalledWith('/api/engine/v2/webrtc/rooms');
    });

    test('should query public chat rooms with query params', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'get');
        httpSpy.mockImplementation(() => of([]) as any);

        await SERVICE.queryWebrtcRooms({ q: 'test', limit: 10 }).toPromise();
        expect(httpSpy).toHaveBeenCalledWith(
            expect.stringContaining('q=test')
        );
        expect(httpSpy).toHaveBeenCalledWith(
            expect.stringContaining('limit=10')
        );
    });

    test('should show room details', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'get');
        httpSpy.mockImplementation(() => of({ system: { name: 'Test Room' } }) as any);

        const result = await SERVICE.showWebrtcRoom('sys-123').toPromise();
        expect(result).toBeTruthy();
        expect(result?.system?.name).toBe('Test Room');
        expect(httpSpy).toHaveBeenCalledWith('/api/engine/v2/webrtc/room/sys-123');
    });

    test('should encode special characters in system ID', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'get');
        httpSpy.mockImplementation(() => of({}) as any);

        await SERVICE.showWebrtcRoom('sys/123').toPromise();
        expect(httpSpy).toHaveBeenCalledWith('/api/engine/v2/webrtc/room/sys%2F123');
    });
});

describe('WebRTC Session Members', () => {
    test('should get session members', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'get');
        httpSpy.mockImplementation(() => of([
            { user_id: 'user-1', name: 'John' },
            { user_id: 'user-2', name: 'Jane', is_guest: true }
        ]) as any);

        const result = await SERVICE.webrtcSessionMembers('session-123').toPromise();
        expect(result).toBeTruthy();
        expect(result!.length).toBe(2);
        expect(result![0].user_id).toBe('user-1');
        expect(result![1].is_guest).toBe(true);
        expect(httpSpy).toHaveBeenCalledWith('/api/engine/v2/webrtc/members/session-123');
    });
});

describe('WebRTC Guest Entry', () => {
    test('should request guest entry', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'post');
        httpSpy.mockImplementation(() => of({}) as any);

        const participant = {
            captcha: 'captcha-token',
            name: 'Guest User',
            user_id: 'guest-123',
            session_id: 'session-456',
            email: 'guest@example.com'
        };

        await SERVICE.webrtcGuestEntry('sys-123', participant).toPromise();
        expect(httpSpy).toHaveBeenCalledWith(
            '/api/engine/v2/webrtc/guest_entry/sys-123',
            participant
        );
    });

    test('should encode special characters in system ID for guest entry', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'post');
        httpSpy.mockImplementation(() => of({}) as any);

        const participant = {
            captcha: 'token',
            name: 'Guest',
            user_id: 'guest-1',
            session_id: 'session-1'
        };

        await SERVICE.webrtcGuestEntry('sys/123', participant).toPromise();
        expect(httpSpy).toHaveBeenCalledWith(
            '/api/engine/v2/webrtc/guest_entry/sys%2F123',
            participant
        );
    });
});

describe('WebRTC Guest Exit', () => {
    test('should call guest exit', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'post');
        httpSpy.mockImplementation(() => of({}) as any);

        await SERVICE.webrtcGuestExit().toPromise();
        expect(httpSpy).toHaveBeenCalledWith(
            '/api/engine/v2/webrtc/guest/exit',
            {}
        );
    });
});

describe('WebRTC Kick User', () => {
    test('should kick a user from a session', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'post');
        httpSpy.mockImplementation(() => of({}) as any);

        const reason = { reason: 'User requested' };

        await SERVICE.webrtcKickUser('user-123', 'session-456', reason).toPromise();
        expect(httpSpy).toHaveBeenCalledWith(
            '/api/engine/v2/webrtc/kick/user-123/session-456',
            reason
        );
    });

    test('should encode special characters in user ID and session ID', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'post');
        httpSpy.mockImplementation(() => of({}) as any);

        const reason = { reason: 'Test' };

        await SERVICE.webrtcKickUser('user/123', 'session/456', reason).toPromise();
        expect(httpSpy).toHaveBeenCalledWith(
            '/api/engine/v2/webrtc/kick/user%2F123/session%2F456',
            reason
        );
    });
});

describe('WebRTC Transfer User', () => {
    test('should transfer a user to another session', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'post');
        httpSpy.mockImplementation(() => of({}) as any);

        const connectionDetails = { target_session: 'session-789' };

        await SERVICE.webrtcTransferUser('user-123', 'session-456', connectionDetails).toPromise();
        expect(httpSpy).toHaveBeenCalledWith(
            '/api/engine/v2/webrtc/transfer/user-123/session-456',
            connectionDetails
        );
    });

    test('should transfer a user without connection details', async () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('/api/engine/v2/');
        const httpSpy = vi.spyOn(Http, 'post');
        httpSpy.mockImplementation(() => of({}) as any);

        await SERVICE.webrtcTransferUser('user-123', 'session-456').toPromise();
        expect(httpSpy).toHaveBeenCalledWith(
            '/api/engine/v2/webrtc/transfer/user-123/session-456',
            {}
        );
    });
});

describe('WebRTC Signaller URL', () => {
    test('should generate correct signaller websocket URL for HTTPS', () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('https://example.com/api/engine/v2/');

        const url = SERVICE.webrtcSignallerUrl();
        expect(url).toBe('wss://example.com/api/engine/v2/webrtc/signaller');
    });

    test('should generate correct signaller websocket URL for HTTP', () => {
        const authSpy = vi.spyOn(Auth, 'apiEndpoint');
        authSpy.mockReturnValue('http://example.com/api/engine/v2/');

        const url = SERVICE.webrtcSignallerUrl();
        expect(url).toBe('ws://example.com/api/engine/v2/webrtc/signaller');
    });
});
