/**
 * Writes `src/migrate/v1-map.ts`, the map from the 6.x REST functions to the 7.x operations.
 *
 *     bun scripts/v1-map.ts           Writes the map.
 *     bun scripts/v1-map.ts --check   Fails if the map is not up to date.
 *
 * Method: the script calls each REST function of 6.x (the `src` of the 6.13.0 package) with marker arguments, and records
 * the request that it sends. A Bun plugin replaces the 6.x HTTP module with a recorder. The script
 * then finds the 7.x operation with the same method and path. The place of each marker in the
 * request (path, query or body) gives the 7.x input for that 6.x argument.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { format, resolveConfig } from 'prettier';
import * as ts from 'typescript-5';
import { assert } from '../src/core/assert.ts';
import type {
    CallMapping,
    ObjectEntry,
    Template,
    TypeMapping,
    V1Parameter,
} from '../src/migrate/map.ts';
import { ANIMATIONS } from './value-enums.ts';

const ROOT = join(import.meta.dir, '..');
// The source of the last 6.x release. The npm package has it, so this repository does not.
const V1_SOURCE = join(ROOT, 'node_modules', 'placeos-ts-client-6', 'src');
const V1_INDEX = join(V1_SOURCE, 'index.ts');
const OPERATIONS_DIR = join(ROOT, 'src', 'generated', 'operations');
const STAFF_OPERATIONS_DIR = join(ROOT, 'src', 'generated', 'staff', 'operations');
const OUTPUT = join(ROOT, 'src', 'migrate', 'v1-map.ts');
const ENUMS_OUTPUT = join(ROOT, 'src', 'compat', 'enums.ts');
const COMPAT_INDEX = join(ROOT, 'src', 'compat', 'index.ts');
/** The 6.x API host in the recorded URLs. */
const HOST = 'https://v1-map.invalid';
/** The 6.x modules that are not REST functions. The tool reports their names with a hint. */
const NOT_REST = /^(auth|realtime|http|resources|utilities)\//;
/** A 6.x function has fewer parameters. The markers use one digit for the index. */
const PARAMETERS_MAX = 10;
/** The base of the number markers: argument `i` is `NUMBER_MARKER + i`. */
const NUMBER_MARKER = 73_100;
/** A 6.x function sends its request in this time, or it does not send one. */
const SETTLE_MS = 5;

type ParameterKind = 'string' | 'number' | 'boolean' | 'choice' | 'array' | 'object' | 'function';

interface V1Function {
    readonly name: string;
    readonly file: string;
    readonly parameters: readonly {
        name: string;
        initializer: string | null;
        kind: ParameterKind;
    }[];
    readonly page: boolean;
    /** `true` when 6.x gives an array (not a page). */
    readonly list: boolean;
    /** The 6.x class of the data, such as `PlaceZone`, or `null`. */
    readonly model: string | null;
}

interface V2Operation {
    /** `staff` for the staff API. */
    readonly module: 'staff' | null;
    readonly namespace: string;
    readonly name: string;
    readonly method: string;
    readonly segments: readonly string[];
    readonly params: ReadonlySet<string>;
    readonly hasBody: boolean;
    /** `true` when the response is an array. */
    readonly list: boolean;
    /** The named schema of the response data, or of its items, such as `Zone`. */
    readonly model: string | null;
}

interface RecordedRequest {
    readonly method: string;
    readonly url: string;
    readonly body: unknown;
}

/** The hints for the 6.x exports that are not REST functions, by module. */
const HINTS: Readonly<Record<string, string>> = {
    auth: 'use createAuthSession and configure (README: Log in)',
    realtime: 'use createRealtime (README: Realtime)',
    http: 'use a generated operation, or fetch',
    resources: 'a 6.x request helper: use the generated operation',
    utilities: '7.x has no replacement',
};

