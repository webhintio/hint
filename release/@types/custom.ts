import { Arguments } from 'yargs';

export type GitHubAuth = {
    user: string;
    pass: string;
    otp: string;
} | {
    token: string;
}

export type Package = {
    built: boolean;
    commits: Commit[];
    content: any;
    ignore: boolean;
    name: string;
    oldVersion: string;
    path: string;
    published: boolean;
    publishedVersion: string;
    references: string[];
    tested: boolean;
    updated: boolean;
}

export type Parameters = {
    dryRun: boolean;
    force: boolean;
    help: boolean;
    justRelease: boolean;
    skipInstall: boolean;
}

export type Reference = {
    path: string;
}

export type Context = {
    abort: boolean;
    argv: Arguments<Parameters>;
    error?: Error;
    packages: Map<string, Package>;
    sha: string;
}

export type Author = {
    gitHubProfileURL: string;
    name: string;
}

export type Commit = {
    associatedIssues: string[];
    sha: string;
    tag: Tag;
    title: string;
    author: Author | null;
};

export type Tag = 'Docs' |
    'Build' |
    'Upgrade' |
    'Chore' |
    'Fix' |
    'New' |
    'Breaking';

export enum Bump {
    none,
    patch,
    minor,
    major
}
