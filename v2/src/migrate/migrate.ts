/**
 * Rewrites the v1 calls of one source file to v2. `cli.ts` reads and writes the files.
 *
 * ```ts
 * import * as ts from 'typescript';
 * const result = migrateSource(ts, 'zone.ts', text, V1_TABLES);
 * ```
 *
 * - A call of a mapped v1 function becomes the v2 operation with `.then(orThrow)`, so the code
 *   still gets the data, and an error still rejects the promise.
 * - A type reference to a v1 class becomes the v2 type, such as `PlaceZone` to `Zone`.
 * - A test double of a v1 function, such as `vi.mocked(showZone)` or the functions of a `vi.mock`
 *   factory, becomes the test double of the v2 operation. `mockReply` and `fromV1Mock` make v2
 *   results of the v1 values.
 * - The tool does not change other uses of v1. Each one is a finding, with a hint.
 *
 * The tool only parses the file. It does not type check it. After the migration, the compiler
 * shows the differences of the data, such as a field that can now be `null`.
 *
 * @module
 */
import type * as TS from 'typescript-5';
import { assert } from '../core/assert.ts';
import type { CallMap, CallMapping, ObjectEntry, Template } from './map.ts';

export const V1_MODULE = '@placeos/ts-client';
export const COMPAT_MODULE = '@placeos/ts-client/compat';
/** The objects of the test frameworks: `vi` of Vitest and `jest` of Jest. */
const TEST_GLOBALS: ReadonlySet<string> = new Set(['vi', 'jest']);
/** The mock methods that set the value of a promise. The value becomes a v2 result. */
const RESOLVED_VALUE_METHODS: ReadonlySet<string> = new Set([
    'mockResolvedValue',
    'mockResolvedValueOnce',
]);
/** The checks of the arguments. The arguments become the v2 input. */
const CALLED_WITH_METHODS: ReadonlySet<string> = new Set([
    'toHaveBeenCalledWith',
    'toHaveBeenCalledOnceWith',
    'toHaveBeenCalledExactlyOnceWith',
    'toHaveBeenLastCalledWith',
    'toBeCalledWith',
    'lastCalledWith',
]);
/**
 * The mock methods that take a v1 implementation or value, and the method for the v2 one. A
 * value becomes an implementation, and so does a resolved value of a v1 function that selects a
 * key, such as `showMetadata`.
 */
const VALUE_TO_IMPLEMENTATION: Readonly<Record<string, string>> = {
    mockImplementation: 'mockImplementation',
    mockImplementationOnce: 'mockImplementationOnce',
    mockReturnValue: 'mockImplementation',
    mockReturnValueOnce: 'mockImplementationOnce',
    mockResolvedValue: 'mockImplementation',
    mockResolvedValueOnce: 'mockImplementationOnce',
};
/** A chain such as `vi.mocked(f).mockResolvedValueOnce(a).mockResolvedValueOnce(b)` is shorter. */
const CHAIN_DEPTH_MAX = 32;
/** A name that collides gets a suffix. A file has fewer names with the same base. */
const ALIASES_MAX = 100;

export interface MigrateTables {
    readonly calls: CallMap;
    readonly types: Readonly<Record<string, string>>;
    /** The v1 names that `@placeos/ts-client/compat` has. Their imports move there. */
    readonly compat: Readonly<Record<string, 'type' | 'value'>>;
    readonly unmapped: Readonly<Record<string, string>>;
}

/** A use of v1 that the tool did not change. */
export interface Finding {
    /** 1-based. */
    readonly line: number;
    /** 1-based. */
    readonly column: number;
    /** The v1 name. */
    readonly name: string;
    readonly message: string;
}

export interface MigrateResult {
    readonly text: string;
    /** The number of calls and type references that the tool changed. */
    readonly changes: number;
    readonly findings: readonly Finding[];
    /** The v1 functions of the changed calls. The report shows their notes. */
    readonly migrated: ReadonlySet<string>;
}

interface Edit {
    readonly start: number;
    readonly end: number;
    readonly text: string;
}

