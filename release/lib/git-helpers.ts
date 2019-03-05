import * as fs from 'fs-extra';

import * as Octokit from '@octokit/rest';
import * as throttling from '@octokit/plugin-throttling';

import { Tag, Commit, Package, Author, GitHubAuth } from '../@types/custom';
import { debug, execa } from './utils';

const Client = Octokit.plugin(throttling);

const octokitOptions = {
    log: {
        debug,
        error: debug,
        info: debug,
        warn: debug
    },
    throttle: {
        onAbuseLimit: (retryAfter: number, options: { method: string; url: string; request: { retryCount: number } }) => {
            // does not retry, only logs a warning
            debug(`Abuse detected for request ${options.method} ${options.url}`);
        },
        onRateLimit: (retryAfter: number, options: { method: string; url: string; request: { retryCount: number } }) => {
            debug(`Request quota exhausted for request ${options.method} ${options.url}`);

            if (options.request.retryCount <= 4) { // retry 5 times
                debug(`Retrying after ${retryAfter} seconds!`);

                return true;
            }

            return false;
        }
    },
    userAgent: 'Nellie The Narwhal'
};

let octokit: Octokit;

const GITHUB = {
    password: '',
    tokenID: 0,
    userName: ''
};

const authors: Map<string, Promise<Author | null>> = new Map();
const commitAuthors: Map<string, Promise<Author | null>> = new Map();

const getResponseForUserInfoRequest = async (commitInfo: any) => {

    try {
        const result = await octokit.users.getByUsername({ username: commitInfo.author.login });

        const author = {
            gitHubProfileURL: result.data.html_url,
            /*
             * Get the user name, and if one is not provided,
             * use the name associated with the commit.
             */
            name: result.data.name || commitInfo.commit.author.name || result.data.login
        } as Author;

        return author;

    } catch (e) {
        debug(`Error from GitHub trying to get the info for ${commitInfo.author.login}`);
        debug(JSON.stringify(e, Object.getOwnPropertyNames(e), 2));

        return null;
    }
};


const getResponseForCommitInfoRequest = async (commitSHA: string) => {
    try {
        const result = await octokit.repos.getCommit({
            owner: 'webhintio',
            repo: 'hint',
            sha: commitSHA
        });

        const commitInfo = result.data;

        /*
         * Get commit author related info.
         *
         * This is done because the previous request doesn't provide
         * the user name, only the user name associated with the commit,
         * which in most cases, is wrongly set.
         */

        const cachedAuthor = authors.get(commitInfo.author.login);

        if (cachedAuthor) {
            debug(`Reusing cached Author ${commitInfo.author.login}`);

            return cachedAuthor;
        }

        debug(`Requesting info for login ${commitInfo.author.login}`);

        const responseForUserInfoRequestPromise = getResponseForUserInfoRequest(commitInfo);

        authors.set(commitInfo.author.login, responseForUserInfoRequestPromise);

        return responseForUserInfoRequestPromise;
    } catch (e) {
        debug(`Error trying to get the author of commit ${commitSHA}`);
        debug(JSON.stringify(e, null, 2));

        return null;
    }
};

/**
 * Returns the GitHub user information associated with a given commit.
 * @param commitSHA The sha of the commit to get the information from.
 */
const getCommitAuthorInfo = (commitSHA: string): Promise<Author | null> => {

    if (commitAuthors.has(commitSHA)) {
        debug(`Reusing GitHub info for commit ${commitSHA}`);

        return commitAuthors.get(commitSHA)!;
    }

    // Get commit related info.

    debug(`Getting author info for ${commitSHA}`);

    const responseForCommitInfoRequestPromise = getResponseForCommitInfoRequest(commitSHA);

    commitAuthors.set(commitSHA, responseForCommitInfoRequestPromise);

    return responseForCommitInfoRequestPromise;
};

/**
 * Find out what commits relate to a package since the last time it got version bumped.
 * To know when it got updated it searches for `"version"` line number and then uses
 * `git blame -L versionLine,versionLine package.json` to find the latest commit.
 *
 * @param pkg The package we want the commits from
 */
const getLatestReleaseCommitForPackage = async (pkg: Package) => {
    const pkgText = await fs.readFile(pkg.path, 'utf-8');
    const versionIndex = pkgText.indexOf('"version":');
    const line = pkgText.substr(0, versionIndex).split('\n').length;
    const command = `git blame -L ${line},${line} ${pkg.path}`;

    try {
        const { stdout } = await execa(command);
        /**
         * The format is `sha (Author date) lineContent`.E.g.:
         * `c10092ade (Tony Ross 2018-08-22 17:39:49 -0500 77)   }`
         */
        const sha = stdout.split(' ')[0];

        return sha;
    } catch (e) {
        // Something wrong happened, abort the process somehow
        return '';
    }
};

const commitsInfo: Map<string, Promise<Commit>> = new Map();

