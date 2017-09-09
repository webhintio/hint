import { EOL } from 'os';
import { promisify } from 'util';
import * as path from 'path';

import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as request from 'request';
import * as shell from 'shelljs';

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

// We only use these 3 values for now.
// See also: https://docs.npmjs.com/cli/version#description.

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
    let result = `* [[\`${commit.sha.substring(0, 10)}\`](https://github.com/sonarwhal/sonar/commit/${commit.sha})] - ${commit.title}`;

    const issues = commit.associatedIssues.map((issue) => {
        return `[\`#${issue}\`](https://github.com/sonarwhal/sonar/issues/${issue})`;
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
        url: 'https://api.github.com/repos/sonarwhal/sonar/releases'
    });

    if (res.body.message) {
        console.error(chalk.red('* Create release.'));
        console.error(res.body);
        process.exit(1); // eslint-disable-line no-process-exit
    } else {
        console.log(chalk.green('* Create release.'));
    }
};

const exec = (msg: string, cmd: string | Function): string => {

    let result = '';

    try {
        result = typeof cmd === 'string' ? shell.exec(cmd).stdout : (cmd() || '');
    } catch (e) {
        console.error(chalk.red(`${msg}`));
        console.error(e);
        process.exit(1); // eslint-disable-line no-process-exit
    }

    console.log(chalk.green(`${msg}`));

    return result.trim();
};

const extractDataFromCommit = (sha: string): Commit => {
    const commitBodyLines = exec(`- Get commit data for: ${sha}.`, `git show --no-patch  --format=%B ${sha}`).split('\n');

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

    // Note: Commits that use tags that do not denote user-facing
    // changes will not be included in changelog file, and the
    // release notes.

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

const getCommitsSinceLastRelease = (): Array<Commit> => {
    const commitSHAsSinceLastRelease = exec('Get commits since last releases.', `git rev-list master...${PKG.version}`).split('\n');

    const commits = [];

    commitSHAsSinceLastRelease.forEach((sha) => {
        commits.push(extractDataFromCommit(sha));
    });

    return commits;
};

const getReleaseNotes = (): string => {

    // The change log is structured as follows:
    //
    // # <version_number> (<date>)
    // <empty_line>
    // <version_log> <= this is what we need to extract
    // <empty_line>
    // <empty_line>
    // # <version_number> (<date>)
    // <empty_line>
    // <version_log>
    // ...

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

const tagNewVersion = (version: string) => {
    exec('Commit changes and tag a new version.', `git add -A && git commit -m "v${version}" && git tag -a "${version}" -m "v${version}"`);
};

const updateFile = (filePath: string, content) => {
    exec(`Update '${filePath}' file.`, () => {
        const writeContent = shell['ShellString']; // eslint-disable-line new-cap, dot-notation

        writeContent(content).to(filePath);
    });
};

const updateChangelog = (changelogBody: string, version: string) => {
    updateFile(CHANGELOG_FILE, `# ${version} (${getDate()})\n\n${changelogBody}\n${shell.cat(CHANGELOG_FILE)}`);
};

const updatePackageJSON = (newVersion: SemVer): string => {
    const version = exec('Update version number from `package.json` and `package-lock.json`.', `npm --quiet version ${newVersion} --no-git-tag-version`);

    return version.substring(1, version.length);
};

const updateSnykSnapshotJSONFile = async () => {

    const downloadURL = 'https://snyk.io/partners/api/v2/vulndb/clientside.json';
    const downloadLocation = path.normalize('src/lib/rules/no-vulnerable-javascript-libraries/snyk-snapshot.json');

    const res = await promisify(request)({ url: downloadURL });

    if (res.body.message) {
        console.error(chalk.red(`Failed to get '${downloadURL}'.`));
        console.error(res.body);
        process.exit(1); // eslint-disable-line no-process-exit
    }

    updateFile(downloadLocation, res.body);

    exec(`Commit updated version (if exists) of '${downloadLocation}'.`, `git reset HEAD && git add ${downloadLocation} && git diff --cached --quiet ${downloadLocation} || git commit -m "Update: \`snyk-snapshot.json\`"`);

};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const main = async () => {

    await updateSnykSnapshotJSONFile();

    const commitSHAsSinceLastRelease = getCommitsSinceLastRelease();
    const { version: newVersion, body: changelogBody } = getChangelogData(commitSHAsSinceLastRelease);

    if (!changelogBody) {
        return;
    }

    // Update version in `package.json` and `package-lock.json`.
    const version = updatePackageJSON(newVersion);

    // Update changelog file.
    updateChangelog(changelogBody, version);

    // Allow users to tweak the changelog file.
    if ((await stopToUpdateChangelog()) === false) {
        return;
    }

    // Commit changes and tag a new version.
    await tagNewVersion(version);

    // Push changes upstreem.
    exec('Push changes upstream.', `git push origin master "${version}"`);

    // Extract the release notes from the updated changelog file.
    const releaseNotes = await getReleaseNotes();

    // Create new release.
    await createRelease(version, releaseNotes);

    // Create shrinkwrap file.
    // (This is done because `npm` doesn't
    //  publish the `package-lock` file)
    exec(`Create '${SHRINKWRAP_FILE}' `, 'npm shrinkwrap');

    // Publish on `npm`.
    exec('Publish on `npm`.', 'npm publish');

    // Restore the package lock file.
    shell.mv(SHRINKWRAP_FILE, PACKAGE_LOCK_FILE);
};

main();