/** Rewrites the v1 calls of one file. The text is the same when the file does not import v1. */
export function migrateSource(
    ts: typeof TS,
    fileName: string,
    text: string,
    tables: MigrateTables,
): MigrateResult {
    const kind = /\.[cm]?tsx$/.test(fileName) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const source = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, kind);

    const imports = readImports(ts, source);
    if (imports.declarations.length === 0) {
        return { text, changes: 0, findings: [], migrated: new Set() };
    }
    const taken = declaredNames(ts, source);
    const edits: Edit[] = [];
    const findings: Finding[] = [];
    const migrated = new Set<string>();
    /** The uses of each local name of a named import, and how many the tool changed. */
    const uses = new Map<string, { total: number; changed: number }>();
    /** The local names of the v2 namespaces that the new import gives. */
    const namespaceNames = new Map<string, string>();
    /** The v2 types that the new import gives, by local name. */
    const typeNames = new Map<string, string>();
    const compatNames = new Set<string>();
    /** The local names of the v1 imports that move to the compat module. */
    const moved = new Set<string>();
    for (const [local, imported] of imports.named) {
        const kind = tables.compat[imported];
        if (kind === undefined) continue;
        moved.add(local);
        const name = local === imported ? imported : `${imported} as ${local}`;
        compatNames.add(kind === 'type' ? `type ${name}` : name);
    }
    let changes = 0;

    function find(node: TS.Node, name: string, message: string): void {
        const at = source.getLineAndCharacterOfPosition(node.getStart(source));
        findings.push({ line: at.line + 1, column: at.character + 1, name, message });
    }

    /** A local name for a new import: the name, or the name with a suffix if the file has it. */
    function localName(name: string): string {
        if (!taken.has(name)) {
            taken.add(name);
            return name;
        }
        for (let index = 1; index <= ALIASES_MAX; index += 1) {
            const alias = `${name}V2${index === 1 ? '' : index}`;
            if (taken.has(alias)) continue;
            taken.add(alias);
            return alias;
        }
        assert(false, `a free local name for ${name}`);
    }

    function namespaceLocal(namespace: string): string {
        const known = namespaceNames.get(namespace);
        if (known !== undefined) return known;
        const name = localName(namespace);
        namespaceNames.set(namespace, name);
        return name;
    }

    /** The local name of a compat export that a namespace import used, such as `PlaceDriverRole`. */
    const compatLocals = new Map<string, string>();
    function compatLocal(name: string): string {
        const known = compatLocals.get(name);
        if (known !== undefined) return known;
        const local = localName(name);
        compatLocals.set(name, local);
        const specifier = local === name ? name : `${name} as ${local}`;
        compatNames.add(tables.compat[name] === 'type' ? `type ${specifier}` : specifier);
        return local;
    }

    function typeLocal(v2Name: string): string {
        for (const [local, name] of typeNames) if (name === v2Name) return local;
        const local = localName(v2Name);
        typeNames.set(local, v2Name);
        return local;
    }

    /** The text of a node, with the edits inside it. The edits become part of the parent edit. */
    function textOf(node: TS.Node): string {
        const start = node.getStart(source);
        const inside = edits.filter((edit) => edit.start >= start && edit.end <= node.end);
        return applyEdits(text.slice(start, node.end), inside, start);
    }

    /** Replaces a node. The edits inside it are removed, because the new text has them. */
    function replace(node: TS.Node, replacement: string): void {
        const start = node.getStart(source);
        for (let index = edits.length - 1; index >= 0; index -= 1) {
            const edit = edits[index];
            if (edit !== undefined && edit.start >= start && edit.end <= node.end)
                edits.splice(index, 1);
        }
        edits.push({ start, end: node.end, text: replacement });
    }

    function countUse(local: string, changed: boolean): void {
        const count = uses.get(local) ?? { total: 0, changed: 0 };
        uses.set(local, { total: count.total + 1, changed: count.changed + (changed ? 1 : 0) });
    }

    /** Rewrites a call. Gives `false`, with a finding, when it cannot. */
    function rewriteCall(call: TS.CallExpression, name: string, prefix: string | null): boolean {
        const mapping = tables.calls[name];
        assert(mapping !== undefined, `${name} has a mapping`);
        const rendered = renderCall(ts, call.arguments, mapping, textOf);
        if (typeof rendered === 'string') {
            find(call, name, rendered);
            return false;
        }
        const namespace =
            prefix === null ? namespaceLocal(mapping.namespace) : `${prefix}.${mapping.namespace}`;
        const helper = mapping.result === 'page' ? 'orThrowPage' : 'orThrow';
        compatNames.add(helper);
        const pick =
            rendered.pick === null
                ? ''
                : `.then((${rendered.pickParameter}) => ${rendered.pickParameter}[${rendered.pick}])`;
        replace(
            call,
            `${namespace}.${mapping.operation}(${rendered.input}).then(${helper})${pick}`,
        );
        migrated.add(name);
        changes += 1;
        return true;
    }

    /** The test doubles that the tool changed, by the call that holds the v2 function. */
    const doubles = new Map<TS.Node, { name: string; mapping: CallMapping }>();
    /** A spec file. There a reference to a v1 function that is not a call is a test double. */
    const testFile = /\.(spec|test)\.[cm]?[jt]sx?$/.test(fileName);
    /** `true` when a call on a test double uses `fromV1Mock`, out of a `vi.mock` factory. */
    let importsFromV1Mock = false;

    /**
     * Changes the function of a test double, such as `vi.mocked(showZone)` to
     * `vi.mocked(zones.show)`. `visit` changes the calls on it later, at each call of the chain.
     */
    function rewriteDouble(
        node: TS.Expression,
        wrapper: TS.Node,
        name: string,
        prefix: string | null,
    ): void {
        const mapping = tables.calls[name];
        assert(mapping !== undefined, `${name} has a mapping`);
        const namespace =
            prefix === null ? namespaceLocal(mapping.namespace) : `${prefix}.${mapping.namespace}`;
        replace(node, `${namespace}.${mapping.operation}`);
        doubles.set(wrapper, { name, mapping });
        migrated.add(name);
        changes += 1;
    }

    /** The test double at the base of a chain such as `vi.mocked(f).mockResolvedValue(...)`. */
    function doubleOf(callee: TS.Expression): { name: string; mapping: CallMapping } | null {
        let current: TS.Expression = callee;
        for (let depth = 0; depth < CHAIN_DEPTH_MAX; depth += 1) {
            const found = doubles.get(current);
            if (found !== undefined) return found;
            // `(queryZones as Mock).mockResolvedValue(...)` is a chain on the same double.
            if (
                ts.isCallExpression(current) ||
                ts.isPropertyAccessExpression(current) ||
                ts.isParenthesizedExpression(current) ||
                ts.isAsExpression(current) ||
                ts.isNonNullExpression(current) ||
                ts.isSatisfiesExpression(current) ||
                ts.isTypeAssertionExpression(current)
            ) {
                current = current.expression;
            } else {
                return null;
            }
        }
        return null;
    }

    /** Changes one call on a test double: the value of a mock, or the arguments of a check. */
    function rewriteDoubleCall(
        call: TS.CallExpression,
        method: string,
        double: { name: string; mapping: CallMapping },
    ): void {
        const { name, mapping } = double;
        const [value] = call.arguments;
        const callee = call.expression;
        if (RESOLVED_VALUE_METHODS.has(method) && value !== undefined && mapping.pick === null) {
            const helper = mapping.result === 'page' ? 'mockPage' : 'mockReply';
            compatNames.add(helper);
            replace(value, `${helper}(${textOf(value)})`);
            return;
        }
        // A v1 implementation or value: `fromV1Mock` gives it the v1 arguments, and makes a v2
        // result of its value. A value becomes an implementation that gives it.
        const implementation = VALUE_TO_IMPLEMENTATION[method];
        if (
            value !== undefined &&
            ts.isPropertyAccessExpression(callee) &&
            implementation !== undefined
        ) {
            const v1 = method.startsWith('mockImplementation')
                ? textOf(value)
                : `() => (${textOf(value)})`;
            importsFromV1Mock = true;
            replace(
                call,
                `${textOf(callee.expression)}.${implementation}(fromV1Mock(${v1}, ${fromV1MockArgs(mapping)}))`,
            );
            return;
        }
        if (CALLED_WITH_METHODS.has(method)) {
            const rendered = renderCall(ts, call.arguments, mapping, textOf, true);
            if (typeof rendered === 'string') {
                find(call, name, rendered);
                return;
            }
            replace(call, `${textOf(call.expression)}(${rendered.input})`);
            return;
        }
    }

    /** `true` when a `vi.mock` factory uses `fromV1Mock`. The file then imports it. */
    let usesFromV1Mock = false;

    /**
     * Changes the v1 functions of a `vi.mock` factory to v2 namespaces. `fromV1Mock` keeps the
     * v1 implementation: `showZone: vi.fn(impl)` becomes `zones: { show: vi.fn(fromV1Mock(impl,
     * ...)) }`. A Jest factory cannot import the compat module, so it is a finding.
     */
    function rewriteFactory(
        call: TS.CallExpression,
        factory: TS.ArrowFunction | TS.FunctionExpression,
        vitest: boolean,
    ): void {
        const objects = factoryObjects(ts, factory);
        const mapped = objects.some((object) =>
            object.properties.some((property) => mappingOf(property) !== null),
        );
        if (!mapped) return;
        if (!vitest) {
            find(
                call,
                V1_MODULE,
                'a mock factory with v1 names: give the v2 namespaces, such as zones: { show: jest.fn() }',
            );
            return;
        }
        for (const object of objects) rewriteFactoryObject(object);
    }

    function mappingOf(property: TS.ObjectLiteralElementLike): CallMapping | null {
        const name = property.name;
        if (name === undefined || !(ts.isIdentifier(name) || ts.isStringLiteral(name))) return null;
        if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) {
            return null;
        }
        return tables.calls[name.text] ?? null;
    }

    function rewriteFactoryObject(object: TS.ObjectLiteralExpression): void {
        const kept: string[] = [];
        const groups = new Map<string, string[]>();
        let spread: string | null = null;
        for (const property of object.properties) {
            if (ts.isSpreadAssignment(property) && ts.isIdentifier(property.expression)) {
                spread = property.expression.text;
            }
            const mapping = mappingOf(property);
            const name = property.name;
            if (
                mapping === null ||
                name === undefined ||
                !(ts.isIdentifier(name) || ts.isStringLiteral(name))
            ) {
                kept.push(textOf(property));
                continue;
            }
            const value = ts.isPropertyAssignment(property) ? property.initializer : null;
            const entries = groups.get(mapping.namespace) ?? [];
            entries.push(`${mapping.operation}: ${mockValue(value, name.text, mapping)}`);
            groups.set(mapping.namespace, entries);
            migrated.add(name.text);
            changes += 1;
        }
        if (groups.size === 0) return;
        usesFromV1Mock = true;
        for (const [namespace, entries] of groups) {
            const base = spread === null ? '' : `...${spread}.${namespace}, `;
            kept.push(`${namespace}: { ${base}${entries.join(', ')} }`);
        }
        replace(object, `{ ${kept.join(', ')} }`);
    }

    /** The v2 value of one v1 function of a factory. `null` is a shorthand property. */
    function mockValue(value: TS.Expression | null, name: string, mapping: CallMapping): string {
        const extra = fromV1MockArgs(mapping);
        if (
            value !== null &&
            ts.isCallExpression(value) &&
            isTestCall(ts, value.expression, 'fn')
        ) {
            const [implementation] = value.arguments;
            const text = implementation === undefined ? 'undefined' : textOf(implementation);
            return `${textOf(value.expression)}(fromV1Mock(${text}, ${extra}))`;
        }
        return `fromV1Mock(${value === null ? name : textOf(value)}, ${extra})`;
    }

    /** `vi.mocked(f)`, `jest.mocked(f)` or `expect(f)`, with `f` as the first argument. */
    function doubleWrapper(node: TS.Expression): TS.CallExpression | null {
        const parent = node.parent;
        if (!ts.isCallExpression(parent) || parent.arguments[0] !== node) return null;
        const callee = parent.expression;
        if (ts.isIdentifier(callee) && callee.text === 'expect') return parent;
        const isMocked =
            ts.isPropertyAccessExpression(callee) &&
            ts.isIdentifier(callee.expression) &&
            TEST_GLOBALS.has(callee.expression.text) &&
            callee.name.text === 'mocked';
        return isMocked ? parent : null;
    }

    function visit(node: TS.Node): void {
        // The children first, so that a call in an argument is changed before the outer call.
        ts.forEachChild(node, visit);

        if (ts.isCallExpression(node)) {
            const callee = node.expression;
            const double = doubleOf(callee);
            if (double !== null && ts.isPropertyAccessExpression(callee)) {
                rewriteDoubleCall(node, callee.name.text, double);
                return;
            }
            if (isTestCall(ts, callee, 'spyOn')) {
                const [target, method] = node.arguments;
                if (
                    target !== undefined &&
                    method !== undefined &&
                    ts.isIdentifier(target) &&
                    imports.namespaces.has(target.text) &&
                    ts.isStringLiteral(method)
                ) {
                    const mapping = tables.calls[method.text];
                    if (mapping !== undefined) {
                        replace(method, `'${mapping.operation}'`);
                        replace(target, `${target.text}.${mapping.namespace}`);
                        doubles.set(node, { name: method.text, mapping });
                        migrated.add(method.text);
                        changes += 1;
                    }
                }
                return;
            }
            if (isTestCall(ts, callee, 'mock')) {
                const [module, second] = node.arguments;
                if (
                    module === undefined ||
                    !ts.isStringLiteral(module) ||
                    module.text !== V1_MODULE
                ) {
                    return;
                }
                if (second === undefined) {
                    find(
                        node,
                        V1_MODULE,
                        'an automock gives undefined from v2 calls, so .then(orThrow) fails: ' +
                            'give { spy: true }, and set values with mockResolvedValue(mockReply(...))',
                    );
                } else if (ts.isArrowFunction(second) || ts.isFunctionExpression(second)) {
                    rewriteFactory(node, second, isTestCall(ts, callee, 'mock', 'vi'));
                }
                return;
            }
            if (ts.isIdentifier(callee)) {
                const imported = imports.named.get(callee.text);
                if (imported !== undefined && imported in tables.calls) {
                    countUse(callee.text, rewriteCall(node, imported, null));
                }
            } else if (
                ts.isPropertyAccessExpression(callee) &&
                ts.isIdentifier(callee.expression) &&
                imports.namespaces.has(callee.expression.text) &&
                callee.name.text in tables.calls
            ) {
                rewriteCall(node, callee.name.text, callee.expression.text);
            }
            return;
        }

        if (ts.isTypeReferenceNode(node)) {
            const typeName = node.typeName;
            if (ts.isIdentifier(typeName)) {
                const imported = imports.named.get(typeName.text);
                if (imported === undefined || moved.has(typeName.text)) return;
                const v2Name = tables.types[imported];
                if (v2Name !== undefined) {
                    replace(typeName, typeLocal(v2Name));
                    countUse(typeName.text, true);
                    changes += 1;
                }
                return;
            }
            const left = typeName.left;
            const right = typeName.right.text;
            const v2Name = tables.types[right];
            if (!ts.isIdentifier(left) || !imports.namespaces.has(left.text)) return;
            if (v2Name !== undefined) {
                replace(typeName.right, v2Name);
                changes += 1;
            } else if (right in tables.compat) {
                replace(typeName, compatLocal(right));
                changes += 1;
            }
            return;
        }

        if (ts.isIdentifier(node) && isReference(ts, node)) {
            const imported = imports.named.get(node.text);
            // A mapped callee or type name is counted at its parent.
            if (imported === undefined || moved.has(node.text)) return;
            // v1 and v2 have the same module name. A name that v1 does not export is from v2.
            if (!isV1Name(tables, imported)) return;
            if (isCountedAtParent(ts, node, imported, tables)) return;
            const wrapper = doubleWrapper(node);
            if (wrapper !== null && imported in tables.calls) {
                rewriteDouble(node, wrapper, imported, null);
                countUse(node.text, true);
                return;
            }
            if (
                testFile &&
                imported in tables.calls &&
                !ts.isShorthandPropertyAssignment(node.parent)
            ) {
                rewriteDouble(node, node, imported, null);
                countUse(node.text, true);
                return;
            }
            countUse(node.text, false);
            find(node, imported, hint(tables, imported));
            return;
        }

        if (
            ts.isPropertyAccessExpression(node) &&
            ts.isIdentifier(node.expression) &&
            imports.namespaces.has(node.expression.text) &&
            !(ts.isCallExpression(node.parent) && node.parent.expression === node)
        ) {
            const name = node.name.text;
            const wrapper = doubleWrapper(node);
            if (wrapper !== null && name in tables.calls) {
                rewriteDouble(node, wrapper, name, node.expression.text);
                return;
            }
            if (testFile && name in tables.calls) {
                rewriteDouble(node, node, name, node.expression.text);
                return;
            }
            if (name in tables.compat) {
                // `client.PlaceDriverRole.Logic` reads the compat enum, as the app code now does.
                replace(node, compatLocal(name));
                changes += 1;
            } else if (name in tables.calls || name in tables.unmapped || name in tables.types) {
                find(node, name, hint(tables, name));
            }
            return;
        }

        // A test can load a file of the v1 build: `vi.importActual('@placeos/ts-client/dist/index.es.js')`.
        if (ts.isStringLiteral(node) && node.text.startsWith(`${V1_MODULE}/dist/`)) {
            replace(node, `'${V1_MODULE}'`);
            changes += 1;
            return;
        }

        // A test double names the function in a string, such as `jest.spyOn(module, 'showZone')`.
        // The tool changes `vi.spyOn(client, 'showZone')` on a namespace import above.
        if (ts.isStringLiteral(node) && imports.namespaces.size > 0 && node.text in tables.calls) {
            const parent = node.parent;
            const spyOnNamespace =
                ts.isCallExpression(parent) &&
                isTestCall(ts, parent.expression, 'spyOn') &&
                parent.arguments[1] === node;
            if (spyOnNamespace) return;
            const mapping = tables.calls[node.text];
            const target =
                mapping === undefined ? '' : ` (${mapping.namespace}.${mapping.operation})`;
            find(node, node.text, `a test double of v1: make it for the v2 call${target}`);
        }
    }
    visit(source);

    // The hoisted `fromV1Mock` of a factory is also there for the tests.
    if (importsFromV1Mock && !usesFromV1Mock) compatNames.add('fromV1Mock');

    // The new import of the v2 namespaces and types, and of the helpers.
    const added = [
        ...[...namespaceNames].map(([name, local]) =>
            name === local ? name : `${name} as ${local}`,
        ),
        ...[...typeNames].map(([local, name]) =>
            name === local ? `type ${name}` : `type ${name} as ${local}`,
        ),
    ].sort(compareSpecifiers);
    const changed = importEdits(ts, source, imports.declarations, uses, tables, added, moved);
    edits.push(...changed.edits);
    // The new imports go after the last v1 import, or in its place when the tool removes it.
    const lines: string[] = [];
    if (changed.pending.length > 0) {
        lines.push(`import { ${changed.pending.join(', ')} } from '${V1_MODULE}';`);
    }
    if (compatNames.size > 0) {
        const names = [...compatNames].sort(compareSpecifiers).join(', ');
        lines.push(`import { ${names} } from '${COMPAT_MODULE}';`);
    }
    const last = imports.declarations.at(-1);
    assert(last !== undefined, 'a v1 import exists');
    if (lines.length > 0 && changed.removed.has(last)) {
        const start = last.getStart(source);
        edits.push({ start, end: start, text: lines.map((line) => `${line}\n`).join('') });
    } else if (lines.length > 0) {
        edits.push({
            start: last.end,
            end: last.end,
            text: lines.map((line) => `\n${line}`).join(''),
        });
    }

    if (usesFromV1Mock) {
        // `vi.mock` runs before the imports, so its factory gets the helper from `vi.hoisted`.
        const lastImport = source.statements.filter(ts.isImportDeclaration).at(-1);
        assert(lastImport !== undefined, 'the file has an import');
        edits.push({
            start: lastImport.end,
            end: lastImport.end,
            text: `\nconst { fromV1Mock } = await vi.hoisted(() => import('${COMPAT_MODULE}'));`,
        });
    }

    findings.sort((a, b) => a.line - b.line || a.column - b.column);
    return { text: applyEdits(text, edits, 0), changes, findings, migrated };
}