async function main(): Promise<void> {
    const check = process.argv.includes('--check');
    const functions = readV1Functions();
    const operations = [
        ...(await readV2Operations(OPERATIONS_DIR, null)),
        ...(await readV2Operations(STAFF_OPERATIONS_DIR, 'staff')),
    ];
    const record = await loadRecorder();

    const calls: Record<string, CallMapping> = {};
    const unmapped: Record<string, string> = {};
    const models = new Map<string, Map<string, number>>();
    for (const fn of functions) {
        if (NOT_REST.test(fn.file)) {
            unmapped[fn.name] = HINTS[fn.file.split('/')[0] ?? ''] ?? '7.x has no replacement';
            continue;
        }
        const mapped = await mapFunction(fn, operations, record);
        if (typeof mapped === 'string') {
            unmapped[fn.name] = mapped;
            continue;
        }
        calls[fn.name] = mapped.call;
        if (fn.model !== null && mapped.model !== null) {
            const votes = models.get(fn.model) ?? new Map<string, number>();
            const key = `${mapped.call.module ?? ''}:${mapped.model}`;
            votes.set(key, (votes.get(key) ?? 0) + 1);
            models.set(fn.model, votes);
        }
    }
    // A 6.x class becomes the 7.x schema that most of its functions give. A tie has no type.
    const types: Record<string, TypeMapping> = {};
    for (const [model, votes] of models) {
        const [first, second] = [...votes].sort(([, a], [, b]) => b - a);
        if (first === undefined || (second !== undefined && first[1] <= second[1])) continue;
        const [module = '', name = ''] = first[0].split(':');
        types[model] = module === 'staff' ? { name, module } : { name };
    }
    // The short name of a schema is the better 7.x name, such as `User`.
    const schemas = await readFile(join(ROOT, 'src', 'generated', 'schemas.ts'), 'utf8');
    const aliases = new Map<string, string>();
    for (const [, name = '', alias = ''] of schemas.matchAll(/export \{\s*(\w+) as (\w+),/g)) {
        aliases.set(name, alias);
    }
    for (const [model, type] of Object.entries(types)) {
        if (type.module === undefined) types[model] = { name: aliases.get(type.name) ?? type.name };
    }
    const enums = readV1Enums();
    // A 6.x name that the compat module also exports, such as `registerMockEndpoint`, moves there.
    const compat = readCompatExports(new Set([...enums.keys(), ...v1Exports().exports.keys()]));
    for (const name of Object.keys(compat)) delete unmapped[name];
    for (const name of readV1OtherExports()) {
        if (name in calls || name in unmapped || name in types || name in compat) continue;
        unmapped[name] = '7.x has no replacement';
    }

    const code =
        '// Generated by scripts/v1-map.ts from the 6.x source and the 7.x operations. Do not edit.\n' +
        "import type { CallMap, TypeMapping } from './map.ts';\n\n" +
        '/** The 7.x call for each 6.x REST function. */\n' +
        `export const V1_CALLS: CallMap = ${JSON.stringify(sortKeys(calls))};\n\n` +
        '/** The 7.x type for each 6.x class, such as `Zone` for `PlaceZone`. */\n' +
        `export const V1_TYPES: Readonly<Record<string, TypeMapping>> = ${JSON.stringify(sortKeys(types))};\n\n` +
        '/** The 6.x names that `@placeos/ts-client/compat` has. The tool moves their imports. */\n' +
        `export const V1_COMPAT: Readonly<Record<string, 'type' | 'value'>> = ${JSON.stringify(sortKeys(compat))};\n\n` +
        '/** The 6.x exports that the tool does not change, with a hint. */\n' +
        `export const V1_UNMAPPED: Readonly<Record<string, string>> = ${JSON.stringify(sortKeys(unmapped))};\n`;
    const config = (await resolveConfig(join(ROOT, 'package.json'))) ?? {};
    const outputs = [
        { path: OUTPUT, text: await format(code, { ...config, filepath: OUTPUT }) },
        {
            path: ENUMS_OUTPUT,
            text: await format(enumsCode(enums), { ...config, filepath: ENUMS_OUTPUT }),
        },
    ];
    const count = `${Object.keys(calls).length} mapped, ${Object.keys(unmapped).length} not mapped`;
    for (const output of outputs) {
        const name = relative(ROOT, output.path);
        if (check) {
            const current = await readFile(output.path, 'utf8').catch(() => '');
            if (current !== output.text) {
                console.error(`${name} is not up to date. Run: bun scripts/v1-map.ts`);
                process.exit(1);
            }
            continue;
        }
        await writeFile(output.path, output.text);
        console.log(`Wrote ${name}.`);
    }
    console.log(check ? `The 6.x map is up to date (${count}).` : `The 6.x map has ${count}.`);
}

/**
 * The exports of `src/compat` that 6.x also has, with `value` or `type`. The enums are generated
 * into `src/compat/enums.ts` by this script, so they count before the file exists.
 */
function readCompatExports(v1Names: ReadonlySet<string>): Record<string, 'type' | 'value'> {
    const program = ts.createProgram([COMPAT_INDEX], {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.Preserve,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        allowImportingTsExtensions: true,
        noEmit: true,
        skipLibCheck: true,
    });
    const checker = program.getTypeChecker();
    const source = program.getSourceFile(COMPAT_INDEX);
    assert(source !== undefined, 'the compat index exists');
    const moduleSymbol = checker.getSymbolAtLocation(source);
    assert(moduleSymbol !== undefined, 'the compat index is a module');
    const compat: Record<string, 'type' | 'value'> = {};
    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
        const name = exported.getName();
        if (!v1Names.has(name)) continue;
        const symbol =
            exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
        compat[name] = symbol.flags & ts.SymbolFlags.Value ? 'value' : 'type';
    }
    return compat;
}

