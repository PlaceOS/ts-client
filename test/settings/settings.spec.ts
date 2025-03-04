import { beforeEach, describe, expect, test } from 'vitest';

import { PlaceSettings } from '../../src/settings/settings';
import { generateMockSettings } from '../../src/settings/utilities';

describe('PlaceSettings', () => {
    let settings: PlaceSettings;
    let item: any;

    beforeEach(() => {
        item = generateMockSettings();
        item = generateMockSettings({ name: 'Test' });
        settings = new PlaceSettings(item);
    });

    test('should create instance', () => {
        expect(settings).toBeTruthy();
        expect(settings).toBeInstanceOf(PlaceSettings);
    });

    test('should expose parent ID', () => {
        expect(settings.parent_id).toBe(item.parent_id);
    });

    test('should expose last update time', () => {
        expect(settings.updated_at).toBe(item.updated_at);
    });

    test('should expose encryption level', () => {
        expect(settings.encryption_level).toBe(item.encryption_level);
    });

    test('should expose settings value', () => {
        expect(settings.settings_string).toBe(item.settings_string);
        expect(settings.value).toBe(item.settings_string);
    });

    test('should expose top level keys', () => {
        expect(settings.keys).toEqual(item.keys);
    });
});
