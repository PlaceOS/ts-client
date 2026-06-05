import { describe, expect, test, vi } from 'vitest';
import { PlaceAlert } from '../../src/alerts/alert';
import { PlaceAlertDashboard } from '../../src/alerts/dashboard';
import * as SERVICE from '../../src/alerts/functions';
import * as Resources from '../../src/resources/functions';

describe('Alert Dashboards API', () => {
    test('should allow querying alert dashboards', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        let list = await SERVICE.queryAlertDashboards();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceAlertDashboard);
        list = await SERVICE.queryAlertDashboards({});
    });

    test('should allow showing alert dashboard details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.showAlertDashboard('1');
        expect(item).toBeInstanceOf(PlaceAlertDashboard);
    });

    test('should allow creating new alert dashboards', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.addAlertDashboard({});
        expect(item).toBeInstanceOf(PlaceAlertDashboard);
    });

    test('should allow updating alert dashboard details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateAlertDashboard('1', {});
        expect(item).toBeInstanceOf(PlaceAlertDashboard);
        item = await SERVICE.updateAlertDashboard('1', {}, 'patch');
    });

    test('should allow removing alert dashboards', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeAlertDashboard('1');
        expect(item).toBeFalsy();
    });

    test('should allow listing dashboard alerts', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        const list = await SERVICE.listDashboardAlerts('dashboard-1');
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceAlert);
    });
});

describe('Alerts API', () => {
    test('should allow querying alerts', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) =>
            Promise.resolve({ data: [_.fn!({})] } as any),
        );
        let list = await SERVICE.queryAlerts();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceAlert);
        list = await SERVICE.queryAlerts({});
    });

    test('should allow showing alert details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.showAlert('1');
        expect(item).toBeInstanceOf(PlaceAlert);
        item = await SERVICE.showAlert('1', {});
    });

    test('should allow creating new alerts', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        const item = await SERVICE.addAlert({});
        expect(item).toBeInstanceOf(PlaceAlert);
    });

    test('should allow updating alert details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => Promise.resolve(_.fn!({}) as any));
        let item = await SERVICE.updateAlert('1', {});
        expect(item).toBeInstanceOf(PlaceAlert);
        item = await SERVICE.updateAlert('1', {}, 'patch');
    });

    test('should allow removing alerts', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => Promise.resolve());
        const item = await SERVICE.removeAlert('1');
        expect(item).toBeFalsy();
    });
});
