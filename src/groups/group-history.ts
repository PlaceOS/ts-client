import { PlaceHistory } from '../history/history';

/**
 * @deprecated Group history entries are `PlaceHistory` entries whose
 * `correlation_id` is the group. Use `PlaceHistory` instead.
 */
export const PlaceGroupHistory = PlaceHistory;
/** @deprecated Use `PlaceHistory` instead. */
export type PlaceGroupHistory = PlaceHistory;
