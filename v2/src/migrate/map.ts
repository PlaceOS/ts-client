/**
 * The types of the v1 to v2 call map. `scripts/v1-map.ts` writes the map in `v1-map.ts`, and the
 * migration tool reads it.
 *
 * @module
 */

/**
 * The source of a v2 input value, made from the v1 arguments.
 *
 * - `arg`: the v1 argument at this index.
 * - `member`: a property of the v1 argument at this index, such as the `version` of the data.
 * - `literal`: a fixed value.
 * - `concat`: a string of fixed text and arguments, such as `${module}_${index}`.
 * - `object`: an object. A `spread` entry spreads the properties of an argument.
 * - `array`: an array.
 */
export type Template =
    | { readonly kind: 'arg'; readonly index: number }
    | { readonly kind: 'member'; readonly index: number; readonly key: string }
    | { readonly kind: 'literal'; readonly value: string | number | boolean | null }
    | { readonly kind: 'concat'; readonly parts: readonly (string | number)[] }
    | { readonly kind: 'object'; readonly entries: readonly ObjectEntry[] }
    | { readonly kind: 'array'; readonly items: readonly Template[] };

/** A property of an `object` template. A `number` in `concat` parts is an argument index. */
export type ObjectEntry =
    | { readonly kind: 'property'; readonly key: string; readonly value: Template }
    | { readonly kind: 'spread'; readonly index: number };

/** A parameter of a v1 function. */
export interface V1Parameter {
    readonly name: string;
    /** The source text of the default value, or `null`. */
    readonly initializer: string | null;
    /**
     * - `mapped`: the v2 input has this argument.
     * - `ignored`: v2 has no use for it. An example is the `method` of the v1 updates: v2 sends the
     *   update method of the API document. The tool removes it.
     * - `unsupported`: the v2 call has no place for it. The tool does not change a call that gives
     *   it.
     */
    readonly use: 'mapped' | 'ignored' | 'unsupported';
}

/** The v2 call for one v1 function. */
export interface CallMapping {
    /** The namespace export of v2, such as `zones`. */
    readonly namespace: string;
    /** The operation of the namespace, such as `show`. */
    readonly operation: string;
    readonly parameters: readonly V1Parameter[];
    /** The v2 input. It is always an `object` template. */
    readonly input: Template;
    /**
     * `data` for a v1 function that gives the data, `page` for one that gives `{ total, data, next }`.
     */
    readonly result: 'data' | 'page';
    /** A key that v1 selects in the response data, such as the `name` of `showMetadata`. */
    readonly pick: Template | null;
    /** Differences that the tool cannot fix. The report shows them. */
    readonly notes: readonly string[];
}

export type CallMap = Readonly<Record<string, CallMapping>>;