const extractDataFromCommit = (sha: string): Promise<Commit> => {
    if (commitsInfo.has(sha)) {
        debug(`Reusing info for commit ${sha}`);

        return commitsInfo.get(sha)!;
    }

    const command = `git show --no-patch --format=%B ${sha}`;

    const commitInfoPromise = execa(command)
        .then(async ({ stdout }: { stdout: string }) => {
            const commitBodyLines = stdout.split('\n');
            const associatedIssues: string[] = [];
            const title = commitBodyLines[0];
            const tag = title.split(':')[0] as Tag;

            const regex = /(Fix|Close)\s+#([0-9]+)/gi;

            commitBodyLines.shift();
            commitBodyLines.forEach((line) => {
                const match = regex.exec(line);

                if (match) {
                    associatedIssues.push(match[2]);
                }
            });

            const author = await getCommitAuthorInfo(sha);

            const commit = {
                associatedIssues,
                author,
                sha,
                tag,
                title
            };

            return commit;
        });

    commitsInfo.set(sha, commitInfoPromise);

    return commitInfoPromise;
};

const createOctokitFromToken = (token: string) => {
    const options = Object.assign({}, { auth: `token ${token}` }, octokitOptions);

    const kit = new Client(options);

    return kit;
};

const createOctokitFromUserPass = (auth: GitHubAuth) => {
    if ('token' in auth) {
        /**
         * This code should never be executed because there's
         * a check before calling the funciton butut TS and
         * ESLint complain so...
         */
        return createOctokitFromToken(auth.token);
    }

    const options = Object.assign({}, {
        auth: {
            on2fa() {
                return Promise.resolve(auth.otp);
            },
            password: auth.pass,
            username: auth.user
        }
    }, octokitOptions);

    const kit = new Client(options);

    return kit;
};

/** Commits the changes of the current package. */
export const commitChanges = async (message: string, cwd?: string) => {
    const gitAdd = `git add .`;
    const gitCommit = `git commit -m "${message}"`;

    await execa(gitAdd, { cwd });
    await execa(gitCommit, { cwd });
};

/**
 * For a given package, get all the changes since the last release.
 * @param packagePath The path to the package to analyze.
 * @param lastRelease The SHA of the latest release.
 */
export const getCommitsSinceLastRelease = async (pkg: Package): Promise<Commit[]> => {
    const lastRelease = await getLatestReleaseCommitForPackage(pkg);
    const packagePath = pkg.path.replace('package.json', '');

    const command = `git rev-list HEAD...${lastRelease} ${packagePath}`;
    const { stdout } = await execa(command);

    if (stdout === '') {
        return [];
    }

    const shas = stdout.split('\n');

    const commitPromises: Promise<Commit>[] = [];

    for (const sha of shas) {
        commitPromises.push(extractDataFromCommit(sha));
    }

    return Promise.all(commitPromises);
};

/**
 * Returns the remote branch the local "master" is pointing at.
 */
export const getCurrentBranchRemoteInfo = async () => {

    const errorMessage = `Couldn't determine the current branch`;
    const branches = (await execa(`git branch -lvv`)).stdout;

    const current = branches.split('\n').find((line) => {
        return line.startsWith('*');
    });

    if (!current) {
        throw new Error(errorMessage);
    }

    /**
     * `current` should be something like:
     * `* new/release   a1b3fbbf67a0 [molant/new/release: ahead 5, behind 1] New: Release script improvements`
     *
     * The following regex has 3 capturing groups:
     *
     * 1. the local branch: `new/release`
     * 2. the sha: `a1b3fbbf67a0`
     * 3. the remote branch: `molant/new/release`
     */
    const regex = /\*\s+(.+?)\s+([a-z0-9]+)\s\[(.+?):/gi;
    const results = regex.exec(current);

    if (!results) {
        throw new Error(errorMessage);
    }

    const [, localBranch, , remote] = results;

    /**
     * `remoteBranch` has a format like `origin/master` or `origin/new/release`
     * The first part is needed to know where it is pointing
     */
    const parts = remote.split('/');
    const remoteName = parts.shift();
    const remoteBranch = parts.join('/');
    const remoteURL = (await execa(`git config --get remote.${remoteName}.url`)).stdout;

    debug(`Current branch "${localBranch}" is pointing to "${remoteURL}"`);

    return { remoteBranch, remoteURL };
};

/**
 * Deletes the Auth token created during the release.
 * If the token was provided directly nothing is changed.
 */
export const deauthenticate = async (otp: string) => {

    debug('Deleting token from user account');

    // Maybe the process never got to authenticate in the beginning
    if (!GITHUB.password && !GITHUB.userName) {
        return;
    }

    const kit = createOctokitFromUserPass({
        otp,
        pass: GITHUB.password,
        user: GITHUB.userName
    });


    await kit.oauthAuthorizations.deleteAuthorization({ authorization_id: GITHUB.tokenID }); // eslint-disable-line
};

/**
 * Push changes to the remote repo.
 */
export const push = () => {
    debug(`Pushing changes`);
    const gitPush = 'git push';

    return execa(gitPush);
};

/**
 * Authenticates into GitHub to use their API.
 * @param auth The auth values to use
 */
export const authenticate = async (auth: GitHubAuth) => {
    if ('token' in auth) {
        debug('Using existing token');

        octokit = createOctokitFromToken(auth.token);

        return;
    }

    debug('Creating new auth token in user account');

    octokit = createOctokitFromUserPass(auth)!;

    const result = await octokit.oauthAuthorizations.createAuthorization({
        note: `webhint release script (${new Date()})`,
        scopes: ['repo']
    });

    const { id, token } = result.data;

    debug(`Token created successfully: ${id}`);

    octokit = createOctokitFromToken(token);
    GITHUB.userName = auth.user;
    GITHUB.password = auth.pass;
    GITHUB.tokenID = id;
};
