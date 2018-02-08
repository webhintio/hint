import { EOL } from 'os';
import { promisify } from 'util';
import * as path from 'path';

import chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as request from 'request';
import * as shell from 'shelljs';

import { exec } from './utils';

const CHANGELOG_FILE = 'CHANGELOG.md';
const PACKAGE_LOCK_FILE = 'package-lock.json';
const SHRINKWRAP_FILE = 'npm-shrinkwrap.json';

const PKG = require('../../package.json');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

type Commit = {
    associatedIssues: string[];
    sha: string;
    tag: string;
    title: string;
};

/*
 * We only use these 3 values for now.
 * See also: https://docs.npmjs.com/cli/version#description.
 */

type SemVer = 'patch' | 'minor' | 'major';

type ChangelogData = {
    body: string;
    version: SemVer;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

shell.config.silent = true;
shell.config.fatal = true;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

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
        'Decembe'
    ];

    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const prettyPrintArray = (a: string[]): string => {
    return [a.slice(0, -1).join(', '), a.slice(-1)[0]].join(a.length < 2 ? '' : ', and ');
};

const prettyPrintCommit = (commit: Commit): string => {
    let result = `* [[\`${commit.sha.substring(0, 10)}\`](https://github.com/sonarwhal/sonarwhal/commit/${commit.sha})] - ${commit.title}`;

    const issues = commit.associatedIssues.map((issue) => {
        return `[\`#${issue}\`](https://github.com/sonarwhal/sonarwhal/issues/${issue})`;
    });

    if (issues.length > 0) {
        result = `${result} (see also: ${prettyPrintArray(issues)})`;
    }

    return `${result}.`;
};

const createRelease = async (version: string, releaseBody: string) => {

    const questions = [{
        message: 'GitHub username:',
        name: 'username',
        type: 'input'
    }, {
        message: 'GitHub password:',
        name: 'password',
        type: 'password'
    }, {
        message: 'GitHub 2FA code:',
        name: 'code',
        type: 'input'
    }];

    const answers = await inquirer.prompt(questions);

    const res = await promisify(request)({
        auth: {
            pass: answers.password,
            user: answers.username
        },
        body: {
            body: releaseBody,
            name: `v${version}`,
            tag_name: version // eslint-disable-line camelcase
        },
        headers: {
            'User-Agent': 'Nellie The Narwhal',
            'X-GitHub-OTP': answers.code
        },
        json: true,
        method: 'POST',
        url: 'https://api.github.com/repos/sonarwhal/sonarwhal/releases'
    });

    if (res.body.message) {
        console.error(chalk.red('* Create release.'));
        console.error(res.body);
        process.exit(1); // eslint-disable-line no-process-exit
    } else {
        console.log(chalk.green('* Create release.'));
    }
};

const extractDataFromCommit = async (sha: string): Promise<Commit> => {
    const commitBodyLines = (await exec(`- Get commit data for: ${sha}.`, `git show --no-patch  --format=%B ${sha}`)).split('\n');

    const associatedIssues = [];
    const title = commitBodyLines[0];
    const tag = title.split(':')[0];

    const regex = /(Fix|Close)\s+#([0-9]+)/gi;

    commitBodyLines.shift();
    commitBodyLines.forEach((line) => {
        const match = regex.exec(line);

        if (match) {
            associatedIssues.push(match[2]);
        }
    });

    return {
        associatedIssues,
        sha,
        tag,
        title
    };
};

const generateChangelogSection = (title: string, tags: Array<string>, commits: Array<Commit>): string => {
    let result = '';

    commits.forEach((commit) => {
        if (tags.includes(commit.tag)) {
            result += `${prettyPrintCommit(commit)}\n`;
        }
    });

    if (result !== '') {
        result = `## ${title}\n\n${result}`;
    }

    return result;
};

const getChangelogData = (commits: Array<Commit>): ChangelogData => {

    /*
     * Note: Commits that use tags that do not denote user-facing
     * changes will not be included in changelog file, and the
     * release notes.
     */

    const breakingChanges = generateChangelogSection('Breaking Changes', ['Breaking'], commits);
    const bugFixesAndImprovements = generateChangelogSection('Bug fixes / Improvements', ['Docs', 'Fix'], commits);
    const newFeatures = generateChangelogSection('New features', ['New', 'Update'], commits);

    let body = '';

    body += breakingChanges ? `${breakingChanges}\n` : '';
    body += bugFixesAndImprovements ? `${bugFixesAndImprovements}\n` : '';
    body += newFeatures ? `${newFeatures}\n` : '';

    // Determine semver version.

    let version: SemVer = 'patch';

    if (breakingChanges) {
        version = 'minor'; // TODO: change to 'major' after v1.0.0.
    } else if (newFeatures) {
        version = 'minor';
    }

    return {
        body,
        version
    };
};

