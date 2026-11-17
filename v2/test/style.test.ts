/**
 * Goal: the library does not bypass the type checks (TigerStyle "Boundaries").
 * Method: search the source for `any`, `@ts-ignore`, `@ts-expect-error`, non-null assertions and
 * casts. The casts that the parser needs are listed here, with the reason in the code.
 */
import { expect, test } from 'bun:test';
import { Glob } from 'bun';
import { join } from 'node:path';

const SOURCE_DIR = join(import.meta.dir, '..', 'src');
const ALLOWED_CASTS = ['parsed as O', 'checked as I', 'result as CallResult<O>'];

test('the source has no escape from the type checks', async () => {
    const problems: string[] = [];
    for await (const file of new Glob('**/*.ts').scan(SOURCE_DIR)) {
        const lines = (await Bun.file(join(SOURCE_DIR, file)).text()).split('\n');
        for (const [index, line] of lines.entries()) {
            // Comments and strings are text, not code.
            const code = line.replace(/\/\*.*?\*\/|\/\/.*$|^\s*\/?\*.*$|'[^']*'|`[^`]*`/g, '');
            const where = `${file}:${index + 1}: ${line.trim()}`;
            if (/(?<!\.)\bany\b/.test(code)) problems.push(`any in ${where}`);
            if (/@ts-(ignore|expect-error|nocheck)/.test(line))
                problems.push(`ts comment in ${where}`);
            if (/[\w)\]]!(?:[.[(,;)]|$)/.test(code))
                problems.push(`non-null assertion in ${where}`);
            // `K in keyof F as ...` is a key remap of a mapped type, not a cast.
            const cast = /(?<!keyof )\b(\w+) as (?!const\b)([\w<>]+)/.exec(code);
            if (cast !== null && !ALLOWED_CASTS.includes(cast[0]))
                problems.push(`cast in ${where}`);
        }
    }
    expect(problems).toEqual([]);
});
