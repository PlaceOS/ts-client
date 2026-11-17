/**
 * Goal: the published types work in a project without `strictNullChecks`, such as backoffice.
 * Method: `bun run build` compiles these calls against `dist`. Each `@ts-expect-error` line must
 * be an error.
 */
import { orThrow, orThrowPage, PlaceDriverRole } from '../../dist/compat.js';
import { metadata, zones, type Driver, type Zone } from '../../dist/index.js';

export async function calls(): Promise<string> {
    // An operation without a body does not ask for one.
    const zone: Zone = await zones.show({ id: 'zone-1' }).then(orThrow);
    const page = await zones.index({ limit: 10 }).then(orThrowPage);
    await zones.update({ id: zone.id, body: { name: 'name' } }).then(orThrow);
    await metadata.show({ id: 'zone-1', name: 'settings' }).then(orThrow);
    // A v1 enum value fits the v2 field.
    const role: Driver['role'] = PlaceDriverRole.Logic;
    // @ts-expect-error the body is missing
    await zones.update({ id: 'zone-1' });
    // @ts-expect-error a parameter that the operation does not have
    await zones.show({ id: 'zone-1', no_such_parameter: true });
    // Without `strictNullChecks`, `ok === false` narrows the result. `!result.ok` does not.
    const result = await zones.show({ id: 'zone-1' });
    if (result.ok === false) return result.error.kind;
    return `${page.total} ${role} ${result.value.data.name}`;
}