const getCommitsSinceLastRelease = async (): Promise<Commit[]> => {
    const commitSHAsSinceLastRelease = (await exec('Get commits since last releases.', `git rev-list master...${PKG.version}`)).split('\n');
    const commits = [];

    for (const sha of commitSHAsSinceLastRelease) {
        const data = await extractDataFromCommit(sha);

        commits.push(data);
    }

    return commits;
};

const getReleaseNotes = (): string => {

    /*
     * The change log is structured as follows:
     *
     * # <version_number> (<date>)
     * <empty_line>
     * <version_log> <= this is what we need to extract
     * <empty_line>
     * <empty_line>
     * # <version_number> (<date>)
     * <empty_line>
     * <version_log>
     * ...
     */

    const regex = new RegExp(`#.*${EOL}${EOL}([\\s\\S]*?)${EOL}${EOL}${EOL}`);

    return regex.exec(shell.cat(CHANGELOG_FILE))[1];
};

const stopToUpdateChangelog = async (): Promise<boolean> => {
    const answer = await inquirer.prompt({
        message: `Review '${CHANGELOG_FILE}'. Do you want to continue?`,
        name: 'shouldContinue',
        type: 'confirm'
    });

    return answer.shouldContinue;
};

const tagNewVersion = async (version: string): Promise<void> => {
    await exec('Commit changes and tag a new version.', `git add -A && git commit -m "v${version}" && git tag -a "${version}" -m "v${version}"`);
};

const updateFile = async (filePath: string, content): Promise<void> => {
    await exec(`Update '${filePath}' file.`, () => {
        const writeContent = shell['ShellString']; // eslint-disable-line dot-notation

        writeContent(content).to(filePath);
    });
};

const updateChangelog = async (changelogBody: string, version: string): Promise<void> => {
    await updateFile(CHANGELOG_FILE, `# ${version} (${getDate()})\n\n${changelogBody}\n${shell.cat(CHANGELOG_FILE)}`);
};

const updatePackageJSON = async (newVersion: SemVer): Promise<string> => {
    const version = await exec('Update version number from `package.json` and `package-lock.json`.', `npm --quiet version ${newVersion} --no-git-tag-version`);

    return version.substring(1, version.length);
};

const updateSnykSnapshotJSONFile = async () => {

    const downloadURL = 'https://snyk.io/partners/api/v2/vulndb/clientside.json';
    const downloadLocation = path.normalize('packages/rule-no-vulnerable-javascript-libraries/src/snyk-snapshot.json');

    const res = await promisify(request)({ url: downloadURL });

    if (res.body.message) {
        console.error(chalk.red(`Failed to get '${downloadURL}'.`));
        console.error(res.body);
        process.exit(1); // eslint-disable-line no-process-exit
    }

    await updateFile(downloadLocation, res.body);

    await exec(`Commit updated version (if exists) of '${downloadLocation}'.`, `git reset HEAD && git add ${downloadLocation} && git diff --cached --quiet ${downloadLocation} || git commit -m "Update: \`snyk-snapshot.json\`"`);
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const main = async () => {
    await updateSnykSnapshotJSONFile();

    // const commitSHAsSinceLastRelease = await getCommitsSinceLastRelease();
    // const { version: newVersion, body: changelogBody } = getChangelogData(commitSHAsSinceLastRelease);
    //
    // if (!changelogBody) {
    //     return;
    // }
    //
    // // Update version in `package.json` and `package-lock.json`.
    // const version = await updatePackageJSON(newVersion);
    //
    // // Update changelog file.
    // await updateChangelog(changelogBody, version);
    //
    // // Allow users to tweak the changelog file.
    // if ((await stopToUpdateChangelog()) === false) {
    //     return;
    // }
    //
    // // Commit changes and tag a new version.
    // await tagNewVersion(version);
    //
    // // Push changes upstreem.
    // await exec('Push changes upstream.', `git push origin master "${version}"`);
    //
    // // Extract the release notes from the updated changelog file.
    // const releaseNotes = await exec('Get release notes', getReleaseNotes);
    //
    // // Create new release.
    // await createRelease(version, releaseNotes);
    //
    // #<{(|
    //  * Remove devDependencies, this will update `package-lock.json`.
    //  * Need to do so they aren't published on the `npm` package.
    //  |)}>#
    // await exec('Remove devDependencies', 'npm prune --production');
    //
    // #<{(|
    //  * Create shrinkwrap file.
    //  * (This is done because `npm` doesn't
    //  *  publish the `package-lock` file)
    //  |)}>#
    // await exec(`Create '${SHRINKWRAP_FILE}' `, 'npm shrinkwrap');
    //
    // // Publish on `npm`.
    // await exec('Publish on `npm`.', 'npm publish');
    //
    // // Restore the package lock file and delete shrinkwrap
    // shell.rm(SHRINKWRAP_FILE);
    // await exec(`Restore ${PACKAGE_LOCK_FILE}`, `git checkout ${PACKAGE_LOCK_FILE}`);
};

main();