/** The 6.x enums with names as values, where the server sends numbers. 7.x has the numbers. */
const NUMBER_ENUMS: Readonly<Record<string, Readonly<Record<string, number>>>> = {
    MediaAnimation: ANIMATIONS,
};

/** The 6.x enums of the REST modules, with the 7.x value of each member. */
function readV1Enums(): Map<string, { key: string; value: string | number }[]> {
    const { checker, exports } = v1Exports();
    const enums = new Map<string, { key: string; value: string | number }[]>();
    for (const [name, symbol] of exports) {
        const declaration = symbol.declarations?.find(ts.isEnumDeclaration);
        if (declaration === undefined) continue;
        if (NOT_REST.test(relative(V1_SOURCE, declaration.getSourceFile().fileName))) continue;
        const members = declaration.members.map((member) => {
            const key = member.name.getText();
            const v1Value = checker.getConstantValue(member);
            assert(v1Value !== undefined, `${name}.${key} has a constant value`);
            const numbers = NUMBER_ENUMS[name];
            if (numbers === undefined) return { key, value: v1Value };
            const value = numbers[String(v1Value)];
            assert(value !== undefined, `${name}.${key} has a 7.x number`);
            return { key, value };
        });
        enums.set(name, members);
    }
    return enums;
}

/**
 * The 6.x enums as objects. The type of the same name is the union of the values, so a 6.x enum
 * value fits the 7.x field.
 */
function enumsCode(
    enums: ReadonlyMap<string, readonly { key: string; value: string | number }[]>,
): string {
    let code =
        '// Generated by scripts/v1-map.ts from the 6.x source. Do not edit.\n' +
        '/**\n * The enums of 6.x, with the values of 7.x, for `@placeos/ts-client/compat`.\n *\n * @module\n */\n';
    for (const [name, members] of [...enums].sort(([a], [b]) => a.localeCompare(b))) {
        const fields = members.map((member) => `${member.key}: ${JSON.stringify(member.value)}`);
        code +=
            `\n/** The values of the 6.x enum \`${name}\`. */\n` +
            `export const ${name} = { ${fields.join(', ')} } as const;\n` +
            `export type ${name} = (typeof ${name})[keyof typeof ${name}];\n`;
    }
    return code;
}

