import { PlaceResourceQueryOptions } from '../resources/interface';

/** Type of repository */
export enum PlaceRepositoryType {
    /** Repository is a collection of Driver logic */
    Driver = 'driver',
    /** Repository is a collection of interfaces */
    Interface = 'interface',
}

/** Mapping of available query parameters for the repositories index endpoint */
export interface PlaceRepositoryQueryOptions extends PlaceResourceQueryOptions {}

/** Query parameters for repository commit listing */
export interface PlaceRepositoryCommitQuery {
    /** URL encoded name of the branch being requested */
    branch?: string;
    /** URL encoded name of the driver being requested */
    driver?: string;
    /** Number of commits to return */
    limit?: number;
}

export interface GitCommitDetails {
    /** Name of the commit author */
    author: string;
    /** Short hash of the commit */
    commit: string;
    /** ISO datetime string for commit */
    date: string;
    /** Commit summary */
    subject: string;
}

/** Query parameters for repository driver details */
export interface PlaceRepositoryDetailsQuery {
    /** URL encoded name of the driver being requested (required) */
    driver: string;
    /** Hash of the commit being requested for the driver (required) */
    commit: string;
}

/** Query parameters for repository pull */
export interface PlaceRepositoryPullQuery {
    /** Hash of the commit being requested */
    commit: string;
}

/** Query parameters for remote repository operations */
export interface PlaceRemoteRepositoryQuery {
    /** The git URL that represents the repository (required) */
    repository_url: string;
    /** A username for access if required */
    username?: string;
    /** The password or access token as required */
    password?: string;
}

/** Query parameters for remote repository commits */
export interface PlaceRemoteRepositoryCommitsQuery extends PlaceRemoteRepositoryQuery {
    /** The branch to grab commits from */
    branch?: string;
    /** The number of commits to return */
    depth?: number;
}

/** Query parameters for repository folders listing */
export interface PlaceRepositoryFoldersQuery {
    /** Include dot files and folders */
    include_dots?: boolean;
}

/** Metadata for a repository commit */
export interface PlaceRepositoryCommit {
    /** Hash associated with the commit */
    commit: string;
    /** UTC epoch in seconds of the time the commit was made */
    date: number;
    /** Author of the commit */
    author: string;
    /** Commit subject line */
    subject: string;
}
