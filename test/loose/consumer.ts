/**
 * Goal: the published types work in a project without `strictNullChecks`, such as backoffice.
 * Method: `bun run build` compiles these calls against `dist`. Each `@ts-expect-error` line must
 * be an error.
 */
import { orThrow, orThrowPage, PlaceDriverRole } from '../../dist/compat/index.js';
import { metadata, zones, type Driver, type Zone } from '../../dist/index.js';
import { mockEndpoint, respond } from '../../dist/mock/index.js';

export async function calls(): Promise<string> {
    // An operation without a body does not ask for one.
    const zone: Zone = await zones.show({ id: 'zone-1' }).then(orThrow);
    const page = await zones.query({ limit: 10 }).then(orThrowPage);
    await zones.update({ id: zone.id, body: { name: 'name' } }).then(orThrow);
    await metadata.show({ id: 'zone-1', name: 'settings' }).then(orThrow);
    // A 6.x enum value fits the 7.x field.
    const role: Driver['role'] = PlaceDriverRole.Logic;
    // @ts-expect-error the body is missing
    await zones.update({ id: 'zone-1' });
    // @ts-expect-error a parameter that the operation does not have
    await zones.show({ id: 'zone-1', no_such_parameter: true });
    // A typed mock: the input and the data have the types of the endpoint.
    mockEndpoint('zones.show', (input) => ({ id: input.id, name: 'Level 1' }));
    mockEndpoint('zones.query', () => respond([{ id: 'zone-1' }], { total: 1 }));
    mockEndpoint('metadata.show', () => ({ settings: { details: { theme: 'dark' } } }));
    // @ts-expect-error there is no such endpoint
    mockEndpoint('zones.no_such_endpoint', () => ({}));
    // @ts-expect-error `name` of a zone is a string
    mockEndpoint('zones.show', () => ({ name: 1 }));
    // Without `strictNullChecks`, `ok === false` narrows the result. `!result.ok` does not.
    const result = await zones.show({ id: 'zone-1' });
    if (result.ok === false) return result.error.kind;
    return `${page.total} ${role} ${result.value.data.name}`;
}
