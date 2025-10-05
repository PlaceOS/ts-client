import { beforeEach, describe, expect, test } from 'vitest';
import { PlaceAlertDashboard } from '../../src/alerts/dashboard';

describe('PlaceAlertDashboard', () => {
    let dashboard: PlaceAlertDashboard;

    beforeEach(() => {
        dashboard = new PlaceAlertDashboard({
            id: 'dashboard-test',
            authority_id: 'auth-789',
            description: 'Main monitoring dashboard',
            enabled: true,
            created_at: 999,
        });
    });

    test('should create instance', () => {
        expect(dashboard).toBeTruthy();
        expect(dashboard).toBeInstanceOf(PlaceAlertDashboard);
    });

    test('should expose authority_id', () => {
        expect(dashboard.authority_id).toBe('auth-789');
    });

    test('should expose description', () => {
        expect(dashboard.description).toBe('Main monitoring dashboard');
    });

    test('should expose enabled status', () => {
        expect(dashboard.enabled).toBe(true);
    });

    test('should have default values', () => {
        const minimal = new PlaceAlertDashboard({});
        expect(minimal.authority_id).toBe('');
        expect(minimal.description).toBe('');
        expect(minimal.enabled).toBe(false);
    });
});
