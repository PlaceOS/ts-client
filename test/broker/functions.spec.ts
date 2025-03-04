import { of } from 'rxjs';
import { describe, expect, test, vi } from 'vitest';
import { PlaceMQTTBroker } from '../../src/broker/broker';
import * as SERVICE from '../../src/broker/functions';
import * as Resources from '../../src/resources/functions';

describe('MQTT Broker API', () => {
    test('should allow querying brokers', async () => {
        const spy = vi.spyOn(Resources, 'query');
        spy.mockImplementation((_) => of({ data: [_.fn!({})] } as any));
        let list = await SERVICE.queryBrokers().toPromise();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceMQTTBroker);
        list = await SERVICE.queryBrokers({}).toPromise();
    });

    test('should allow showing broker details', async () => {
        const spy = vi.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.showBroker('1').toPromise();
        expect(item).toBeInstanceOf(PlaceMQTTBroker);
        item = await SERVICE.showBroker('1', {}).toPromise();
    });

    test('should allow creating new brokers', async () => {
        const spy = vi.spyOn(Resources, 'create');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.addBroker({}).toPromise();
        expect(item).toBeInstanceOf(PlaceMQTTBroker);
        item = await SERVICE.addBroker({}).toPromise();
    });

    test('should allow updating broker details', async () => {
        const spy = vi.spyOn(Resources, 'update');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.updateBroker('1', {}).toPromise();
        expect(item).toBeInstanceOf(PlaceMQTTBroker);
        item = await SERVICE.updateBroker('1', {}, 'patch').toPromise();
    });

    test('should allow removing brokers', async () => {
        const spy = vi.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        let item = await SERVICE.removeBroker('1').toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeBroker('1', {}).toPromise();
    });
});