interface V1Imports {
    readonly declarations: readonly TS.ImportDeclaration[];
    /** Local name to v1 name. */
    readonly named: ReadonlyMap<string, string>;
    readonly namespaces: ReadonlySet<string>;
}

function readImports(ts: typeof TS, source: TS.SourceFile): V1Imports {
    const declarations: TS.ImportDeclaration[] = [];
    const named = new Map<string, string>();
    const namespaces = new Set<string>();
    for (const statement of source.statements) {
        if (!ts.isImportDeclaration(statement)) continue;
        const specifier = statement.moduleSpecifier;
        if (!ts.isStringLiteral(specifier) || specifier.text !== V1_MODULE) continue;
        const bindings = statement.importClause?.namedBindings;
        if (bindings === undefined) continue;
        declarations.push(statement);
        if (ts.isNamespaceImport(bindings)) {
            namespaces.add(bindings.name.text);
            continue;
        }
        for (const element of bindings.elements) {
            named.set(element.name.text, (element.propertyName ?? element.name).text);
        }
    }
    return { declarations, named, namespaces };
}

/** The names that the file declares or uses, so that a new import does not hide one. */
function declaredNames(ts: typeof TS, source: TS.SourceFile): Set<string> {
    const names = new Set<string>();
    function visit(node: TS.Node): void {
        if (ts.isIdentifier(node) && isReference(ts, node)) names.add(node.text);
        ts.forEachChild(node, visit);
    }
    visit(source);
    return names;
}

