import { beforeEach, describe, expect, test } from 'vitest';
import { PlaceZoneMetadata } from '../../src/metadata/zone-metadata';
import { PlaceZone } from '../../src/zones/zone';

describe('PlaceMetadata', () => {
    let metadata: PlaceZoneMetadata;

    beforeEach(() => {
        metadata = new PlaceZoneMetadata({
            zone: {} as any,
            metadata: { test: {} } as any,
            keys: ['test'],
        });
    });

    test('should create instance', () => {
        expect(metadata).toBeTruthy();
        expect(metadata).toBeInstanceOf(PlaceZoneMetadata);
        new PlaceZoneMetadata();
    });

    test('should expose properties', () => {
        expect(metadata.zone).toBeInstanceOf(PlaceZone);
        expect(metadata.keys).toBeInstanceOf(Array);
        expect(metadata.metadata).toBeInstanceOf(Object);
        expect(metadata.metadata.test).toBeTruthy();
    });
});
