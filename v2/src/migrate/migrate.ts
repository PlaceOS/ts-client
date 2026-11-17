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
 * - The tool does not change other uses of v1. Each one is a finding, with a hint.
 *
 * The tool only parses the file. It does not type check it. After the migration, the compiler
 * shows the differences of the data, such as a field that can now be `null`.
 *
 * @module
 */
import type * as TS from 'typescript-5';
import { assert } from '../core/assert.ts';
import type { CallMap, CallMapping, Template } from './map.ts';

export const V1_MODULE = '@placeos/ts-client';
export const COMPAT_MODULE = '@placeos/ts-client/compat';
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
        const rendered = renderCall(ts, call, mapping, textOf);
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

    function visit(node: TS.Node): void {
        // The children first, so that a call in an argument is changed before the outer call.
        ts.forEachChild(node, visit);

        if (ts.isCallExpression(node)) {
            const callee = node.expression;
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
            const v2Name = tables.types[typeName.right.text];
            if (
                ts.isIdentifier(left) &&
                imports.namespaces.has(left.text) &&
                v2Name !== undefined
            ) {
                replace(typeName.right, v2Name);
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
            if (name in tables.compat) find(node, name, `import it from ${COMPAT_MODULE}`);
            else if (name in tables.calls || name in tables.unmapped || name in tables.types) {
                find(node, name, hint(tables, name));
            }
            return;
        }

        // A test double names the function in a string: `vi.spyOn(ts_client, 'showZone')`.
        if (ts.isStringLiteral(node) && imports.namespaces.size > 0 && node.text in tables.calls) {
            const mapping = tables.calls[node.text];
            const target =
                mapping === undefined ? '' : ` (${mapping.namespace}.${mapping.operation})`;
            find(node, node.text, `a test double of v1: make it for the v2 call${target}`);
        }
    }
    visit(source);

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
    call: TS.CallExpression,
    mapping: CallMapping,
    textOf: (node: TS.Node) => string,
): RenderedCall | string {
    const args = call.arguments;
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
    countArgs(mapping.input, counts);
    if (mapping.pick !== null) countArgs(mapping.pick, counts);
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
    const [only] = mapping.input.kind === 'object' ? mapping.input.entries : [];
    const whole =
        mapping.input.kind === 'object' &&
        mapping.input.entries.length === 1 &&
        only?.kind === 'spread'
            ? value(only.index)
            : null;
    const input =
        whole !== null && whole.node !== null && !ts.isObjectLiteralExpression(whole.node)
            ? whole.text
            : (renderTemplate(ts, mapping.input, value, textOf) ?? '{}');
    const pick = mapping.pick === null ? null : renderTemplate(ts, mapping.pick, value, textOf);
    const pickText = pick ?? '';
    const pickParameter =
        ['data', 'value', 'response'].find((name) => !new RegExp(`\\b${name}\\b`).test(pickText)) ??
        'v2Data';
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