/** `vi.<method>` or `jest.<method>`, or only `<global>.<method>`. */
function isTestCall(
    ts: typeof TS,
    callee: TS.Expression,
    method: string,
    global: string | null = null,
): boolean {
    return (
        ts.isPropertyAccessExpression(callee) &&
        ts.isIdentifier(callee.expression) &&
        (global === null
            ? TEST_GLOBALS.has(callee.expression.text)
            : callee.expression.text === global) &&
        callee.name.text === method
    );
}

/** The objects that a `vi.mock` factory returns: its expression, or its top `return`s. */
function factoryObjects(
    ts: typeof TS,
    factory: TS.ArrowFunction | TS.FunctionExpression,
): TS.ObjectLiteralExpression[] {
    const unwrap = (node: TS.Expression | undefined): TS.ObjectLiteralExpression | null => {
        let current = node;
        for (let depth = 0; depth < CHAIN_DEPTH_MAX && current !== undefined; depth += 1) {
            if (ts.isObjectLiteralExpression(current)) return current;
            if (!ts.isParenthesizedExpression(current)) return null;
            current = current.expression;
        }
        return null;
    };
    const body = factory.body;
    if (!ts.isBlock(body)) {
        const object = unwrap(body);
        return object === null ? [] : [object];
    }
    const objects: TS.ObjectLiteralExpression[] = [];
    for (const statement of body.statements) {
        if (!ts.isReturnStatement(statement)) continue;
        const object = unwrap(statement.expression);
        if (object !== null) objects.push(object);
    }
    return objects;
}

