import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { PlaceErrorCodes } from '../../src/realtime/interfaces';
import {
    deregisterSystem,
    mockSystem,
    registerSystem,
} from '../../src/realtime/mock';

import { first } from 'rxjs/operators';
import * as Auth from '../../src/auth/functions';
import * as ws from '../../src/realtime/functions';

describe('MockEngineWebsocket', () => {
    beforeEach(() => {
        vi.spyOn(Auth, 'isMock').mockReturnValue(true);
        vi.spyOn(Auth, 'authority').mockReturnValue({} as any);
        registerSystem('sys-A0', {
            Test: [
                {
                    test: 10,
                    $testCall() {
                        setTimeout(() => (this.test += 1));
                        return this.test;
                    },
                },
            ],
        });
    });

    afterEach(() => {
        deregisterSystem('sys-A0');
        ws.cleanupRealtime();
    });

    test('should bind to mock system modules', (done) => {
        let checked = false;
        const binding = { sys: 'sys-A0', mod: 'Test', index: 1, name: 'test' };
        ws.listen(binding).subscribe((value) => {
            if (value && !checked) {
                expect(ws.value(binding)).toBe(10);
                done();
                checked = true;
            }
        });
        ws.bind(binding);
    });

    test('post binding value updates', (done) => {
        let checked = false;
        const binding = { sys: 'sys-A0', mod: 'Test', index: 1, name: 'test' };
        let count = 0;
        ws.listen(binding).subscribe((value) => {
            if (count === 0) {
                expect(value).toBeUndefined();
                count++;
            } else if (value && !checked) {
                expect(value).toBe(10);
                done();
                checked = true;
            }
        });
        ws.bind(binding);
    });

    test('should unbind from mock system modules', (done) => {
        const binding = { sys: 'sys-A0', mod: 'Test', index: 1, name: 'test' };
        ws.listen(binding).subscribe((value) => {
            if (value) {
                expect(ws.value(binding)).toBe(10);
                ws.unbind(binding).then(() => {
                    mockSystem('sys-A0').Test[0].test = 20;
                    setTimeout(() => {
                        expect(ws.value(binding)).not.toBe(20);
                        done();
                    }, 200);
                });
            }
        });
        ws.bind(binding);
    });

    test('should exec mock system module methods', (done) => {
        const binding = { sys: 'sys-A0', mod: 'Test', index: 1, name: 'test' };
        ws.listen(binding)
            .pipe(first((_) => _))
            .subscribe((_) => {
                ws.execute({ ...binding, name: 'testCall' }).then((value) => {
                    expect(value).toBe(10);
                    setTimeout(() => {
                        expect(ws.value(binding)).toBe(11);
                        done();
                    }, 200);
                });
            });
        ws.bind(binding);
    });

    test('should reject when mock listener setup throws', async () => {
        const binding = { sys: 'sys-A0', mod: 'Test', index: 1, name: 'test' };
        (mockSystem('sys-A0').Test[0] as any).listen = () => {
            throw new Error('Listener failure');
        };
        await expect(ws.bind(binding)).rejects.toMatchObject({
            type: 'error',
            code: PlaceErrorCodes.UNEXPECTED_FAILURE,
            msg: 'Listener failure',
        });
    });

    test('should reject when mock execute throws', async () => {
        mockSystem('sys-A0').Test[0].$testCall = () => {
            throw new Error('Execute failure');
        };
        await expect(
            ws.execute({
                sys: 'sys-A0',
                mod: 'Test',
                index: 1,
                name: 'testCall',
            }),
        ).rejects.toMatchObject({
            type: 'error',
            code: PlaceErrorCodes.UNEXPECTED_FAILURE,
            msg: 'Execute failure',
        });
    });

    test('should error if binding module not found', (done) => {
        const binding = {
            sys: 'sys-A0',
            mod: 'Testing',
            index: 1,
            name: 'test',
        };
        ws.bind(binding).then(null, () => done());
    });

    test('should error if binding system not found', (done) => {
        const binding = { sys: 'sys-B0', mod: 'Test', index: 1, name: 'test' };
        ws.bind(binding).then(null, () => done());
    });
});
