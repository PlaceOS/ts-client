import { beforeEach, describe, expect, test } from 'vitest';
import { PlaceZone } from '../../src/zones/zone';

describe('PlaceZone', () => {
    let zone: PlaceZone;

    beforeEach(() => {
        zone = new PlaceZone({
            id: 'dep-test',
            description: 'In a galaxy far far away...',
            settings: {
                settings_string: "{ today: false, future: 'Yeah!' }",
            } as any,
            triggers: ['trig-001'],
            created_at: 999,
            trigger_data: [{ id: 'trig-01', name: 'A trigger' } as any],
        });
    });

    test('should create instance', () => {
        expect(zone).toBeTruthy();
        expect(zone).toBeInstanceOf(PlaceZone);
    });

    test('should have trigger data', () =>
        new Promise<void>((resolve) => {
            setTimeout(() => {
                expect(zone.trigger_list).toBeTruthy();
                expect(zone.trigger_list.length).toBe(1);
                resolve();
            }, 1);
        }));

    test('should expose description', () => {
        expect(zone.description).toBe('In a galaxy far far away...');
    });

    test('should expose settings', () => {
        expect(zone.settings).toBeInstanceOf(Object);
    });

    test('should expose triggers', () => {
        expect(zone.triggers).toEqual(['trig-001']);
    });

    test('should expose class name', () => {
        expect(zone.created_at).toEqual(999);
    });
});