/** The arguments of `fromV1Mock` after the implementation: the input keys of the v1 arguments. */
function fromV1MockArgs(mapping: CallMapping): string {
    const keys = mapping.parameters.map((_parameter, index) => inputKey(mapping, index));
    while (keys.at(-1) === null) keys.pop();
    const list = `[${keys.map((key) => (key === null ? 'null' : quote(key))).join(', ')}]`;
    const pickKey = mapping.pick?.kind === 'arg' ? inputKey(mapping, mapping.pick.index) : null;
    return [
        list,
        ...(mapping.result === 'page' || pickKey !== null ? [`'${mapping.result}'`] : []),
        ...(pickKey === null ? [] : [quote(pickKey)]),
    ].join(', ');
}

/** The input key of a v1 argument: the inverse of the input template. `...` is a spread. */
function inputKey(mapping: CallMapping, index: number): string | null {
    if (mapping.input.kind !== 'object') return null;
    for (const entry of mapping.input.entries) {
        if (entry.kind === 'spread' && entry.index === index) return '...';
        if (
            entry.kind === 'property' &&
            entry.value.kind === 'arg' &&
            entry.value.index === index
        ) {
            return entry.key;
        }
    }
    return null;
}

/** `false` for the name of a property or a member, such as `name` in `a.name` or `{ name: 1 }`. */
function isReference(ts: typeof TS, node: TS.Identifier): boolean {
    const parent = node.parent;
    if (ts.isPropertyAccessExpression(parent)) return parent.expression === node;
    if (ts.isQualifiedName(parent)) return parent.left === node;
    if (
        ts.isPropertyAssignment(parent) ||
        ts.isPropertyDeclaration(parent) ||
        ts.isPropertySignature(parent) ||
        ts.isMethodDeclaration(parent) ||
        ts.isMethodSignature(parent) ||
        ts.isGetAccessorDeclaration(parent) ||
        ts.isSetAccessorDeclaration(parent) ||
        ts.isEnumMember(parent)
    ) {
        return parent.name !== node;
    }
    if (ts.isImportSpecifier(parent) || ts.isExportSpecifier(parent)) return false;
    return true;
}

