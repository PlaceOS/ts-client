import { of } from 'rxjs';
import * as SERVICE from '../../src/metadata/functions';
import { PlaceMetadata } from '../../src/metadata/metadata';
import { PlaceZoneMetadata } from '../../src/metadata/zone-metadata';
import * as Resources from '../../src/resources/functions';

describe('Applications API', () => {
    it('should allow listing metadata', async () => {
        const spy = jest.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn([{}]) as any));
        const item = await SERVICE.listMetadata('1').toPromise();
        expect(item[0]).toBeInstanceOf(PlaceMetadata);
    });

    it('should allow getting metadata', async () => {
        const spy = jest.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        const item = await SERVICE.showMetadata('1', 'test').toPromise();
        expect(item).toBeInstanceOf(PlaceMetadata);
    });

    it('should allow creating new metadata', async () => {
        const spy = jest.spyOn(Resources, 'create');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.addMetadata({}).toPromise();
        expect(item).toBeInstanceOf(PlaceMetadata);
        item = await SERVICE.addMetadata({}).toPromise();
    });

    it('should allow updating metadata details', async () => {
        const spy = jest.spyOn(Resources, 'update');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.updateMetadata('1', {}).toPromise();
        expect(item).toBeInstanceOf(PlaceMetadata);
        item = await SERVICE.updateMetadata('1', {}, 'patch').toPromise();
    });

    it('should allow removing metadata', async () => {
        const spy = jest.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        let item = await SERVICE.removeMetadata('1', {}).toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeMetadata('1').toPromise();
    });

    it('should allow listing child zone metadata', async () => {
        const spy = jest.spyOn(Resources, 'task');
        spy.mockImplementation((_: any) => of(_.callback([{ metadata: {} }]) as any));
        const item = await SERVICE.listChildMetadata('1', {}).toPromise();
        expect(item[0]).toBeInstanceOf(PlaceZoneMetadata);
    });
});
