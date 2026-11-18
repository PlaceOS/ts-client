/**
 * Goal: a scoped logger gives one entry with its scope and level to the sink, and a sink that
 * throws or is missing does not change the caller.
 * Method: log with each method into a sink that records the entries.
 */
import { expect, test } from 'bun:test';
import { scopedLog, type LogEntry } from '../src/core/log.ts';

test('each method gives an entry with the scope and the level', () => {
    const entries: LogEntry[] = [];
    const log = scopedLog('auth', { sink: (entry) => entries.push(entry) });
    log.error('Error: an error');
    log.warn('Warn: a warning', { status: 401 }, 2);
    log.info('Info: a step');
    log.debug('Debug: a detail');
    log.group('A group');
    log.print('Log: a line');
    log.groupEnd();
    expect(entries.map((entry) => [entry.level, entry.args[0]])).toEqual([
        ['error', 'Error: an error'],
        ['warn', 'Warn: a warning'],
        ['info', 'Info: a step'],
        ['debug', 'Debug: a detail'],
        ['group', 'A group'],
        ['print', 'Log: a line'],
        ['group_end', undefined],
    ]);
    expect(entries.every((entry) => entry.scope === 'auth')).toBe(true);
    // The arguments stay as the call gave them, as a console method gets them.
    expect(entries[1]?.args).toEqual(['Warn: a warning', { status: 401 }, 2]);
    expect(entries[6]?.args).toEqual([]);
});

test('a sink that throws or no sink does not change the caller', () => {
    const throwing = scopedLog('http', {
        sink: () => {
            throw new Error('a bug in the log function');
        },
    });
    expect(() => throwing.error('lost')).not.toThrow();
    expect(() => scopedLog('http', { sink: null }).info('nothing')).not.toThrow();
});