/** The callee of a mapped call, or a mapped type name. `visit` counts these at the parent. */
function isCountedAtParent(
    ts: typeof TS,
    node: TS.Identifier,
    imported: string,
    tables: MigrateTables,
): boolean {
    const parent = node.parent;
    if (ts.isCallExpression(parent) && parent.expression === node) return imported in tables.calls;
    if (ts.isTypeReferenceNode(parent) && parent.typeName === node) {
        return imported in tables.types;
    }
    return false;
}

function isV1Name(tables: MigrateTables, name: string): boolean {
    return (
        name in tables.calls ||
        name in tables.types ||
        name in tables.compat ||
        name in tables.unmapped
    );
}

/** The hint for a use that the tool did not change. */
function hint(tables: MigrateTables, name: string): string {
    const type = tables.types[name];
    if (type !== undefined) return `v2 has no classes: use an object of the type ${type}`;
    const mapping = tables.calls[name];
    if (mapping !== undefined) {
        return `a use that is not a call: use ${mapping.namespace}.${mapping.operation}`;
    }
    return tables.unmapped[name] ?? 'v2 has no replacement';
}

interface RenderedCall {
    readonly input: string;
    readonly pick: string | null;
    readonly pickParameter: string;
}

/** The v2 input of a v1 call, or the reason that the tool cannot make it. */
function renderCall(
    ts: typeof TS,
    args: readonly TS.Expression[],
    mapping: CallMapping,
    textOf: (node: TS.Node) => string,
    expectation = false,
): RenderedCall | string {
    // A check does not know the `version` that v2 reads from the data, so it checks the rest.
    const isMember = (entry: ObjectEntry) =>
        entry.kind === 'property' && entry.value.kind === 'member';
    const entriesOf = mapping.input.kind === 'object' ? mapping.input.entries : [];
    const loose = expectation && entriesOf.some(isMember);
    const template: Template = loose
        ? { kind: 'object', entries: entriesOf.filter((entry) => !isMember(entry)) }
        : mapping.input;
    if (args.some((arg) => ts.isSpreadElement(arg)))
        return 'a spread argument: change the call by hand';
    if (args.length > mapping.parameters.length)
        return 'more arguments than v1 has: change the call by hand';

    const given: (TS.Expression | null)[] = mapping.parameters.map((_parameter, index) => {
        const arg = args[index];
        if (arg === undefined || (ts.isIdentifier(arg) && arg.text === 'undefined')) return null;
        return arg;
    });
    for (const [index, parameter] of mapping.parameters.entries()) {
        if (given[index] !== null && parameter.use === 'unsupported') {
            return `v2 has no place for the ${parameter.name} argument: change the call by hand`;
        }
    }
    // An argument that the v2 call uses twice is evaluated twice. Only a simple one can be.
    const counts = new Map<number, number>();
    countArgs(template, counts);
    if (mapping.pick !== null && !expectation) countArgs(mapping.pick, counts);
    for (const [index, count] of counts) {
        const arg = given[index];
        if (count > 1 && arg !== null && arg !== undefined && !isSimple(ts, arg)) {
            const name = mapping.parameters[index]?.name ?? String(index);
            return `the v2 call uses the ${name} argument twice: put it in a variable first`;
        }
    }

    const value = (index: number): Value | null => {
        const arg = given[index];
        if (arg !== null && arg !== undefined) return { text: textOf(arg), node: arg };
        const initializer = mapping.parameters[index]?.initializer ?? null;
        return initializer === null ? null : { text: initializer, node: null };
    };
    // An input that is only a spread of one argument is that argument: `zones.index(query)`.
    const [only] = template.kind === 'object' ? template.entries : [];
    const whole =
        template.kind === 'object' && template.entries.length === 1 && only?.kind === 'spread'
            ? value(only.index)
            : null;
    // A matcher such as `expect.objectContaining(...)` is one value. It cannot be spread.
    const spreads = template.kind === 'object' ? template.entries : [];
    if (expectation && whole === null) {
        for (const entry of spreads) {
            const node = entry.kind === 'spread' ? given[entry.index] : null;
            if (node !== null && node !== undefined && ts.isCallExpression(node)) {
                return 'a matcher in the arguments: change the expectation by hand';
            }
        }
    }
    const input =
        whole !== null && whole.node !== null && !ts.isObjectLiteralExpression(whole.node)
            ? whole.text
            : (renderTemplate(ts, template, value, textOf) ?? '{}');
    const pick = mapping.pick === null ? null : renderTemplate(ts, mapping.pick, value, textOf);
    const pickText = pick ?? '';
    const pickParameter =
        ['data', 'value', 'response'].find((name) => !new RegExp(`\\b${name}\\b`).test(pickText)) ??
        'v2Data';
    if (loose) return { input: `expect.objectContaining(${input})`, pick, pickParameter };
    return { input, pick, pickParameter };
}

