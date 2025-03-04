import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { PlaceApplication } from '../../src/applications/application';

describe('PlaceApplication', () => {
    let application: PlaceApplication;

    beforeEach(() => {
        application = new PlaceApplication({
            id: 'dep-test',
            owner_id: 'test-man',
            uid: 'no-so-unique',
            secret: "Shhh... It's a secret",
            scopes: 'office,building,over,there',
            redirect_uri: 'https://over.yonder/oauth.html',
            skip_authorization: true,
            created_at: 999,
        });
    });

    test('should create instance', () => {
        expect(application).toBeTruthy();
        expect(application).toBeInstanceOf(PlaceApplication);
    });

    test('should expose owner ID', () => {
        expect(application.owner_id).toBe('test-man');
    });

    test('should expose scopes', () => {
        expect(application.scopes).toBe('office,building,over,there');
    });

    test('should expose redirect_uri', () => {
        expect(application.redirect_uri).toBe('https://over.yonder/oauth.html');
    });

    test('should expose skip_authorization', () => {
        expect(application.skip_authorization).toBe(true);
    });

    test('should expose unique ID', () => {
        expect(application.uid).toBe('no-so-unique');
    });

    test('should expose secret', () => {
        expect(application.secret).toBe("Shhh... It's a secret");
    });
});
