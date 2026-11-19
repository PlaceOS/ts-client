/**
 * Rewrites the 6.x calls of one source file to 7.x. `cli.ts` reads and writes the files.
 *
 * ```ts
 * import * as ts from 'typescript';
 * const result = migrateSource(ts, 'zone.ts', text, V1_TABLES);
 * ```
 *
 * - A call of a mapped 6.x function becomes the 7.x operation with `.then(orThrow)`, so the code
 *   still gets the data, and an error still rejects the promise.
 * - A type reference to a 6.x class becomes the 7.x type, such as `PlaceZone` to `Zone`.
 * - A test double of a 6.x function, such as `vi.mocked(showZone)` or the functions of a `vi.mock`
 *   factory, becomes the test double of the 7.x operation. `mockReply` and `fromV1Mock` make 7.x
 *   results of the 6.x values.
 * - The tool does not change other uses of 6.x. Each one is a finding, with a hint.
 *
 * The tool only parses the file. It does not type check it. After the migration, the compiler
 * shows the differences of the data, such as a field that can now be `null`.
 *
 * @module
 */
import type * as TS from 'typescript-5';
import { assert } from '../core/assert.ts';
import type { CallMap, CallMapping, ObjectEntry, Template, TypeMapping } from './map.ts';

export const V1_MODULE = '@placeos/ts-client';
export const COMPAT_MODULE = '@placeos/ts-client/compat';
export const STAFF_MODULE = '@placeos/ts-client/staff';
/** The objects of the test frameworks: `vi` of Vitest and `jest` of Jest. */
const TEST_GLOBALS: ReadonlySet<string> = new Set(['vi', 'jest']);
/** The mock methods that set the value of a promise. The value becomes a 7.x result. */
const RESOLVED_VALUE_METHODS: ReadonlySet<string> = new Set([
    'mockResolvedValue',
    'mockResolvedValueOnce',
]);
/** The checks of the arguments. The arguments become the 7.x input. */
const CALLED_WITH_METHODS: ReadonlySet<string> = new Set([
    'toHaveBeenCalledWith',
    'toHaveBeenCalledOnceWith',
    'toHaveBeenCalledExactlyOnceWith',
    'toHaveBeenLastCalledWith',
    'toBeCalledWith',
    'lastCalledWith',
]);
/**
 * The mock methods that take a 6.x implementation or value, and the method for the 7.x one. A
 * value becomes an implementation, and so does a resolved value of a 6.x function that selects a
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
/**
 * The tool walks the syntax tree with recursion. A deeper file, such as one long chain of `+`, is
 * left as it is, with a finding. Hand-written code is far less deep.
 */
const AST_DEPTH_MAX = 1_000;
/** A name that collides gets a suffix. A file has fewer names with the same base. */
const ALIASES_MAX = 100;

export interface MigrateTables {
    readonly calls: CallMap;
    readonly types: Readonly<Record<string, TypeMapping>>;
    /** The 6.x names that `@placeos/ts-client/compat` has. Their imports move there. */
    readonly compat: Readonly<Record<string, 'type' | 'value'>>;
    readonly unmapped: Readonly<Record<string, string>>;
}

/** A use of 6.x that the tool did not change. */
export interface Finding {
    /** 1-based. */
    readonly line: number;
    /** 1-based. */
    readonly column: number;
    /** The 6.x name. */
    readonly name: string;
    readonly message: string;
}

export interface MigrateResult {
    readonly text: string;
    /** The number of calls and type references that the tool changed. */
    readonly changes: number;
    readonly findings: readonly Finding[];
    /** The 6.x functions of the changed calls. The report shows their notes. */
    readonly migrated: ReadonlySet<string>;
}

interface Edit {
    readonly start: number;
    readonly end: number;
    readonly text: string;
}