/** Reads the exported functions of 6.x, with the TypeScript checker. */
function readV1Functions(): V1Function[] {
    const { checker, exports } = v1Exports();
    const functions: V1Function[] = [];
    for (const [name, symbol] of exports) {
        const declaration = symbol.declarations?.find(
            (node): node is ts.FunctionDeclaration =>
                ts.isFunctionDeclaration(node) && node.body !== undefined,
        );
        if (declaration === undefined) continue;
        const file = relative(V1_SOURCE, declaration.getSourceFile().fileName);
        assert(declaration.parameters.length <= PARAMETERS_MAX, `${name} has few parameters`);
        const parameters = declaration.parameters.map((parameter) => ({
            name: parameter.name.getText(),
            initializer: parameter.initializer?.getText() ?? null,
            kind: parameterKind(checker, checker.getTypeAtLocation(parameter)),
        }));
        const signature = checker.getSignatureFromDeclaration(declaration);
        const returned =
            signature === undefined ? null : checker.getReturnTypeOfSignature(signature);
        const page = returned?.aliasSymbol?.getName() === 'QueryResponse';
        const data = page
            ? returned?.aliasTypeArguments?.[0]
            : returned && checker.getAwaitedType(returned);
        const modelSymbol = data?.getSymbol();
        const model =
            modelSymbol !== undefined && modelSymbol.flags & ts.SymbolFlags.Class
                ? modelSymbol.getName()
                : null;
        const list = !page && data !== undefined && data !== null && checker.isArrayType(data);
        functions.push({ name, file, parameters, page, list, model });
    }
    return functions;
}

/** The exports of 6.x that are not functions, such as classes and constants. */
function readV1OtherExports(): string[] {
    const { exports } = v1Exports();
    const names: string[] = [];
    for (const [name, symbol] of exports) {
        if (symbol.flags & ts.SymbolFlags.Value) names.push(name);
    }
    return names;
}

let cachedExports: { checker: ts.TypeChecker; exports: Map<string, ts.Symbol> } | null = null;

function v1Exports(): { checker: ts.TypeChecker; exports: Map<string, ts.Symbol> } {
    if (cachedExports !== null) return cachedExports;
    const program = ts.createProgram([V1_INDEX], {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        strict: true,
        skipLibCheck: true,
        noEmit: true,
    });
    const checker = program.getTypeChecker();
    const source = program.getSourceFile(V1_INDEX);
    assert(source !== undefined, 'the 6.x index exists');
    const moduleSymbol = checker.getSymbolAtLocation(source);
    assert(moduleSymbol !== undefined, 'the 6.x index is a module');
    const exports = new Map<string, ts.Symbol>();
    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
        const symbol =
            exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
        exports.set(exported.getName(), symbol);
    }
    cachedExports = { checker, exports };
    return cachedExports;
}

function parameterKind(checker: ts.TypeChecker, type: ts.Type): ParameterKind {
    const parts = (type.isUnion() ? type.types : [type]).filter(
        (part) => !(part.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)),
    );
    if (parts.length > 0 && parts.every((part) => part.isStringLiteral())) return 'choice';
    if (parts.every((part) => part.flags & ts.TypeFlags.BooleanLike)) return 'boolean';
    if (parts.some((part) => part.flags & ts.TypeFlags.StringLike)) return 'string';
    if (parts.some((part) => part.flags & ts.TypeFlags.NumberLike)) return 'number';
    if (parts.some((part) => checker.isArrayType(part) || checker.isTupleType(part)))
        return 'array';
    if (parts.some((part) => part.getCallSignatures().length > 0)) return 'function';
    return 'object';
}

