/**
 * The values of the enums that the server sends as numbers, by name. `generate.ts` uses them for the
 * schemas, and `v1-map.ts` for the 6.x enums of `@placeos/ts-client/compat`.
 */

/** `PlaceOS.Model.Playlist.Animation`. 6.x `MediaAnimation` has the names. */
export const ANIMATIONS: Readonly<Record<string, number>> = {
    default: 0,
    cut: 1,
    cross_fade: 2,
    slide_top: 3,
    slide_left: 4,
    slide_right: 5,
    slide_bottom: 6,
};
