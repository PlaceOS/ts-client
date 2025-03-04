import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { PlaceUser } from '../../src/users/user';

describe('PlaceUser', () => {
    let user: PlaceUser;

    beforeEach(() => {
        user = new PlaceUser({
            id: 'dep-test',
            authority_id: "On who's authority",
            email: 'jon@tron.game',
            phone: '+612000000000',
            country: 'Australia',
            image: '',
            metadata: 'there be none',
            login_name: 'elitedarklord',
            staff_id: 'PERSON_12345',
            first_name: 'Bob',
            last_name: 'Marley',
            created_at: 999,
        });
    });

    test('should create instance', () => {
        expect(user).toBeTruthy();
        expect(user).toBeInstanceOf(PlaceUser);
    });

    test('should expose Authority ID', () => {
        expect(user.authority_id).toBe("On who's authority");
    });

    test('should expose Email', () => {
        expect(user.email).toBe('jon@tron.game');
    });

    test('should expose Phone', () => {
        expect(user.phone).toBe('+612000000000');
    });

    test('should expose Country', () => {
        expect(user.country).toBe('Australia');
    });

    test('should expose image', () => {
        expect(user.image).toBe('');
    });

    test('should expose metadata', () => {
        expect(user.metadata).toBe('there be none');
    });

    test('should expose login name', () => {
        expect(user.login_name).toBe('elitedarklord');
    });

    test('should expose staff ID', () => {
        expect(user.staff_id).toBe('PERSON_12345');
    });

    test('should expose first name', () => {
        expect(user.first_name).toBe('Bob');
    });

    test('should expose last name', () => {
        expect(user.last_name).toBe('Marley');
    });
});
