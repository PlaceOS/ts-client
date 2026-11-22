/**
 * The types of the 6.x to 7.x call map. `scripts/v1-map.ts` writes the map in `v1-map.ts`, and the
 * migration tool reads it.
 *
 * @module
 */

/**
 * The source of a 7.x input value, made from the 6.x arguments.
 *
 * - `arg`: the 6.x argument at this index.
 * - `member`: a property of the 6.x argument at this index, such as the `version` of the data.
 * - `literal`: a fixed value.
 * - `concat`: a string of fixed text and arguments, such as `${module}_${index}`.
 * - `object`: an object. A `spread` entry spreads the properties of an argument.
 * - `array`: an array.
 */
export type Template =
    | { readonly kind: 'arg'; readonly index: number }
    | {
          readonly kind: 'member';
          readonly index: number;
          readonly key: string;
          /** The value that 6.x sends when the argument does not have the member. */
          readonly fallback?: string | number | boolean | null;
      }
    | { readonly kind: 'literal'; readonly value: string | number | boolean | null }
    | { readonly kind: 'concat'; readonly parts: readonly (string | number)[] }
    | { readonly kind: 'object'; readonly entries: readonly ObjectEntry[] }
    | { readonly kind: 'array'; readonly items: readonly Template[] };

/** A property of an `object` template. A `number` in `concat` parts is an argument index. */
export type ObjectEntry =
    | { readonly kind: 'property'; readonly key: string; readonly value: Template }
    | { readonly kind: 'spread'; readonly index: number };

/** A parameter of a 6.x function. */
export interface V1Parameter {
    readonly name: string;
    /** The source text of the default value, or `null`. */
    readonly initializer: string | null;
    /**
     * - `mapped`: the 7.x input has this argument.
     * - `ignored`: 7.x has no use for it. An example is the `method` of the 6.x updates: 7.x sends the
     *   update method of the API document. The tool removes it.
     * - `unsupported`: the 7.x call has no place for it. The tool does not change a call that gives
     *   it.
     */
    readonly use: 'mapped' | 'ignored' | 'unsupported';
}

/** The 7.x type of a 6.x class. `staff` is a type of `@placeos/ts-client/staff`. */
export interface TypeMapping {
    readonly name: string;
    readonly module?: 'staff';
}

/** The 7.x call for one 6.x function. */
export interface CallMapping {
    /** `staff` for an operation of `@placeos/ts-client/staff`. */
    readonly module?: 'staff';
    /** The namespace export of 7.x, such as `zones`. */
    readonly namespace: string;
    /** The operation of the namespace, such as `show`. */
    readonly operation: string;
    readonly parameters: readonly V1Parameter[];
    /** The 7.x input. It is always an `object` template. */
    readonly input: Template;
    /**
     * `data` for a 6.x function that gives the data, `page` for one that gives `{ total, data, next }`.
     */
    readonly result: 'data' | 'page';
    /** A key that 6.x selects in the response data, such as the `name` of `showMetadata`. */
    readonly pick: Template | null;
    /** Differences that the tool cannot fix. The report shows them. */
    readonly notes: readonly string[];
}

export type CallMap = Readonly<Record<string, CallMapping>>;
