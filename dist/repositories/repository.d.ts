import { PlaceResource } from '../resources/resource';
import { PlaceRepositoryType } from './interfaces';
export declare class PlaceRepository extends PlaceResource {
    /** Name of the folder on the server to pull the repository */
    readonly folder_name: string;
    /** Description of the contents of the repository */
    readonly description: string;
    /** URI that the repository can be pulled from */
    readonly uri: string;
    /** Working branch for the repository */
    readonly branch: string;
    /** Hash of the commit at the head of the repository */
    readonly commit_hash: string;
    /** Repository type */
    readonly repo_type: PlaceRepositoryType;
    /** Username to connect to repository with */
    readonly username: string;
    /** Password to connect to repository with */
    readonly password: string;
    /** Root path of the repository to serve at the `folder_name` path */
    readonly root_path: string;
    /** Repository type */
    get type(): PlaceRepositoryType;
    constructor(raw_data?: Partial<PlaceRepository>);
}
