import * as Http from '../../../src/http/functions';
import * as Resource from '../../../src/resources/functions';

jest.mock('../../../src/http/functions');

describe('Staff Survey Answers API', () => {
    beforeEach(() => jest.useFakeTimers());

    afterEach(() => {
        jest.useRealTimers();
        Resource.cleanupAPI();
        const methods: any[] = ['get', 'post', 'patch', 'put', 'del'];
        for (const method of methods) {
            ((Http as any)[method] as jest.Mock).mockReset();
            ((Http as any)[method] as jest.Mock).mockRestore();
        }
    });

    it('should allow querying answers', () => {});
});