/** Reads the method, the path and the parameter names of each generated operation. */
async function readV2Operations(dir: string, module: 'staff' | null): Promise<V2Operation[]> {
    const index = await readFile(join(dir, 'index.ts'), 'utf8');
    const operations: V2Operation[] = [];
    for (const [, namespace = '', file = ''] of index.matchAll(
        /export \* as (\w+) from '\.\/([\w-]+\.ts)'/g,
    )) {
        const text = await readFile(join(dir, file), 'utf8');
        const names = new Map<string, string>();
        for (const [, name = '', constant = ''] of text.matchAll(
            /export function (\w+)\([\s\S]*?return call\((\w+),/g,
        )) {
            names.set(constant, name);
        }
        for (const block of text.split(/\nconst /).slice(1)) {
            const header =
                /^(\w+) = \/\* @__PURE__ \*\/ operation\(\{\n\s+method: '(\w+)',\n\s+path: '([^']+)'/.exec(
                    block,
                );
            if (header === null) continue;
            const [, constant = '', method = '', path = ''] = header;
            const name = names.get(constant);
            assert(name !== undefined, `the operation ${constant} has a function`);
            const paramsText = /params: ([\s\S]*?)\n {4}body: /.exec(block)?.[1] ?? '';
            const params = new Set<string>();
            for (const [, key = ''] of paramsText.matchAll(/^\s+(\w+): \/\* @__PURE__ \*\//gm))
                params.add(key);
            const hasBody = !/\n {4}body: null,/.test(block);
            const response = (/\n {4}response: (.*),\n/.exec(block)?.[1] ?? '').replaceAll(
                '/* @__PURE__ */ ',
                '',
            );
            const model = /^(?:array\()?([A-Z]\w*)\)?$/.exec(response)?.[1] ?? null;
            operations.push({
                module,
                namespace,
                name,
                method,
                segments: path.split('/').filter(Boolean),
                params,
                hasBody,
                // `array(` can be on its own line, before the items.
                list: /\n {4}response: (?:\/\* @__PURE__ \*\/ )?array\(/.test(block),
                model,
            });
        }
    }
    assert(operations.length > 0, 'the generated operations exist');
    return operations;
}

type Recorder = (
    fn: V1Function,
    args: unknown[],
) => Promise<{ requests: RecordedRequest[]; reads: string[] }>;

/** Loads 6.x with a recorder in place of its HTTP module. */
async function loadRecorder(): Promise<Recorder> {
    const requests: RecordedRequest[] = [];
    const reads: string[] = [];
    Reflect.set(globalThis, '__v1MapRecord', (request: RecordedRequest) => requests.push(request));
    // The response records the keys that 6.x reads, to find a key that 6.x selects.
    Reflect.set(
        globalThis,
        '__v1MapResponse',
        () =>
            new Proxy(
                {},
                {
                    get: (_target, key) => {
                        if (typeof key === 'string') reads.push(key);
                        return undefined;
                    },
                },
            ),
    );
    // 6.x reads the page location and the storage when it loads.
    const location = { protocol: 'https:', host: 'v1-map.invalid', origin: HOST, href: `${HOST}/` };
    Reflect.set(globalThis, 'window', { location });
    Reflect.set(globalThis, 'location', location);
    Reflect.set(globalThis, 'localStorage', memoryStorage());
    Reflect.set(globalThis, 'sessionStorage', memoryStorage());
    const httpModule = join(V1_SOURCE, 'http', 'functions.ts');
    Bun.plugin({
        name: '6.x HTTP recorder',
        setup(build) {
            build.onLoad({ filter: /\/src\/http\/functions\.ts$/ }, (args) => {
                assert(
                    args.path === httpModule,
                    `only the 6.x HTTP module is replaced: ${args.path}`,
                );
                return { loader: 'js', contents: RECORDER_SOURCE };
            });
        },
    });
    const v1: unknown = await import(V1_INDEX);
    return async (fn, args) => {
        requests.length = 0;
        reads.length = 0;
        const target: unknown = Reflect.get(Object(v1), fn.name);
        assert(typeof target === 'function', `${fn.name} is a function`);
        try {
            const value: unknown = Reflect.apply(target, undefined, args);
            if (value instanceof Promise) value.catch(() => {});
        } catch {
            // A function that throws before it sends a request has no request.
        }
        await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));
        return { requests: [...requests], reads: [...reads] };
    };
}

function memoryStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
    const values = new Map<string, string>();
    return {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => void values.set(key, value),
        removeItem: (key) => void values.delete(key),
    };
}

/** The recorder that replaces `src/http/functions.ts` of 6.x. */
const RECORDER_SOURCE = `
const record = globalThis.__v1MapRecord;
const respond = () => Promise.resolve(globalThis.__v1MapResponse());
export const engine_http = {};
export function responseHeaders() { return {}; }
export function get(url) { record({ method: 'GET', url, body: undefined }); return respond(); }
// A body in the options, or a body that is JSON text, is the same request.
const json = (body) => { try { return typeof body === 'string' ? JSON.parse(body) : body; } catch { return body; } };
export function del(url, options) { record({ method: 'DELETE', url, body: json(options?.body) }); return respond(); }
export function post(url, body) { record({ method: 'POST', url, body: json(body) }); return respond(); }
export function put(url, body) { record({ method: 'PUT', url, body: json(body) }); return respond(); }
export function patch(url, body) { record({ method: 'PATCH', url, body: json(body) }); return respond(); }
`;

function stringMarker(index: number): string {
    return `s${index}zq`;
}
function arrayMarker(index: number): string {
    return `a${index}zq`;
}
function objectKey(index: number): string {
    return `o${index}zk`;
}

/** The marker argument for a parameter, or `undefined` for a parameter that has no marker. */
function marker(
    kind: ParameterKind,
    index: number,
    flag: boolean,
    options: { readonly members: boolean } = { members: true },
): unknown {
    switch (kind) {
        case 'string':
            return stringMarker(index);
        case 'number':
            return NUMBER_MARKER + index;
        case 'boolean':
            return flag;
        case 'array':
            return [arrayMarker(index)];
        case 'object':
            return options.members ? objectMarker(index) : { [objectKey(index)]: `o${index}zv` };
        case 'choice':
        case 'function':
            return undefined;
    }
}

/**
 * An object marker. A property that 6.x reads and that the object does not have gives a member
 * marker, such as the `version` that 6.x updates read from the data.
 */
function objectMarker(index: number): object {
    const target = { [objectKey(index)]: `o${index}zv` };
    return new Proxy(target, {
        get: (object, key) => {
            if (typeof key !== 'string' || key in object || !/^[a-z][a-z_]*$/.test(key)) {
                return Reflect.get(object, key);
            }
            if (key === 'then' || key === 'toJSON') return undefined;
            return `m${index}z${key}zq`;
        },
    });
}

/**
 * A member with the value that 6.x sends when the data does not have it, such as the `0` of
 * `form_data.version || 0`. A second request, with objects that have no members, shows it.
 */
async function withFallback(
    template: Template,
    key: string,
    fn: V1Function,
    record: Recorder,
): Promise<Template> {
    if (template.kind !== 'member') return template;
    const plain = await record(
        fn,
        fn.parameters.map((p, i) => marker(p.kind, i, true, { members: false })),
    );
    const request = plain.requests[0];
    const value = request === undefined ? null : new URL(request.url, HOST).searchParams.get(key);
    if (value === null) return template;
    const fallback = literalQuery(stringTemplate(value));
    if (fallback.kind !== 'literal') return template;
    return { ...template, fallback: fallback.value };
}

async function mapFunction(
    fn: V1Function,
    operations: readonly V2Operation[],
    record: Recorder,
): Promise<{ call: CallMapping; model: string | null } | string> {
    if (fn.parameters.some((parameter) => parameter.kind === 'function')) {
        return 'a callback parameter has no 7.x form';
    }
    const first = await record(
        fn,
        fn.parameters.map((p, i) => marker(p.kind, i, true)),
    );
    if (first.requests.length !== 1) return `it sends ${first.requests.length} requests`;
    const request = first.requests[0];
    assert(request !== undefined, 'one request');
    const url = new URL(request.url, HOST);
    if (url.origin !== HOST) return `it sends the request to another host`;
    const segments = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
    const operation = findOperation(operations, request.method, segments);
    if (operation === null) return `no 7.x operation for ${request.method} ${url.pathname}`;
    // 6.x can make the data into a list, such as the metadata of a zone, which 7.x gives by name.
    if (fn.list && !operation.list) {
        return `6.x gives a list, and ${operation.namespace}.${operation.name} gives another shape`;
    }

    const notes: string[] = [];
    const entries: ObjectEntry[] = [];
    for (const [index, segment] of operation.segments.entries()) {
        const key = /^\{(\w+)\}$/.exec(segment)?.[1];
        if (key === undefined) continue;
        entries.push({ kind: 'property', key, value: stringTemplate(segments[index] ?? '') });
    }
    const spreads = new Set<number>();
    for (const [key, value] of url.searchParams) {
        const spread = /^o(\d)zk$/.exec(key);
        if (spread !== null) {
            const index = Number(spread[1]);
            if (!spreads.has(index)) entries.push({ kind: 'spread', index });
            spreads.add(index);
            continue;
        }
        const template = await withFallback(stringTemplate(value), key, fn, record);
        // 6.x updates send the `version` of the data. Only some 7.x updates have it.
        if (template.kind === 'member' && !operation.params.has(key)) continue;
        if (template.kind === 'literal' && !operation.params.has(key)) {
            notes.push(`6.x sent ${key}=${value}, and 7.x has no ${key} parameter`);
            continue;
        }
        entries.push({ kind: 'property', key, value: literalQuery(template) });
    }
    if (request.body !== undefined) {
        const body = valueTemplate(request.body);
        if (operation.hasBody) {
            entries.push({ kind: 'property', key: 'body', value: body });
        } else if (body.kind === 'arg' && hasOpenQuery(operation, entries)) {
            // The API reads these values from the query. 6.x sent them in the body.
            entries.push({ kind: 'spread', index: body.index });
            notes.push(
                `7.x sends ${fn.parameters[body.index]?.name} in the query, 6.x sent it in the body`,
            );
        } else if (body.kind === 'arg') {
            // The argument is not mapped. The tool does not change a call that gives it.
            notes.push(`7.x has no body for ${fn.parameters[body.index]?.name}`);
        } else if (!isEmptyLiteral(body)) {
            return `6.x sends a body, and ${operation.namespace}.${operation.name} has none`;
        }
    }

    // A boolean has no marker. The two requests with `true` and `false` show where it goes.
    for (const [index, parameter] of fn.parameters.entries()) {
        if (parameter.kind !== 'boolean') continue;
        const second = await record(
            fn,
            fn.parameters.map((p, i) => marker(p.kind, i, i !== index)),
        );
        const other = second.requests[0];
        if (other === undefined) continue;
        for (const [key, value] of new URL(other.url, HOST).searchParams) {
            if (url.searchParams.get(key) === value) continue;
            const at = entries.findIndex((entry) => entry.kind === 'property' && entry.key === key);
            const entry: ObjectEntry = { kind: 'property', key, value: { kind: 'arg', index } };
            if (at >= 0) entries[at] = entry;
            else entries.push(entry);
        }
    }

    const input: Template = { kind: 'object', entries };
    const used = new Set<number>();
    collectArgs(input, used);
    const pickIndex = first.reads
        .map((key) => /^s(\d)zq$/.exec(key)?.[1])
        .find((index) => index !== undefined);
    const pick: Template | null =
        pickIndex === undefined ? null : { kind: 'arg', index: Number(pickIndex) };
    if (pick !== null) collectArgs(pick, used);
    const parameters: V1Parameter[] = fn.parameters.map((parameter, index) => {
        const use = used.has(index)
            ? 'mapped'
            : parameter.kind === 'choice'
              ? 'ignored'
              : 'unsupported';
        return { name: parameter.name, initializer: parameter.initializer, use };
    });
    if (operation.method !== request.method) {
        notes.push(`7.x sends ${operation.method}, 6.x sent ${request.method}`);
    }
    const call: CallMapping = {
        ...(operation.module === null ? {} : { module: operation.module }),
        namespace: operation.namespace,
        operation: operation.name,
        parameters,
        input,
        result: fn.page ? 'page' : 'data',
        pick,
        notes,
    };
    return { call, model: operation.model };
}

/** `true` when the operation has a query parameter that no other argument gives. */
function hasOpenQuery(operation: V2Operation, entries: readonly ObjectEntry[]): boolean {
    const given = new Set(entries.map((entry) => (entry.kind === 'property' ? entry.key : '')));
    const pathKeys = operation.segments.map((segment) => /^\{(\w+)\}$/.exec(segment)?.[1]);
    return [...operation.params].some((key) => !pathKeys.includes(key) && !given.has(key));
}

/** The operation with this path. A fixed segment is a better match than a `{key}`. */
function findOperation(
    operations: readonly V2Operation[],
    method: string,
    segments: readonly string[],
): V2Operation | null {
    // 7.x merges the PUT and PATCH update of a resource into one operation.
    const methods = method === 'PUT' || method === 'PATCH' ? ['PUT', 'PATCH'] : [method];
    let best: V2Operation | null = null;
    let bestScore = -1;
    for (const operation of operations) {
        if (!methods.includes(operation.method)) continue;
        if (operation.segments.length !== segments.length) continue;
        let score = operation.method === method ? 1 : 0;
        let matches = true;
        for (const [index, segment] of operation.segments.entries()) {
            if (/^\{\w+\}$/.test(segment)) continue;
            if (segment !== segments[index]) {
                matches = false;
                break;
            }
            score += 2;
        }
        if (!matches || score < bestScore) continue;
        assert(score !== bestScore, `one best 7.x operation for ${method} /${segments.join('/')}`);
        best = operation;
        bestScore = score;
    }
    return best;
}

const MARKER = /s(\d)zq|a(\d)zq|731(0\d)/g;

/** A template for text that can contain markers, such as a path segment. */
function stringTemplate(text: string): Template {
    const member = /^m(\d)z([a-z_]+)zq$/.exec(text);
    if (member !== null) return { kind: 'member', index: Number(member[1]), key: member[2] ?? '' };
    const parts: (string | number)[] = [];
    let last = 0;
    for (const match of text.matchAll(MARKER)) {
        const index = Number(match[1] ?? match[2] ?? match[3]);
        if (match.index > last) parts.push(text.slice(last, match.index));
        parts.push(index);
        last = match.index + match[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    if (parts.length === 0) return { kind: 'literal', value: '' };
    const [only] = parts;
    if (parts.length === 1 && typeof only === 'number') return { kind: 'arg', index: only };
    if (parts.length === 1 && typeof only === 'string') return { kind: 'literal', value: only };
    return { kind: 'concat', parts };
}

/** A query value is text. A fixed `true` or a number is a boolean or a number in 7.x. */
function literalQuery(template: Template): Template {
    if (template.kind !== 'literal' || typeof template.value !== 'string') return template;
    if (template.value === 'true' || template.value === 'false') {
        return { kind: 'literal', value: template.value === 'true' };
    }
    if (/^-?\d+$/.test(template.value)) return { kind: 'literal', value: Number(template.value) };
    return template;
}

/** A template for a JSON body. */
function valueTemplate(value: unknown): Template {
    if (typeof value === 'string') return stringTemplate(value);
    if (typeof value === 'number') {
        const index = value - NUMBER_MARKER;
        if (index >= 0 && index < PARAMETERS_MAX) return { kind: 'arg', index };
        return { kind: 'literal', value };
    }
    if (typeof value === 'boolean' || value === null) return { kind: 'literal', value };
    if (Array.isArray(value)) {
        const [only] = value;
        const index = typeof only === 'string' ? /^a(\d)zq$/.exec(only)?.[1] : undefined;
        if (value.length === 1 && index !== undefined) return { kind: 'arg', index: Number(index) };
        return { kind: 'array', items: value.map(valueTemplate) };
    }
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        const entries: ObjectEntry[] = [];
        for (const key of keys) {
            const spread = /^o(\d)zk$/.exec(key);
            if (spread !== null) {
                if (keys.length === 1) return { kind: 'arg', index: Number(spread[1]) };
                entries.push({ kind: 'spread', index: Number(spread[1]) });
                continue;
            }
            entries.push({ kind: 'property', key, value: valueTemplate(Reflect.get(value, key)) });
        }
        return { kind: 'object', entries };
    }
    return { kind: 'literal', value: null };
}

function isEmptyLiteral(template: Template): boolean {
    if (template.kind === 'object') return template.entries.length === 0;
    if (template.kind === 'array') return template.items.length === 0;
    return false;
}

function collectArgs(template: Template, used: Set<number>): void {
    switch (template.kind) {
        case 'arg':
        case 'member':
            used.add(template.index);
            return;
        case 'literal':
            return;
        case 'concat':
            for (const part of template.parts) if (typeof part === 'number') used.add(part);
            return;
        case 'array':
            for (const item of template.items) collectArgs(item, used);
            return;
        case 'object':
            for (const entry of template.entries) {
                if (entry.kind === 'spread') used.add(entry.index);
                else collectArgs(entry.value, used);
            }
    }
}

function sortKeys<T>(record: Record<string, T>): Record<string, T> {
    return Object.fromEntries(Object.entries(record).sort(([a], [b]) => a.localeCompare(b)));
}

// Last, so that the constants above exist when it runs.
await main();