interface Value {
    readonly text: string;
    /** The argument, or `null` for a default value. */
    readonly node: TS.Expression | null;
}

/** The source text of a template, or `null` when it needs an argument that the call does not give. */
function renderTemplate(
    ts: typeof TS,
    template: Template,
    value: (index: number) => Value | null,
    textOf: (node: TS.Node) => string,
): string | null {
    switch (template.kind) {
        case 'arg':
            return value(template.index)?.text ?? null;
        case 'member': {
            const given = value(template.index);
            if (given === null) return null;
            const base =
                given.node === null || isSimple(ts, given.node) ? given.text : `(${given.text})`;
            return `${base}.${template.key}`;
        }
        case 'literal':
            return typeof template.value === 'string'
                ? quote(template.value)
                : String(template.value);
        case 'concat': {
            // A literal argument becomes text: `${'Display'}_${1}` is 'Display_1'.
            const parts: ({ text: string } | { code: string })[] = [];
            for (const part of template.parts) {
                const given = typeof part === 'string' ? null : value(part);
                if (typeof part === 'string') parts.push({ text: part });
                else if (given === null) return null;
                else parts.push(literalText(ts, given) ?? { code: given.text });
            }
            if (parts.every((part) => 'text' in part)) {
                return quote(parts.map((part) => ('text' in part ? part.text : '')).join(''));
            }
            const body = parts.map((part) =>
                'text' in part
                    ? part.text.replace(/[`\\]|\$\{/g, (match) => `\\${match}`)
                    : `\${${part.code}}`,
            );
            return `\`${body.join('')}\``;
        }
        case 'array': {
            const items = template.items.map((item) => renderTemplate(ts, item, value, textOf));
            return `[${items.filter((item) => item !== null).join(', ')}]`;
        }
        case 'object': {
            const parts: string[] = [];
            for (const entry of template.entries) {
                if (entry.kind === 'spread') {
                    const given = value(entry.index);
                    if (given === null) continue;
                    // An object literal gives its properties, not a spread of a new object.
                    if (given.node !== null && ts.isObjectLiteralExpression(given.node)) {
                        parts.push(...given.node.properties.map((property) => textOf(property)));
                    } else if (given.node !== null || given.text !== '{}') {
                        parts.push(`...${given.text}`);
                    }
                    continue;
                }
                const rendered = renderTemplate(ts, entry.value, value, textOf);
                if (rendered === null) continue;
                const key = /^[A-Za-z_$][\w$]*$/.test(entry.key) ? entry.key : quote(entry.key);
                parts.push(rendered === key ? key : `${key}: ${rendered}`);
            }
            return parts.length === 0 ? '{}' : `{ ${parts.join(', ')} }`;
        }
    }
}

function countArgs(template: Template, counts: Map<number, number>): void {
    const add = (index: number) => counts.set(index, (counts.get(index) ?? 0) + 1);
    switch (template.kind) {
        case 'arg':
        case 'member':
            add(template.index);
            return;
        case 'literal':
            return;
        case 'concat':
            for (const part of template.parts) if (typeof part === 'number') add(part);
            return;
        case 'array':
            for (const item of template.items) countArgs(item, counts);
            return;
        case 'object':
            for (const entry of template.entries) {
                if (entry.kind === 'spread') add(entry.index);
                else countArgs(entry.value, counts);
            }
    }
}

/** A name, a property path or a literal. It has no side effects, so it can be evaluated twice. */
function isSimple(ts: typeof TS, node: TS.Expression): boolean {
    if (ts.isIdentifier(node) || node.kind === ts.SyntaxKind.ThisKeyword) return true;
    if (
        ts.isStringLiteral(node) ||
        ts.isNumericLiteral(node) ||
        ts.isNoSubstitutionTemplateLiteral(node)
    ) {
        return true;
    }
    if (ts.isPropertyAccessExpression(node)) return isSimple(ts, node.expression);
    if (ts.isParenthesizedExpression(node)) return isSimple(ts, node.expression);
    return false;
}

/** The text of a string or number literal, or `null` for other code. */
function literalText(ts: typeof TS, given: Value): { text: string } | null {
    const node = given.node;
    if (node === null) return /^-?\d+$/.test(given.text) ? { text: given.text } : null;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
        return { text: node.text };
    if (ts.isNumericLiteral(node)) return { text: node.text };
    return null;
}

function quote(text: string): string {
    return `'${text.replace(/[\\']/g, (match) => `\\${match}`).replace(/\n/g, '\\n')}'`;
}

/**
 * The edits of the v1 imports. A specifier stays when the file still has a use of it that the tool
 * did not change. Then the compiler shows that use. The new specifiers go in the first import that
 * stays, or in a new import.
 */
function importEdits(
    ts: typeof TS,
    source: TS.SourceFile,
    declarations: readonly TS.ImportDeclaration[],
    uses: ReadonlyMap<string, { total: number; changed: number }>,
    tables: MigrateTables,
    added: readonly string[],
    moved: ReadonlySet<string>,
): { edits: Edit[]; pending: string[]; removed: ReadonlySet<TS.ImportDeclaration> } {
    const edits: Edit[] = [];
    const removed = new Set<TS.ImportDeclaration>();
    let pending = [...added];
    for (const declaration of declarations) {
        const clause = declaration.importClause;
        const bindings = clause?.namedBindings;
        if (clause === undefined || bindings === undefined || !ts.isNamedImports(bindings))
            continue;
        const kept: string[] = [];
        for (const element of bindings.elements) {
            const imported = (element.propertyName ?? element.name).text;
            const count = uses.get(element.name.text) ?? { total: 0, changed: 0 };
            const known = imported in tables.calls || imported in tables.types;
            const done =
                moved.has(element.name.text) ||
                (count.total === count.changed && (count.total > 0 || known));
            if (!done) kept.push(element.getText(source));
        }
        const merge = !clause.isTypeOnly && pending.length > 0;
        const specifiers = merge ? [...kept, ...pending].sort(compareSpecifiers) : kept;
        if (merge) pending = [];
        if (specifiers.length === bindings.elements.length && !merge) continue;
        const start = declaration.getStart(source);
        if (specifiers.length === 0) {
            // Remove the line, with its line break.
            const end =
                source.text[declaration.end] === '\n' ? declaration.end + 1 : declaration.end;
            edits.push({ start, end, text: '' });
            removed.add(declaration);
            continue;
        }
        const typeOnly = clause.isTypeOnly ? 'type ' : '';
        const from = declaration.moduleSpecifier.getText(source);
        edits.push({
            start,
            end: declaration.end,
            text: `import ${typeOnly}{ ${specifiers.join(', ')} } from ${from};`,
        });
    }
    return { edits, pending, removed };
}

/** Sorts import specifiers by name, without the `type` keyword. */
function compareSpecifiers(a: string, b: string): number {
    const key = (text: string) => text.replace(/^type /, '').toLowerCase();
    return key(a).localeCompare(key(b));
}

/**
 * Applies edits that do not overlap to a text that starts at `offset` of the file. An insert at the
 * start of a replaced range goes before the new text.
 */
function applyEdits(text: string, edits: readonly Edit[], offset: number): string {
    const sorted = [...edits].sort((a, b) => b.start - a.start || b.end - a.end);
    let out = text;
    let limit = Number.POSITIVE_INFINITY;
    for (const edit of sorted) {
        assert(edit.end <= limit, 'the edits do not overlap');
        out = out.slice(0, edit.start - offset) + edit.text + out.slice(edit.end - offset);
        limit = edit.start;
    }
    return out;
}
