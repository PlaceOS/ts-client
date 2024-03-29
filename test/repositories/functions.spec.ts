import { of } from 'rxjs';
import * as SERVICE from '../../src/repositories/functions';
import { PlaceRepository } from '../../src/repositories/repository';
import * as Resources from '../../src/resources/functions';

describe('Repositories API', () => {
    it('should allow querying repositories', async () => {
        const spy = jest.spyOn(Resources, 'query');
        spy.mockImplementation((_) => of({ data: [_.fn!({})] } as any));
        let list = await SERVICE.queryRepositories().toPromise();
        expect(list).toBeTruthy();
        expect(list.data.length).toBe(1);
        expect(list.data[0]).toBeInstanceOf(PlaceRepository);
        list = await SERVICE.queryRepositories({}).toPromise();
    });

    it('should allow showing repository details', async () => {
        const spy = jest.spyOn(Resources, 'show');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.showRepository('1').toPromise();
        expect(item).toBeInstanceOf(PlaceRepository);
        item = await SERVICE.showRepository('1', {}).toPromise();
    });

    it('should allow creating new repositories', async () => {
        const spy = jest.spyOn(Resources, 'create');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.addRepository({}).toPromise();
        expect(item).toBeInstanceOf(PlaceRepository);
        item = await SERVICE.addRepository({}).toPromise();
    });

    it('should allow updating repository details', async () => {
        const spy = jest.spyOn(Resources, 'update');
        spy.mockImplementation((_) => of(_.fn!({}) as any));
        let item = await SERVICE.updateRepository('1', {}).toPromise();
        expect(item).toBeInstanceOf(PlaceRepository);
        item = await SERVICE.updateRepository('1', {}, 'patch').toPromise();
    });

    it('should allow removing repositories', async () => {
        const spy = jest.spyOn(Resources, 'remove');
        spy.mockImplementation(() => of());
        let item = await SERVICE.removeRepository('1', {}).toPromise();
        expect(item).toBeFalsy();
        item = await SERVICE.removeRepository('1').toPromise();
    });

    it('should allow listing remote repository default branch', async () => {
        const spy = jest.spyOn(Resources, 'show');
        spy.mockImplementation(() => of(''));
        let item = await SERVICE.listRemoteRepositoryDefaultBranch({
            repository_url: 'test'
        }).toPromise();
        expect(item).toEqual('');
    });

    it('should allow listing remote repository branches', async () => {
        const spy = jest.spyOn(Resources, 'show');
        spy.mockImplementation(() => of([]));
        let item = await SERVICE.listRemoteRepositoryBranches({
            repository_url: 'test'
        }).toPromise();
        expect(item).toEqual([]);
    });

    it('should allow listing remote repository commits', async () => {
        const spy = jest.spyOn(Resources, 'show');
        spy.mockImplementation(() => of([]));
        let item = await SERVICE.listRemoteRepositoryCommits({
            repository_url: 'test'
        }).toPromise();
        expect(item).toEqual([]);
    });

    it('should allow listing remote repository tags', async () => {
        const spy = jest.spyOn(Resources, 'show');
        spy.mockImplementation(() => of([]));
        let item = await SERVICE.listRemoteRepositoryTags({
            repository_url: 'test'
        }).toPromise();
        expect(item).toEqual([]);
    });

    it('should allow listing interface repositories', async () => {
        const spy = jest.spyOn(Resources, 'show');
        spy.mockImplementation(() => of({}));
        let item = await SERVICE.listInterfaceRepositories().toPromise();
        expect(item).toEqual({});
        item = await SERVICE.listInterfaceRepositories({}).toPromise();
    });

    it('should allow listing repository drivers', async () => {
        const spy = jest.spyOn(Resources, 'task');
        spy.mockImplementation(() => of(['/driver']));
        let item = await SERVICE.listRepositoryDrivers('1').toPromise();
        expect(item).toEqual(['/driver']);
        item = await SERVICE.listRepositoryDrivers('1', {}).toPromise();
    });

    it('should allow listing repository releases', async () => {
        const spy = jest.spyOn(Resources, 'task');
        spy.mockImplementation(() => of([{}]));
        const item = await SERVICE.listRepositoryReleases('1').toPromise();
        expect(item).toEqual([{}]);
    });

    it('should allow listing repository commits', async () => {
        const spy = jest.spyOn(Resources, 'task');
        spy.mockImplementation(() => of([{}]));
        const item = await SERVICE.listRepositoryCommits('1').toPromise();
        expect(item).toEqual([{}]);
    });

    it('should allow listing repository branches', async () => {
        const spy = jest.spyOn(Resources, 'task');
        spy.mockImplementation(() => of(['master']));
        const item = await SERVICE.listRepositoryBranches('1').toPromise();
        expect(item).toEqual(['master']);
    });

    it('should allow listing repository default branch', async () => {
        const spy = jest.spyOn(Resources, 'task');
        spy.mockImplementation(() => of('master'));
        const item = await SERVICE.listRepositoryDefaultBranch('1').toPromise();
        expect(item).toEqual('master');
    });

    it('should allow listing repository tags', async () => {
        const spy = jest.spyOn(Resources, 'task');
        spy.mockImplementation(() => of(['v1.0.0']));
        const item = await SERVICE.listRepositoryTags('1').toPromise();
        expect(item).toEqual(['v1.0.0']);
    });

    it('should allow getting repository driver details', async () => {
        const spy = jest.spyOn(Resources, 'task');
        spy.mockImplementation(() => of(['/driver']));
        const item = await SERVICE.listRepositoryDriverDetails('1', {
            driver: '/driver',
            commit: '1',
        }).toPromise();
        expect(item).toEqual(['/driver']);
    });

    it('should allow pulling latest changes to repository', async () => {
        const spy = jest.spyOn(Resources, 'task');
        spy.mockImplementation(() => of({}));
        const item = await SERVICE.pullRepositoryChanges('1').toPromise();
        expect(item).toEqual({});
    });
});