/** Rewrites the 6.x calls of one file. The text is the same when the file does not import 6.x. */
export function migrateSource(
    ts: typeof TS,
    file_name: string,
    text: string,
    tables: MigrateTables,
): MigrateResult {
    const kind = /\.[cm]?tsx$/.test(file_name) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const source = ts.createSourceFile(file_name, text, ts.ScriptTarget.Latest, true, kind);

    const imports = readImports(ts, source);
    if (imports.declarations.length === 0) {
        return { text, changes: 0, findings: [], migrated: new Set() };
    }
    // A 6.x class that the file uses only as a type loses its import, so a 7.x type can take its
    // name, such as `Survey` for the 6.x `Survey`.
    const typeOnly = (name: string) => {
        const imported = imports.named.get(name);
        return imported !== undefined && imported in tables.types;
    };
    const names = declaredNames(ts, source, typeOnly);
    if (names === null) return tooDeep(text);
    // A closure does not keep the narrowing of `names`, so this name has the narrow type.
    const taken: Set<string> = names;
    const edits: Edit[] = [];
    const findings: Finding[] = [];
    const migrated = new Set<string>();
    /** The uses of each local name of a named import, and how many the tool changed. */
    const uses = new Map<string, { total: number; changed: number }>();
    /** The 7.x namespaces that the new imports give, by module and name, with the local name. */
    const namespace_names = new Map<
        string,
        { module: 'staff' | null; name: string; local: string }
    >();
    /** The 7.x types that the new imports give, by local name. */
    const type_names = new Map<string, { module: 'staff' | null; name: string }>();
    const compat_names = new Set<string>();
    /** The local names of the 6.x imports that move to the compat module. */
    const moved = new Set<string>();
    for (const [local, imported] of imports.named) {
        const kind = tables.compat[imported];
        if (kind === undefined) continue;
        moved.add(local);
        const name = local === imported ? imported : `${imported} as ${local}`;
        compat_names.add(kind === 'type' ? `type ${name}` : name);
    }
    let changes = 0;
    let deep = false;

    // The helpers that a file already imports from the compat module, by name.
    const compat_imported = new Map<string, string>();
    for (const statement of source.statements) {
        if (!ts.isImportDeclaration(statement)) continue;
        const specifier = statement.moduleSpecifier;
        if (!ts.isStringLiteral(specifier) || specifier.text !== COMPAT_MODULE) continue;
        // A type-only import has no value, so it cannot be a helper at run time.
        if (statement.importClause?.isTypeOnly === true) continue;
        const bindings = statement.importClause?.namedBindings;
        if (bindings === undefined || !ts.isNamedImports(bindings)) continue;
        for (const element of bindings.elements) {
            if (element.isTypeOnly) continue;
            compat_imported.set((element.propertyName ?? element.name).text, element.name.text);
        }
    }
    const helper_locals = new Map<string, string>();

    /**
     * The local name of a compat helper, such as `orThrow`: the name of an import that the file
     * has, or a new name that the file does not use. `register` adds it to the new compat import.
     */
    function helperLocal(
        name: string,
        options: { readonly register: boolean } = { register: true },
    ): string {
        const imported = compat_imported.get(name);
        if (imported !== undefined) return imported;
        let local = helper_locals.get(name);
        if (local === undefined) {
            local = localName(name);
            helper_locals.set(name, local);
        }
        if (options.register) compat_names.add(local === name ? name : `${name} as ${local}`);
        return local;
    }

    /** The name of `vi.hoisted` for `fromV1Mock`, when the file also imports `fromV1Mock`. */
    let hoisted_local: string | null = null;

    /**
     * The local name of `fromV1Mock`. A `vi.mock` factory runs before the imports, so it uses the
     * name of `vi.hoisted`. That name is not the name of an import that the file has.
     */
    function fromV1MockLocal(options: { readonly in_factory: boolean }): string {
        if (options.in_factory && compat_imported.has('fromV1Mock')) {
            hoisted_local ??= localName('fromV1Mock');
            return hoisted_local;
        }
        return helperLocal('fromV1Mock', { register: false });
    }

    function find(node: TS.Node, name: string, message: string): void {
        const at = source.getLineAndCharacterOfPosition(node.getStart(source));
        findings.push({ line: at.line + 1, column: at.character + 1, name, message });
    }

    /**
     * A local name for a new import: the name, or the name with a suffix if the file has it. The
     * suffix keeps the style of the name: `zones_v7` for a namespace, `orThrowV7` for a function
     * and `SignagePluginV7` for a type.
     */
    function localName(name: string): string {
        if (!taken.has(name)) {
            taken.add(name);
            return name;
        }
        const snake_case = /^[a-z][a-z0-9_]*$/.test(name);
        for (let index = 1; index <= ALIASES_MAX; index += 1) {
            const count = index === 1 ? '' : snake_case ? `_${index}` : String(index);
            const alias = snake_case ? `${name}_v7${count}` : `${name}V7${count}`;
            if (taken.has(alias)) continue;
            taken.add(alias);
            return alias;
        }
        assert(false, `a free local name for ${name}`);
    }

    function namespaceLocal(namespace: string, module: 'staff' | null = null): string {
        const key = `${module ?? ''}|${namespace}`;
        const known = namespace_names.get(key);
        if (known !== undefined) return known.local;
        // A staff namespace, such as `assets`, can have the name of a REST API namespace.
        const staff_name = `staff${namespace.charAt(0).toUpperCase()}${namespace.slice(1)}`;
        const local =
            module === 'staff' && taken.has(namespace) && !taken.has(staff_name)
                ? localName(staff_name)
                : localName(namespace);
        namespace_names.set(key, { module, name: namespace, local });
        return local;
    }

    /** The 7.x namespace of a mapping. A namespace import of 6.x has the REST API namespaces only. */
    function namespaceOf(mapping: CallMapping, prefix: string | null): string {
        if (prefix === null || mapping.module === 'staff') {
            return namespaceLocal(mapping.namespace, mapping.module ?? null);
        }
        return `${prefix}.${mapping.namespace}`;
    }

    /** The local name of a compat export that a namespace import used, such as `PlaceDriverRole`. */
    const compat_locals = new Map<string, string>();
    function compatLocal(name: string): string {
        const known = compat_locals.get(name);
        if (known !== undefined) return known;
        const local = localName(name);
        compat_locals.set(name, local);
        const specifier = local === name ? name : `${name} as ${local}`;
        compat_names.add(tables.compat[name] === 'type' ? `type ${specifier}` : specifier);
        return local;
    }

    function typeLocal(type: TypeMapping): string {
        const module = type.module ?? null;
        for (const [local, known] of type_names) {
            if (known.name === type.name && known.module === module) return local;
        }
        const local = localName(type.name);
        type_names.set(local, { module, name: type.name });
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
        const namespace = namespaceOf(mapping, prefix);
        const helper = helperLocal(mapping.result === 'page' ? 'orThrowPage' : 'orThrow');
        const pick =
            rendered.pick === null
                ? ''
                : `.then((${rendered.pick_parameter}) => ${rendered.pick_parameter}[${rendered.pick}])`;
        replace(
            call,
            `${namespace}.${mapping.operation}(${rendered.input}).then(${helper})${pick}`,
        );
        migrated.add(name);
        changes += 1;
        return true;
    }

    /** The test doubles that the tool changed, by the call that holds the 7.x function. */
    const doubles = new Map<TS.Node, { name: string; mapping: CallMapping }>();
    /** A spec file. There a reference to a 6.x function that is not a call is a test double. */
    const test_file = /\.(spec|test)\.[cm]?[jt]sx?$/.test(file_name);
    /** `true` when a call on a test double uses `fromV1Mock`, out of a `vi.mock` factory. */
    let imports_from_v1_mock = false;

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
        const namespace = namespaceOf(mapping, prefix);
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
            const helper = helperLocal(mapping.result === 'page' ? 'mockPage' : 'mockReply');
            replace(value, `${helper}(${textOf(value)})`);
            return;
        }
        // A 6.x implementation or value: `fromV1Mock` gives it the 6.x arguments, and makes a 7.x
        // result of its value. A value becomes an implementation that gives it.
        const implementation = VALUE_TO_IMPLEMENTATION[method];
        if (
            value !== undefined &&
            ts.isPropertyAccessExpression(callee) &&
            implementation !== undefined
        ) {
            if (!invertible(mapping)) {
                find(call, name, NOT_INVERTIBLE);
                return;
            }
            const v1 = method.startsWith('mockImplementation')
                ? textOf(value)
                : `() => (${textOf(value)})`;
            imports_from_v1_mock = true;
            const from_v1_mock = fromV1MockLocal({ in_factory: false });
            replace(
                call,
                `${textOf(callee.expression)}.${implementation}(${from_v1_mock}(${v1}, ${fromV1MockArgs(mapping)}))`,
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
    let uses_from_v1_mock = false;

    /**
     * Changes the 6.x functions of a `vi.mock` factory to 7.x namespaces. `fromV1Mock` keeps the
     * 6.x implementation: `showZone: vi.fn(impl)` becomes `zones: { show: vi.fn(fromV1Mock(impl,
     * ...)) }`. A Jest factory cannot import the compat module, so it is a finding.
     */
    function rewriteFactory(
        call: TS.CallExpression,
        factory: TS.ArrowFunction | TS.FunctionExpression,
        vitest: boolean,
    ): void {
        const objects = factoryObjects(ts, factory);
        for (const object of objects) {
            for (const property of object.properties) {
                const name = property.name;
                if (name === undefined || !(ts.isIdentifier(name) || ts.isStringLiteral(name)))
                    continue;
                const mapping = tables.calls[name.text];
                if (mapping === undefined) continue;
                if (mapping.module !== 'staff') {
                    if (!invertible(mapping)) {
                        find(property, name.text, NOT_INVERTIBLE);
                    } else if (mappingOf(property) === null) {
                        // A method or an accessor stays 6.x, and the code calls the 7.x name.
                        find(property, name.text, `a method of a mock factory: ${FACTORY_VALUE}`);
                    }
                    continue;
                }
                find(
                    property,
                    name.text,
                    `mock ${STAFF_MODULE} for ${mapping.namespace}.${mapping.operation}`,
                );
            }
        }
        const mapped = objects.some((object) =>
            object.properties.some((property) => mappingOf(property) !== null),
        );
        if (!mapped) return;
        if (!vitest) {
            find(
                call,
                V1_MODULE,
                'a mock factory with 6.x names: give the 7.x namespaces, such as zones: { show: jest.fn() }',
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
        const mapping = tables.calls[name.text] ?? null;
        // The staff functions are in another module, which this factory does not mock. A function
        // with an argument in a template cannot get its 6.x arguments. `rewriteFactory` finds both.
        if (mapping === null || mapping.module === 'staff' || !invertible(mapping)) return null;
        return mapping;
    }

    function rewriteFactoryObject(object: TS.ObjectLiteralExpression): void {
        // The new namespace replaces the namespace of a spread, so it needs `...spread.zones`. The
        // tool cannot repeat an expression, such as `...(await importOriginal())`.
        const unnamed = object.properties.find(
            (property) => ts.isSpreadAssignment(property) && !ts.isIdentifier(property.expression),
        );
        if (unnamed !== undefined && object.properties.some((p) => mappingOf(p) !== null)) {
            find(unnamed, V1_MODULE, UNNAMED_SPREAD);
            return;
        }
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
        uses_from_v1_mock = true;
        for (const [namespace, entries] of groups) {
            const base = spread === null ? '' : `...${spread}.${namespace}, `;
            kept.push(`${namespace}: { ${base}${entries.join(', ')} }`);
        }
        replace(object, `{ ${kept.join(', ')} }`);
    }

    /** The 7.x value of one 6.x function of a factory. `null` is a shorthand property. */
    function mockValue(value: TS.Expression | null, name: string, mapping: CallMapping): string {
        const extra = fromV1MockArgs(mapping);
        const from_v1_mock = fromV1MockLocal({ in_factory: true });
        if (
            value !== null &&
            ts.isCallExpression(value) &&
            isTestCall(ts, value.expression, 'fn')
        ) {
            const [implementation] = value.arguments;
            const text = implementation === undefined ? 'undefined' : textOf(implementation);
            return `${textOf(value.expression)}(${from_v1_mock}(${text}, ${extra}))`;
        }
        // Another value, such as `vi.fn().mockResolvedValue(zone)` or a hoisted mock, is the 6.x
        // implementation of a new mock, so the 7.x function is still a mock that tests can change.
        return `vi.fn(${from_v1_mock}(${value === null ? name : textOf(value)}, ${extra}))`;
    }

    /**
     * A finding for a test double in a variable, such as `const spy = vi.mocked(showZone)`. The
     * tool changes only the calls in the chain of the double, not the calls on the variable.
     */
    function findStoredDouble(wrapper: TS.CallExpression, name: string): void {
        let node: TS.Node = wrapper;
        for (let depth = 0; depth < CHAIN_DEPTH_MAX && isWrapping(ts, node.parent); depth += 1) {
            node = node.parent;
        }
        const parent = node.parent;
        const stored =
            (ts.isVariableDeclaration(parent) && parent.initializer === node) ||
            (ts.isBinaryExpression(parent) &&
                parent.right === node &&
                parent.operatorToken.kind === ts.SyntaxKind.EqualsToken);
        if (stored) find(node, name, STORED_DOUBLE);
    }

    /** `vi.mocked(f)`, `jest.mocked(f)` or `expect(f)`, with `f` as the first argument. */
    function doubleWrapper(node: TS.Expression): TS.CallExpression | null {
        const parent = node.parent;
        if (!ts.isCallExpression(parent) || parent.arguments[0] !== node) return null;
        const callee = parent.expression;
        if (ts.isIdentifier(callee) && callee.text === 'expect') return parent;
        const is_mocked =
            ts.isPropertyAccessExpression(callee) &&
            ts.isIdentifier(callee.expression) &&
            TEST_GLOBALS.has(callee.expression.text) &&
            callee.name.text === 'mocked';
        return is_mocked ? parent : null;
    }

    function visit(node: TS.Node, depth: number): void {
        if (depth > AST_DEPTH_MAX) {
            deep = true;
            return;
        }
        // The children first, so that a call in an argument is changed before the outer call.
        ts.forEachChild(node, (child) => visit(child, depth + 1));

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
                    if (mapping?.module === 'staff') {
                        find(
                            node,
                            method.text,
                            `spy on ${STAFF_MODULE} for ${mapping.namespace}.${mapping.operation}`,
                        );
                    } else if (mapping !== undefined && !invertible(mapping)) {
                        find(node, method.text, NOT_INVERTIBLE);
                    } else if (mapping !== undefined) {
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
                        'an automock gives undefined from 7.x calls, so .then(orThrow) fails: ' +
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
            } else if (
                ts.isPropertyAccessExpression(callee) &&
                ts.isIdentifier(callee.expression) &&
                imports.namespaces.has(callee.expression.text) &&
                (callee.name.text in tables.unmapped || callee.name.text in tables.types)
            ) {
                // The same finding as for a call of a named import, such as `authority()`.
                find(callee, callee.name.text, hint(tables, callee.name.text));
            }
            return;
        }

        if (ts.isTypeReferenceNode(node)) {
            const type_name = node.typeName;
            if (ts.isIdentifier(type_name)) {
                const imported = imports.named.get(type_name.text);
                if (imported === undefined || moved.has(type_name.text)) return;
                const v2_name = tables.types[imported];
                if (v2_name !== undefined) {
                    replace(type_name, typeLocal(v2_name));
                    countUse(type_name.text, true);
                    changes += 1;
                }
                return;
            }
            const left = type_name.left;
            const right = type_name.right.text;
            const type = tables.types[right];
            if (!ts.isIdentifier(left) || !imports.namespaces.has(left.text)) return;
            if (type !== undefined && type.module === undefined) {
                replace(type_name.right, type.name);
                changes += 1;
            } else if (type !== undefined) {
                // A staff type is not in the namespace of 6.x. It gets its own import.
                replace(type_name, typeLocal(type));
                changes += 1;
            } else if (right in tables.compat) {
                replace(type_name, compatLocal(right));
                changes += 1;
            }
            return;
        }

        if (ts.isIdentifier(node) && isReference(ts, node)) {
            const imported = imports.named.get(node.text);
            // A mapped callee or type name is counted at its parent.
            if (imported === undefined || moved.has(node.text)) return;
            // 6.x and 7.x have the same module name. A name that 6.x does not export is from 7.x.
            if (!isV1Name(tables, imported)) return;
            if (isCountedAtParent(ts, node, imported, tables)) return;
            const wrapper = doubleWrapper(node);
            const double_mapping = tables.calls[imported];
            const is_double =
                wrapper !== null || (test_file && !ts.isShorthandPropertyAssignment(node.parent));
            // A test double of a function whose 6.x arguments the tool cannot rebuild stays 6.x.
            if (is_double && double_mapping !== undefined && !invertible(double_mapping)) {
                countUse(node.text, false);
                find(node, imported, NOT_INVERTIBLE);
                return;
            }
            if (wrapper !== null && imported in tables.calls) {
                rewriteDouble(node, wrapper, imported, null);
                countUse(node.text, true);
                findStoredDouble(wrapper, imported);
                return;
            }
            if (
                test_file &&
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
            const double_mapping = tables.calls[name];
            if (
                (wrapper !== null || test_file) &&
                double_mapping !== undefined &&
                !invertible(double_mapping)
            ) {
                find(node, name, NOT_INVERTIBLE);
                return;
            }
            if (wrapper !== null && name in tables.calls) {
                rewriteDouble(node, wrapper, name, node.expression.text);
                findStoredDouble(wrapper, name);
                return;
            }
            if (test_file && name in tables.calls) {
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

        // A test can load a file of the 6.x build: `vi.importActual('@placeos/ts-client/dist/index.es.js')`.
        if (ts.isStringLiteral(node) && node.text.startsWith(`${V1_MODULE}/dist/`)) {
            replace(node, `'${V1_MODULE}'`);
            changes += 1;
            return;
        }

        // A test double names the function in a string, such as `jest.spyOn(module, 'showZone')`.
        // The tool changes `vi.spyOn(client, 'showZone')` on a namespace import above.
        if (ts.isStringLiteral(node) && imports.namespaces.size > 0 && node.text in tables.calls) {
            const parent = node.parent;
            const spy_on_namespace =
                ts.isCallExpression(parent) &&
                isTestCall(ts, parent.expression, 'spyOn') &&
                parent.arguments[1] === node;
            if (spy_on_namespace) return;
            const mapping = tables.calls[node.text];
            const target =
                mapping === undefined ? '' : ` (${mapping.namespace}.${mapping.operation})`;
            find(node, node.text, `a test double of 6.x: make it for the 7.x call${target}`);
        }
    }
    visit(source, 0);
    if (deep) return tooDeep(text);

    // The hoisted `fromV1Mock` of a factory is also there for the tests.
    if (imports_from_v1_mock && !uses_from_v1_mock) helperLocal('fromV1Mock');

    // The new imports of the 7.x namespaces and types, and of the helpers.
    const specifiers = (module: 'staff' | null): string[] =>
        [
            ...[...namespace_names.values()]
                .filter((entry) => entry.module === module)
                .map(({ name, local }) => (name === local ? name : `${name} as ${local}`)),
            ...[...type_names]
                .filter(([, entry]) => entry.module === module)
                .map(([local, { name }]) =>
                    name === local ? `type ${name}` : `type ${name} as ${local}`,
                ),
        ].sort(compareSpecifiers);
    const added = specifiers(null);
    const staff_added = specifiers('staff');
    const changed = importEdits(ts, source, imports.declarations, uses, tables, added, moved);
    edits.push(...changed.edits);
    // The new imports go after the last 6.x import, or in its place when the tool removes it.
    const lines: string[] = [];
    if (changed.pending.length > 0) {
        lines.push(`import { ${changed.pending.join(', ')} } from '${V1_MODULE}';`);
    }
    if (staff_added.length > 0) {
        lines.push(`import { ${staff_added.join(', ')} } from '${STAFF_MODULE}';`);
    }
    if (compat_names.size > 0) {
        const names = [...compat_names].sort(compareSpecifiers).join(', ');
        lines.push(`import { ${names} } from '${COMPAT_MODULE}';`);
    }
    if (uses_from_v1_mock) {
        // `vi.mock` runs before the imports, so its factory gets the helper from `vi.hoisted`.
        const local = hoisted_local ?? fromV1MockLocal({ in_factory: true });
        const binding = local === 'fromV1Mock' ? local : `fromV1Mock: ${local}`;
        lines.push(`const { ${binding} } = await vi.hoisted(() => import('${COMPAT_MODULE}'));`);
    }
    const last = imports.declarations.at(-1);
    assert(last !== undefined, 'a 6.x import exists');
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

    findings.sort((a, b) => a.line - b.line || a.column - b.column);
    return { text: applyEdits(text, edits, 0), changes, findings, migrated };
}

interface V1Imports {
    readonly declarations: readonly TS.ImportDeclaration[];
    /** Local name to 6.x name. */
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
/** The result for a file deeper than `AST_DEPTH_MAX`: no change, and a finding. */
function tooDeep(text: string): MigrateResult {
    const message = `the file nests deeper than ${AST_DEPTH_MAX} levels: change it by hand`;
    return {
        text,
        changes: 0,
        findings: [{ line: 1, column: 1, name: V1_MODULE, message }],
        migrated: new Set(),
    };
}

/**
 * The names that the file declares, uses or imports from other modules, so that a new import does
 * not hide one. `null` for a file deeper than `AST_DEPTH_MAX`.
 */
function declaredNames(
    ts: typeof TS,
    source: TS.SourceFile,
    replacedType: (name: string) => boolean,
): Set<string> | null {
    const names = new Set<string>();
    let deep = false;
    function visit(node: TS.Node, depth: number): void {
        if (depth > AST_DEPTH_MAX) {
            deep = true;
            return;
        }
        if (ts.isIdentifier(node) && isReference(ts, node)) {
            const parent = node.parent;
            const type_name = ts.isTypeReferenceNode(parent) && parent.typeName === node;
            if (!type_name || !replacedType(node.text)) names.add(node.text);
        }
        // An import of another module, such as `import { orThrow } from './utils'`, has a name.
        if (ts.isImportDeclaration(node)) {
            const specifier = node.moduleSpecifier;
            const v1 = ts.isStringLiteral(specifier) && specifier.text === V1_MODULE;
            const clause = node.importClause;
            if (!v1 && clause !== undefined) {
                if (clause.name !== undefined) names.add(clause.name.text);
                const bindings = clause.namedBindings;
                if (bindings !== undefined && ts.isNamespaceImport(bindings))
                    names.add(bindings.name.text);
                if (bindings !== undefined && ts.isNamedImports(bindings)) {
                    for (const element of bindings.elements) names.add(element.name.text);
                }
            }
        }
        ts.forEachChild(node, (child) => visit(child, depth + 1));
    }
    visit(source, 0);
    return deep ? null : names;
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

const NOT_INVERTIBLE =
    'the 7.x input has an argument in a template, such as `${module}_${index}`, so a 6.x ' +
    'implementation cannot get it: change the mock by hand';
/** How to write a 6.x function of a factory, so that the tool can change it. */
const FACTORY_VALUE = 'write it as a property, such as showZone: vi.fn(...)';
const UNNAMED_SPREAD =
    'a mock factory spreads a value without a name: put it in a variable first, such as ' +
    'const actual = await importOriginal(), then spread actual';
const STORED_DOUBLE =
    'a test double in a variable: the tool does not change its mock values and checks, so ' +
    'change them by hand (mockReply, the 7.x input)';

/** A node that gives the value of its expression: `(f)`, `f as Mock`, `f!` or `f satisfies T`. */
function isWrapping(ts: typeof TS, node: TS.Node): boolean {
    return (
        ts.isParenthesizedExpression(node) ||
        ts.isAsExpression(node) ||
        ts.isNonNullExpression(node) ||
        ts.isSatisfiesExpression(node) ||
        ts.isTypeAssertionExpression(node)
    );
}

/** `true` when each 6.x argument that the 7.x input has is a key of the input, or its spread. */
function invertible(mapping: CallMapping): boolean {
    const keyed = mapping.parameters.every(
        (parameter, index) => parameter.use !== 'mapped' || inputKey(mapping, index) !== null,
    );
    const pick = mapping.pick;
    return (
        keyed && (pick === null || (pick.kind === 'arg' && inputKey(mapping, pick.index) !== null))
    );
}

/** The arguments of `fromV1Mock` after the implementation: the input keys of the 6.x arguments. */
function fromV1MockArgs(mapping: CallMapping): string {
    const keys = mapping.parameters.map((_parameter, index) => inputKey(mapping, index));
    while (keys.at(-1) === null) keys.pop();
    const list = `[${keys.map((key) => (key === null ? 'null' : quote(key))).join(', ')}]`;
    const pick_key = mapping.pick?.kind === 'arg' ? inputKey(mapping, mapping.pick.index) : null;
    return [
        list,
        ...(mapping.result === 'page' || pick_key !== null ? [`'${mapping.result}'`] : []),
        ...(pick_key === null ? [] : [quote(pick_key)]),
    ].join(', ');
}

/** The input key of a 6.x argument: the inverse of the input template. `...` is a spread. */
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
    if (type !== undefined) return `7.x has no classes: use an object of the type ${type.name}`;
    const mapping = tables.calls[name];
    if (mapping !== undefined) {
        const from = mapping.module === 'staff' ? ` of ${STAFF_MODULE}` : '';
        return `a use that is not a call: use ${mapping.namespace}.${mapping.operation}${from}`;
    }
    return tables.unmapped[name] ?? '7.x has no replacement';
}

interface RenderedCall {
    readonly input: string;
    readonly pick: string | null;
    readonly pick_parameter: string;
}

/** The 7.x input of a 6.x call, or the reason that the tool cannot make it. */
function renderCall(
    ts: typeof TS,
    args: readonly TS.Expression[],
    mapping: CallMapping,
    textOf: (node: TS.Node) => string,
    expectation = false,
): RenderedCall | string {
    // A check does not know the `version` that 7.x reads from the data, so it checks the rest.
    const isMember = (entry: ObjectEntry) =>
        entry.kind === 'property' && entry.value.kind === 'member';
    const entries_of = mapping.input.kind === 'object' ? mapping.input.entries : [];
    const loose = expectation && entries_of.some(isMember);
    const template: Template = loose
        ? { kind: 'object', entries: entries_of.filter((entry) => !isMember(entry)) }
        : mapping.input;
    if (args.some((arg) => ts.isSpreadElement(arg)))
        return 'a spread argument: change the call by hand';
    if (args.length > mapping.parameters.length)
        return 'more arguments than 6.x has: change the call by hand';

    const given: (TS.Expression | null)[] = mapping.parameters.map((_parameter, index) => {
        const arg = args[index];
        if (arg === undefined || (ts.isIdentifier(arg) && arg.text === 'undefined')) return null;
        return arg;
    });
    for (const [index, parameter] of mapping.parameters.entries()) {
        if (given[index] !== null && parameter.use === 'unsupported') {
            return `7.x has no place for the ${parameter.name} argument: change the call by hand`;
        }
    }
    // An argument that the 7.x call uses twice is evaluated twice. Only a simple one can be.
    const counts = new Map<number, number>();
    countArgs(template, counts);
    if (mapping.pick !== null && !expectation) countArgs(mapping.pick, counts);
    for (const [index, count] of counts) {
        const arg = given[index];
        if (count > 1 && arg !== null && arg !== undefined && !isSimple(ts, arg)) {
            const name = mapping.parameters[index]?.name ?? String(index);
            return `the 7.x call uses the ${name} argument twice: put it in a variable first`;
        }
    }

    const value = (index: number): Value | null => {
        const arg = given[index];
        if (arg !== null && arg !== undefined) return { text: textOf(arg), node: arg };
        const initializer = mapping.parameters[index]?.initializer ?? null;
        return initializer === null ? null : { text: initializer, node: null };
    };
    // An input that is only a spread of one argument is that argument: `zones.query(query)`.
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
    const pick_text = pick ?? '';
    const pick_parameter =
        ['data', 'value', 'response'].find(
            (name) => !new RegExp(`\\b${name}\\b`).test(pick_text),
        ) ?? 'v2Data';
    if (loose) return { input: `expect.objectContaining(${input})`, pick, pick_parameter };
    return { input, pick, pick_parameter };
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
            const fallback = template.fallback;
            if (fallback === undefined) return `${base}.${template.key}`;
            const text = typeof fallback === 'string' ? quote(fallback) : String(fallback);
            return `${base}.${template.key} ?? ${text}`;
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
    let current = node;
    for (let depth = 0; depth < AST_DEPTH_MAX; depth += 1) {
        if (ts.isIdentifier(current) || current.kind === ts.SyntaxKind.ThisKeyword) return true;
        if (
            ts.isStringLiteral(current) ||
            ts.isNumericLiteral(current) ||
            ts.isNoSubstitutionTemplateLiteral(current)
        ) {
            return true;
        }
        if (!ts.isPropertyAccessExpression(current) && !ts.isParenthesizedExpression(current)) {
            return false;
        }
        current = current.expression;
    }
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
 * The edits of the 6.x imports. A specifier stays when the file still has a use of it that the tool
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
        const type_only = clause.isTypeOnly ? 'type ' : '';
        const from = declaration.moduleSpecifier.getText(source);
        edits.push({
            start,
            end: declaration.end,
            text: `import ${type_only}{ ${specifiers.join(', ')} } from ${from};`,
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
