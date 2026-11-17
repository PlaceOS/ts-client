/**
 * The PlaceOS staff API client, at `@placeos/ts-client/staff`. It uses the client of `configure`,
 * as the REST API functions do:
 *
 * ```ts
 * import { configure } from '@placeos/ts-client';
 * import { bookings } from '@placeos/ts-client/staff';
 *
 * configure({ baseUrl: '', auth: session.clientAuth });
 * const result = await bookings.query({ period_start, period_end, type: 'desk' });
 * ```
 *
 * The staff API has its own schemas, such as `Booking`. A schema that both APIs have, such as
 * `Zone`, is in both entries with the same shape.
 *
 * @module
 */
export * from './generated/staff/operations/index.ts';
export * from './generated/staff/schemas.ts';
