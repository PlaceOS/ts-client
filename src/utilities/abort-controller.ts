import { log } from './general';

/* istanbul ignore file */
export class AbortControllerStub {
    public abort() {
        log('Stub', 'Aborted');
    }
}
