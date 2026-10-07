import { PlaceDriverDetails } from '../drivers/interfaces';
import { HashMap } from '../utilities/types';
import { GitCommitDetails, PlaceRemoteRepositoryCommitsQuery, PlaceRemoteRepositoryQuery, PlaceRepositoryCommitQuery, PlaceRepositoryDetailsQuery, PlaceRepositoryFilesQuery, PlaceRepositoryFoldersQuery, PlaceRepositoryPullQuery, PlaceRepositoryQueryOptions } from './interfaces';
import { PlaceRepository } from './repository';
/**
 * Query the available repositories
 * @param query_params Query parameters to add the to request URL
 */
export declare function queryRepositories(query_params?: PlaceRepositoryQueryOptions): import('..').QueryResponse<PlaceRepository>;
/**
 * Get the data for a repository
 * @param id ID of the repository to retrieve
 */
export declare function showRepository(id: string): Promise<PlaceRepository>;
/**
 * Update the repository in the database
 * @param id ID of the repository
 * @param form_data New values for the repository
 * @param query_params Query parameters to add the to request URL
 * @param method HTTP verb to use on request. Defaults to `patch`
 */
export declare function updateRepository(id: string, form_data: Partial<PlaceRepository>, method?: 'put' | 'patch'): Promise<PlaceRepository>;
/**
 * Add a new repository to the database
 * @param form_data Repository data
 * @param query_params Query parameters to add the to request URL
 */
export declare function addRepository(form_data: Partial<PlaceRepository>): Promise<PlaceRepository>;
/**
 * Remove a repository from the database
 * @param id ID of the repository
 */
export declare function removeRepository(id: string): Promise<HashMap<any>>;
/**
 * Get a list of all the interfaces
 */
export declare function listInterfaceRepositories(): Promise<string[]>;
/**
 * Get name of the default branch for a new repository
 * @param query_params Details about the repository
 */
export declare function listRemoteRepositoryDefaultBranch(query_params: PlaceRemoteRepositoryQuery): Promise<string>;
/**
 * Get a list of branches for a new repository
 * @param query_params Details about the repository
 */
export declare function listRemoteRepositoryBranches(query_params: PlaceRemoteRepositoryQuery): Promise<string[]>;
/**
 * Get a list of branch commits for a new repository
 * @param query_params Details about the repository
 */
export declare function listRemoteRepositoryCommits(query_params: PlaceRemoteRepositoryCommitsQuery): Promise<GitCommitDetails[]>;
/**
 * Get a list of tags for a new repository
 * @param query_params Details about the repository
 */
export declare function listRemoteRepositoryTags(query_params: PlaceRemoteRepositoryQuery): Promise<string[]>;
/**
 * Get a list of all the drivers for a repository
 * @param id ID of the repository
 * @param query Addition query parameters to pass to the request
 */
export declare function listRepositoryDrivers(id: string, query_params?: HashMap): Promise<string[]>;
/**
 * Get a list of all the releases for a repository
 * @param id ID of the repository
 * @param query Addition query parameters to pass to the request
 */
export declare function listRepositoryReleases(id: string, query_params?: HashMap): Promise<string[]>;
/**
 * Get a list of all the commits for a repository
 * @param id ID of the repository
 * @param query Addition query parameters to pass to the request
 */
export declare function listRepositoryCommits(id: string, query_params?: PlaceRepositoryCommitQuery): Promise<GitCommitDetails[]>;
/**
 * Get a list of all the branches for a repository
 * @param id ID of the repository
 */
export declare function listRepositoryBranches(id: string): Promise<string[]>;
/**
 * Get a list of all the branches for a repository
 * @param id ID of the repository
 */
export declare function listRepositoryDefaultBranch(id: string): Promise<string>;
/**
 * Get a list of all the tags for a repository
 * @param id ID of the repository
 */
export declare function listRepositoryTags(id: string): Promise<string[]>;
/**
 * Get the details for a given driver
 * @param id ID of the repository
 * @param query Addition query parameters to pass to the request
 */
export declare function listRepositoryDriverDetails(id: string, query_params: PlaceRepositoryDetailsQuery): Promise<PlaceDriverDetails>;
/**
 * Pull remote changes to tshe repository
 * @param id ID of the repository
 * @param query Addition query parameters to pass to the request
 */
export declare function pullRepositoryChanges(id: string, query_params?: PlaceRepositoryPullQuery): Promise<GitCommitDetails>;
/**
 * Get the folder tree structure of a repository
 * @param id ID of the repository
 * @param query_params Query parameters to add to the request
 */
export declare function listRepositoryFolders(id: string, query_params?: PlaceRepositoryFoldersQuery): Promise<string[]>;
/**
 * List the files in an interface repository that match a glob pattern.
 * Paths are relative to where they are served, i.e. `/<folder_name>/path/to/file.html`
 * @param id ID of the repository
 * @param query_params Glob pattern to match files against
 */
export declare function listRepositoryFiles(id: string, query_params: PlaceRepositoryFilesQuery): Promise<string[]>;
