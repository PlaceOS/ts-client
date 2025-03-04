import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { of } from 'rxjs';

import * as API from '../../../src/api';
import * as QUESTIONS from '../../../src/staff/questions/functions';
import { SurveyQuestion } from '../../../src/staff/questions/model';

vi.mock('../../../src/http/functions');
vi.mock('../../../src/api');

describe('Staff Survey Questions API', () => {
    test('should allow querying questions', async () => {
        (API.get as any) = vi.fn().mockImplementation((_) => of([{}]));
        let list = await QUESTIONS.queryQuestions().toPromise();
        expect(list).toBeTruthy();
        expect(list.length).toBe(1);
        expect(list[0]).toBeInstanceOf(SurveyQuestion);
    });

    test('should allow showing question', async () => {
        (API.get as any) = vi.fn().mockImplementation((_) => of({ id: '1' }));
        let list = await QUESTIONS.showQuestion('1').toPromise();
        expect(list).toBeTruthy();
        expect(list).toBeInstanceOf(SurveyQuestion);
        expect(list?.id).toBe('1');
    });

    test('should allow adding question', async () => {
        (API.post as any) = vi.fn().mockImplementation((_) => of({ id: '1' }));
        let item = await QUESTIONS.addQuestion({}).toPromise();
        expect(item).toBeTruthy();
        expect(item).toBeInstanceOf(SurveyQuestion);
        expect(item?.id).toBe('1');
    });

    test('should allow updating question', async () => {
        (API.put as any) = vi.fn().mockImplementation((_) => of({ id: '1' }));
        (API.patch as any) = vi.fn().mockImplementation((_) => of({ id: '1' }));
        let item = await QUESTIONS.updateQuestion('1', {}).toPromise();
        expect(item).toBeTruthy();
        expect(item).toBeInstanceOf(SurveyQuestion);
        expect(item?.id).toBe('1');
    });

    test('should allow removing question', async () => {
        (API.del as any) = vi.fn().mockImplementation((_) => of());
        let item = await QUESTIONS.removeQuestion('1').toPromise();
        expect(item).toBeFalsy();
    });
});
