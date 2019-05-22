import { readFile, writeFile } from 'fs-extra';
import * as path from 'path';

import { Commit, Package } from '../@types/custom';
import { debug, REPOSITORY_URL, packageTask } from '../lib/utils';


const SKIP_CI = ['***NO_CI***', '[skip ci]'];

const getChangelogPath = (pkg: Package) => {
    return path.join(path.dirname(pkg.path), 'CHANGELOG.md');
};

const prettyPrintArray = (a: string[]): string => {
    return [a.slice(0, -1).join(', '), a.slice(-1)[0]].join(a.length < 2 ? '' : ', and ');
};

/**
 * Returns a markdown string with the commit prettified:
 *
 * `* [[SHA](repository/commit/SHA)] - Commit title by [Author](githubprofile)`
 *
 * @param commit The commit to pretty print
 */
const prettyPrintCommit = (commit: Commit): string => {

    let additionalInfo = false;
    let commitAuthorInfo = '';
    let issuesInfo = '';
    // Remove all the possible patterns for skipping CI
    const title = SKIP_CI.reduce((res, pattern) => {
        return res.replace(pattern, '').trim();
    }, commit.title);
    let result = `* [[\`${commit.sha.substring(0, 10)}\`](${REPOSITORY_URL}/commit/${commit.sha})] - ${title}`;

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    const { author } = commit;

    if (author) {
        commitAuthorInfo = `by [\`${author.name}\`](${author.gitHubProfileURL})`;
        additionalInfo = true;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Get related issues information.

    const issues = commit.associatedIssues.map((issue) => {
        return `[\`#${issue}\`](${REPOSITORY_URL}/issues/${issue})`;
    });

    if (issues.length > 0) {
        issuesInfo = `see also: ${prettyPrintArray(issues)}`;
        additionalInfo = true;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    if (additionalInfo) {
        result = `${result} (${commitAuthorInfo}${commitAuthorInfo && issuesInfo ? ' / ' : ''}${issuesInfo})`;
    }

    return `${result}.`;
};

const generateChangelogSection = async (title: string, tags: string[], commits: Commit[]): Promise<string> => {
    let result = '';

    for (const commit of commits) {
        if (tags.includes(commit.tag)) {
            result += `${await prettyPrintCommit(commit)}\n`;
        }
    }

    if (result !== '') {
        result = `## ${title}\n\n${result}`;
    }

    return result;
};

const getDate = (): string => {
    const date = new Date();
    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

/**
 * Returns the changelog for the current version following this markdown format:
 *
 *  # SEMVER (DATE)
 *
 *  ## Breaking Changes
 *
 *  * List
 *
 *  ## Bug fixes / Improvements
 *
 *  * List
 *
 * ## New features
 *
 * * List
 *
 * @param pkg
 *
 */
const getChangelogData = async (pkg: Package): Promise<string> => {
    const { commits } = pkg;
    /*
     * Note: Commits that use tags that do not denote user-facing
     * changes will not be included in changelog file, and the
     * release notes.
     */

    const breakingChanges = await generateChangelogSection('Breaking Changes', ['Breaking'], commits);
    const bugFixesAndImprovements = await generateChangelogSection('Bug fixes / Improvements', ['Docs', 'Fix'], commits);
    const newFeatures = await generateChangelogSection('New features', ['New', 'Update'], commits);
    const others = await generateChangelogSection('Chores', ['Upgrade', 'Chore'], commits);

    let releaseNotes = `# ${pkg.content.version} (${getDate()})\n\n`;

    releaseNotes += breakingChanges ? `${breakingChanges}\n` : '';
    releaseNotes += bugFixesAndImprovements ? `${bugFixesAndImprovements}\n` : '';
    releaseNotes += newFeatures ? `${newFeatures}\n` : '';
    releaseNotes += others ? `${others}\n` : '';

    return `${releaseNotes.trim()}\n\n\n`;
};

const getCurrentChangelog = (pkg: Package) => {
    return readFile(getChangelogPath(pkg), 'utf-8');
};

const updatePackage = async (pkg: Package) => {
    /**
     * 1. Generate new content
     * 2. Read CHANGELOG.md if it exists
     * 3. Append old content to new changes
     * 4. Save
     */

    let newContent = await getChangelogData(pkg);
    let oldContent = '';

    try {
        oldContent = await getCurrentChangelog(pkg);
    } catch (e) {
        // Package is new and there isn't any CHANGELOG.md file
    }

    newContent += oldContent;

    await writeFile(getChangelogPath(pkg), newContent, 'utf-8');
};

/**
 * Updates the changelog of all the packages using the latest commits since
 * the last release.
 * @param ctx The Listr Context
 */
export const updateChangelogs = () => {
    return packageTask(async (pkg, observer) => {
        if (!pkg.ignore && (pkg.updated || !pkg.publishedVersion)) {
            const message = `Updating changelog for ${pkg.name}`;

            debug(message);
            observer.next(message);

            await updatePackage(pkg);
        } else {
            debug(`Skipping changelog for "${pkg.name}"`);
        }
    });
};
