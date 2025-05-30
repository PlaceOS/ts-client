import { Observable, of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import * as Http from '../../src/http/functions';
import * as Resource from '../../src/resources/functions';

vi.mock('../../src/http/functions');

describe('Resource API', () => {
    let resp_header_spy: any;

    async function testRequest<T>(
        method: 'get' | 'post' | 'patch' | 'put' | 'del',
        func: (...args: any[]) => Observable<T>,
        result: any,
        test1: any[],
        test2: any[],
    ) {
        const item = result.hasOwnProperty('results') ? result.results : result;
        (Http[method] as any)
            .mockReturnValueOnce(of(result))
            .mockReturnValueOnce(of(result))
            .mockImplementationOnce(() => throwError('An Error Value'));
        const value: any = await func({
            fn: (_: any) => _,
            path: 'resource',
            ...test1[0],
        }).toPromise();
        vi.runOnlyPendingTimers();
        expect(value.data ? value.data : value).toEqual(item || []);
        // Test request with parameters
        await func({
            fn: (_: any) => _,
            path: 'resource',
            ...test2[0],
        }).toPromise();
        vi.runOnlyPendingTimers();
        // Test error handling
        try {
            await func({
                fn: (_: any) => _,
                path: 'resource',
                ...test1[0],
            }).toPromise();
            throw new Error('Failed to error');
        } catch (e) {
            expect(e).toBe('An Error Value');
        }
        vi.runOnlyPendingTimers();
    }

    beforeEach(() => {
        vi.useFakeTimers();
        resp_header_spy = vi.spyOn(Http, 'responseHeaders');
        window.fetch = vi.fn().mockImplementation(async () => ({
            json: async () => ({
                version: '1.0.0',
                login_url: '/login?continue={{url}}',
            }),
        }));
    });

    afterEach(() => {
        vi.useRealTimers();
        Resource.cleanupAPI();
        const methods: any[] = ['get', 'post', 'patch', 'put', 'del'];
        for (const method of methods) {
            (Http as any)[method].mockReset();
            (Http as any)[method].mockRestore();
        }
    });

    test('should return 0 from total requests by default', () => {
        expect(Resource.requestTotal('any')).toBe(0);
        expect(Resource.lastRequestTotal('any')).toBe(0);
    });

    test('should allow querying the index endpoint', async () => {
        expect.assertions(8);
        const item = { id: 'test', name: 'Test' };
        await testRequest(
            'get',
            Resource.query,
            { results: [item] },
            [{}],
            [{ query_params: { cache: 100, test: true } }],
        );
        await testRequest(
            'get',
            Resource.query,
            { total: 10, results: [item] },
            [{}],
            [{ query_params: { test: true } }],
        );
        await testRequest(
            'get',
            Resource.query,
            { total: 10, results: [] },
            [{}],
            [{ query_params: { test: true } }],
        );
        expect(Http.get).toHaveBeenCalledWith(
            'http://localhost:3000/api/engine/v2/resource',
        );
        expect(Http.get).toHaveBeenCalledWith(
            'http://localhost:3000/api/engine/v2/resource?test=true',
        );
    });

    test('should save index request totals', async () => {
        expect.assertions(6);
        const item = { id: 'test', name: 'Test' };
        const headers = { 'x-total-count': '10' };
        resp_header_spy.mockReturnValue(headers);
        await testRequest(
            'get',
            Resource.query,
            { total: 10, results: [item] },
            [{ query_params: { offset: 10 } }],
            [{ query_params: { offset: 10 } }],
        );
        headers['x-total-count'] = '25';
        resp_header_spy.mockReturnValue(headers);
        await testRequest(
            'get',
            Resource.query,
            { total: 25, results: [item] },
            [{ query_params: { test: true } }],
            [{ query_params: { test: true } }],
        );
        expect(Resource.requestTotal('resource')).toBe(10);
        expect(Resource.lastRequestTotal('resource')).toBe(25);
    });

    test('should allow for grabbing the show endpoint for an item', async () => {
        const item = { id: 'test', name: 'Test' };
        await testRequest(
            'get',
            Resource.show,
            item,
            [{ id: 'test' }],
            [{ id: 'test', query_params: { test: true } }],
        );
        expect(Http.get).toHaveBeenCalledWith(
            'http://localhost:3000/api/engine/v2/resource/test',
            undefined,
        );
        expect(Http.get).toHaveBeenCalledWith(
            'http://localhost:3000/api/engine/v2/resource/test?test=true',
            undefined,
        );
    });

    test('should allow adding new items', async () => {
        expect.assertions(3);
        const item = { id: 'test', name: 'Test' };
        await testRequest(
            'post',
            Resource.create,
            item,
            [{ form_data: item }],
            [{ form_data: item }],
        );
        expect(Http.post).toHaveBeenCalledWith(
            'http://localhost:3000/api/engine/v2/resource',
            item,
        );
    });

    test('should allow running POST tasks on items', async () => {
        expect.assertions(4);
        await testRequest(
            'post',
            Resource.task,
            'success',
            [{ id: 'test', task_name: 'a_task' }],
            [{ id: 'test', task_name: 'a_task', form_data: { test: true } }],
        );
        expect(Http.post).toHaveBeenCalledWith(
            'http://localhost:3000/api/engine/v2/resource/test/a_task',
            undefined,
        );
        expect(Http.post).toHaveBeenCalledWith(
            'http://localhost:3000/api/engine/v2/resource/test/a_task',
            {
                test: true,
            },
        );
    });

    test('should allow updating items', async () => {
        expect.assertions(3);
        const item = { id: 'test', name: 'Test' };
        await testRequest(
            'patch',
            Resource.update,
            item,
            [{ id: 'test', form_data: item }],
            [{ id: 'test', form_data: item }],
        );
        expect(Http.patch).toHaveBeenCalledWith(
            'http://localhost:3000/api/engine/v2/resource/test?version=0',
            item,
        );
        // expect(Http.put).toHaveBeenCalledWith(
        //     'http://localhost:3000/api/engine/v2/resource/test?version=0',
        //     item
        // );
    });

    test('should allow deleting items', async () => {
        expect.assertions(4);
        const item = { id: 'test', name: 'Test' };
        await testRequest(
            'del',
            Resource.remove,
            item,
            [{ id: 'test' }],
            [{ id: 'test', query_params: { test: true } }],
        );
        expect(Http.del).toHaveBeenCalledWith(
            'http://localhost:3000/api/engine/v2/resource/test',
        );
        expect(Http.del).toHaveBeenCalledWith(
            'http://localhost:3000/api/engine/v2/resource/test?test=true',
        );
    });

    test('should allow running GET tasks on items', async () => {
        expect.assertions(4);
        await testRequest(
            'get',
            Resource.task,
            'success',
            [{ id: 'test', task_name: 'a_task', method: 'get' }],
            [
                {
                    id: 'test',
                    task_name: 'a_task',
                    form_data: { test: true },
                    method: 'get',
                },
            ],
        );
        expect(Http.get).toHaveBeenCalledWith(
            'http://localhost:3000/api/engine/v2/resource/test/a_task',
            {
                response_type: 'json',
            },
        );
        expect(Http.get).toHaveBeenCalledWith(
            'http://localhost:3000/api/engine/v2/resource/test/a_task?test=true',
            {
                response_type: 'json',
            },
        );
    });

    test('should allow getting the next page', () => {
        expect(Resource.next()).toBeFalsy();
    });
});
