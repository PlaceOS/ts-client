import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { of } from 'rxjs';
import * as API from '../../../src/api';
import * as Http from '../../../src/http/functions';
import * as ANSWERS from '../../../src/staff/answers/functions';
import { SurveyAnswer } from '../../../src/staff/answers/model';

vi.mock('../../../src/http/functions');
vi.mock('../../../src/api');

describe('Staff Survey Answers API', () => {
    beforeEach(() => vi.useFakeTimers());

    afterEach(() => {
        vi.useRealTimers();
        const methods: any[] = ['get', 'post', 'patch', 'put', 'del'];
        for (const method of methods) {
            ((Http as any)[method] as vi.Mock).mockReset();
            ((Http as any)[method] as vi.Mock).mockRestore();
        }
    });

    test('should allow querying answers', async () => {
        (API.get as any) = vi.fn().mockImplementation((_) => of([{}]));
        let list = await ANSWERS.queryAnswers().toPromise();
        expect(list).toBeTruthy();
        expect(list.length).toBe(1);
        expect(list[0]).toBeInstanceOf(SurveyAnswer);
    });

    test('should allow adding new answers', async () => {
        (API.post as any) = vi.fn().mockImplementation((_) => of([{}]));
        let item = await ANSWERS.addAnswer([{}]).toPromise();
        expect(item.length).toBe(1);
        expect(item[0]).toBeInstanceOf(SurveyAnswer);
    });
});
