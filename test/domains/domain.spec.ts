import { beforeEach, describe, expect, test } from 'vitest';
import { PlaceDomain } from '../../src/domains/domain';

describe('PlaceDomain', () => {
    let domain: PlaceDomain;

    beforeEach(() => {
        domain = new PlaceDomain({
            id: 'dep-test',
            domain: 'here.today',
            login_url: 'somewhere.today',
            logout_url: 'no-where.today',
            description: 'In a galaxy far far away...',
            config: { today: false, future: 'Yeah!' },
            internals: { today: true, future: 'Nope!' },
            created_at: 999,
        });
    });

    test('should create instance', () => {
        expect(domain).toBeTruthy();
        expect(domain).toBeInstanceOf(PlaceDomain);
    });

    test('should expose domain', () => {
        expect(domain.domain).toBe('here.today');
    });

    test('should expose login URL', () => {
        expect(domain.login_url).toBe('somewhere.today');
    });

    test('should expose logout URL', () => {
        expect(domain.logout_url).toBe('no-where.today');
    });

    test('should expose description', () => {
        expect(domain.description).toBe('In a galaxy far far away...');
    });

    test('should expose config', () => {
        expect(domain.config).toEqual({ today: false, future: 'Yeah!' });
    });

    test('should expose internals', () => {
        expect(domain.internals).toEqual({ today: true, future: 'Nope!' });
    });

    test('should allow converting to JSON object', () => {
        expect(domain.toJSON()).toBeTruthy();
    });
});
