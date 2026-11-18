#!/usr/bin/env node
/**
 * The migration tool. It rewrites the 6.x calls of a project to 7.x.
 *
 *     npx -p @placeos/ts-client@2 placeos-migrate src           Shows the changes. Writes no file.
 *     npx -p @placeos/ts-client@2 placeos-migrate --write src   Writes the changes.
 *
 * It uses the `typescript` package of the project in the current folder.
 *
 * @module
 */
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, relative, resolve } from 'node:path';
import type * as TS from 'typescript-5';
import { COMPAT_MODULE, migrateSource, type Finding, type MigrateTables } from './migrate.ts';
import { V1_CALLS, V1_COMPAT, V1_TYPES, V1_UNMAPPED } from './v1-map.ts';

/** A project has fewer source files. The tool stops at this count. */
const FILES_MAX = 50_000;
/** The walk visits at most this many files and folders, of all kinds. */
const ENTRIES_MAX = 500_000;
/** A larger file is not hand-written source. The tool skips it. */
const FILE_BYTES_MAX = 5_000_000;
const SKIPPED_FOLDERS: ReadonlySet<string> = new Set([
    'node_modules',
    'dist',
    'coverage',
    'out-tsc',
    '.git',
    '.angular',
    '.nx',
]);
const SOURCE_FILE = /\.(ts|tsx|mts|cts)$/;

const USAGE = `Usage: placeos-migrate [--write] <folder or file>...

Rewrites the calls of @placeos/ts-client 6.x to 7.x. Without --write, it shows the changes and
writes no file. Commit your work first, so that you can see and undo the changes.`;

await main(process.argv.slice(2));

async function main(argv: readonly string[]): Promise<void> {
    const write = argv.includes('--write');
    const paths = argv.filter((arg) => !arg.startsWith('--'));
    if (paths.length === 0 || argv.includes('--help')) {
        console.log(USAGE);
        process.exitCode = paths.length === 0 ? 1 : 0;
        return;
    }
    const ts = loadTypeScript();
    if (ts === null) {
        console.error(
            'The tool needs the typescript package. Run it in the folder of your project.',
        );
        process.exitCode = 1;
        return;
    }

    const tables: MigrateTables = {
        calls: V1_CALLS,
        types: V1_TYPES,
        compat: V1_COMPAT,
        unmapped: V1_UNMAPPED,
    };
    for (const path of paths) {
        const exists = await stat(path).then(
            () => true,
            () => false,
        );
        if (exists) continue;
        console.error(`${path} does not exist.`);
        process.exitCode = 1;
        return;
    }
    const files = await sourceFiles(paths.map((path) => resolve(path)));
    const findings: { file: string; finding: Finding }[] = [];
    const migrated = new Set<string>();
    let changed_files = 0;
    let changes = 0;
    for (const file of files) {
        const text = await readFile(file, 'utf8');
        const result = migrateSource(ts, file, text, tables);
        const name = relative(process.cwd(), file);
        for (const finding of result.findings) findings.push({ file: name, finding });
        for (const fn of result.migrated) migrated.add(fn);
        if (result.text === text) continue;
        changed_files += 1;
        changes += result.changes;
        console.log(`${write ? 'changed' : 'would change'} ${name} (${result.changes})`);
        if (write) await writeFile(file, result.text);
    }

    if (findings.length > 0) {
        console.log(`\nNot changed. Change these by hand:`);
        for (const { file, finding } of findings) {
            console.log(
                `  ${file}:${finding.line}:${finding.column} ${finding.name}: ${finding.message}`,
            );
        }
    }
    const notes = [...migrated]
        .sort()
        .flatMap((fn) => (V1_CALLS[fn]?.notes ?? []).map((note) => `  ${fn}: ${note}`));
    if (notes.length > 0) console.log(`\nDifferences of the changed calls:\n${notes.join('\n')}`);

    console.log(
        `\n${files.length} files read. ${changed_files} files ${write ? 'changed' : 'to change'}, ` +
            `${changes} changes, ${findings.length} uses to change by hand.`,
    );
    if (!write && changed_files > 0) console.log('Run again with --write to write the changes.');
    if (write && changed_files > 0) {
        console.log(
            `\nNext:\n` +
                `  1. Install 7.x: npm install @placeos/ts-client@7\n` +
                `  2. Call configure() once, before the first call (README: Log in). For a mock mode,\n` +
                `     give fetch: mockFetch and missing_fields: 'zero' (README: Mock mode).\n` +
                `  3. Run the compiler. It shows the changes to the data, such as a field that can be null.\n` +
                `  4. orThrow from ${COMPAT_MODULE} keeps the 6.x errors. Check the Result in new code.`,
        );
    }
}

/** The `typescript` package of the project, or `null`. */
function loadTypeScript(): typeof TS | null {
    const require = createRequire(join(process.cwd(), 'package.json'));
    try {
        const loaded: unknown = require('typescript');
        return isTypeScript(loaded) ? loaded : null;
    } catch {
        return null;
    }
}

/** The tool uses only the parser, so a check of its entry points is enough. */
function isTypeScript(value: unknown): value is typeof TS {
    return (
        typeof value === 'object' &&
        value !== null &&
        'createSourceFile' in value &&
        typeof value.createSourceFile === 'function' &&
        'forEachChild' in value &&
        typeof value.forEachChild === 'function'
    );
}

/** The source files in the paths, without the generated and installed folders. */
async function sourceFiles(paths: readonly string[]): Promise<string[]> {
    const files: string[] = [];
    const queue = [...paths];
    for (let index = 0; index < queue.length; index += 1) {
        if (files.length >= FILES_MAX) {
            console.error(`Stopped at ${FILES_MAX} files. Give a smaller folder.`);
            break;
        }
        const path = queue[index] ?? '';
        const info = await stat(path);
        if (info.isDirectory()) {
            for (const entry of await readdir(path, { withFileTypes: true })) {
                if (entry.isDirectory() && SKIPPED_FOLDERS.has(entry.name)) continue;
                if (!entry.isDirectory() && !entry.isFile()) continue;
                if (queue.length >= ENTRIES_MAX) {
                    console.error(
                        `Stopped at ${ENTRIES_MAX} files and folders. Give a smaller folder.`,
                    );
                    return files.sort();
                }
                queue.push(join(path, entry.name));
            }
            continue;
        }
        if (!SOURCE_FILE.test(path) || path.endsWith('.d.ts')) continue;
        if (info.size > FILE_BYTES_MAX) {
            console.error(`Skipped ${path}: it is larger than ${FILE_BYTES_MAX} bytes.`);
            continue;
        }
        files.push(path);
    }
    return files.sort();
}
