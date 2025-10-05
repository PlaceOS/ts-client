import { beforeEach, describe, expect, test } from 'vitest';
import { PlaceAlert } from '../../src/alerts/alert';
import { PlaceAlertDashboard } from '../../src/alerts/dashboard';

describe('PlaceAlert', () => {
    let alert: PlaceAlert;

    beforeEach(() => {
        alert = new PlaceAlert({
            id: 'alert-test',
            alert_dashboard_id: 'dashboard-123',
            authority_id: 'auth-456',
            description: 'Test alert for monitoring',
            enabled: true,
            conditions: {
                time_dependents: [],
                comparisons: [
                    {
                        left: 'temperature',
                        operator: 'gt',
                        right: 25,
                    },
                ],
            },
            severity: 'high',
            alert_type: 'threshold',
            debounce_period: 300,
            created_at: 999,
        });
    });

    test('should create instance', () => {
        expect(alert).toBeTruthy();
        expect(alert).toBeInstanceOf(PlaceAlert);
    });

    test('should expose alert_dashboard_id', () => {
        expect(alert.alert_dashboard_id).toBe('dashboard-123');
    });

    test('should expose authority_id', () => {
        expect(alert.authority_id).toBe('auth-456');
    });

    test('should expose description', () => {
        expect(alert.description).toBe('Test alert for monitoring');
    });

    test('should expose enabled status', () => {
        expect(alert.enabled).toBe(true);
    });

    test('should expose conditions', () => {
        expect(alert.conditions).toBeTruthy();
        expect(alert.conditions.comparisons).toHaveLength(1);
        expect(alert.conditions.comparisons[0].left).toBe('temperature');
    });

    test('should expose severity', () => {
        expect(alert.severity).toBe('high');
    });

    test('should expose alert_type', () => {
        expect(alert.alert_type).toBe('threshold');
    });

    test('should expose debounce_period', () => {
        expect(alert.debounce_period).toBe(300);
    });

    test('should have default values', () => {
        const minimal = new PlaceAlert({});
        expect(minimal.authority_id).toBe('');
        expect(minimal.description).toBe('');
        expect(minimal.enabled).toBe(false);
        expect(minimal.conditions).toEqual({
            time_dependents: [],
            comparisons: [],
        });
        expect(minimal.severity).toBe('low');
        expect(minimal.alert_type).toBe('threshold');
        expect(minimal.debounce_period).toBe(0);
        expect(minimal.alert_dashboard_id).toBe('');
        expect(minimal.alert_dashboard_details).toBeUndefined();
    });

    test('should include alert_dashboard_details if provided', () => {
        const dashboard = new PlaceAlertDashboard({
            id: 'dashboard-123',
            authority_id: 'auth-456',
            description: 'Dashboard description',
            enabled: true,
        });

        const alertWithDashboard = new PlaceAlert({
            id: 'alert-test',
            alert_dashboard_id: 'dashboard-123',
            authority_id: 'auth-456',
            alert_dashboard_details: dashboard,
        });

        expect(alertWithDashboard.alert_dashboard_details).toBeTruthy();
        expect(alertWithDashboard.alert_dashboard_details).toBeInstanceOf(
            PlaceAlertDashboard,
        );
    });
});
