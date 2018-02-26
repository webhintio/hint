import { EOL } from 'os';
import * as path from 'path';

import * as inquirer from 'inquirer';
import * as Listr from 'listr';
import * as listrInput from 'listr-input';
import { promisify } from 'util';
import * as request from 'request';
import * as shell from 'shelljs';
import * as semver from 'semver';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/*
 * We only use these 3 values for now.
 * See also: https://docs.npmjs.com/cli/version#description.
 */

type SemverIncrement = 'patch' | 'minor' | 'major';

type ChangelogData = {
    releaseNotes: string;
    semverIncrement: SemverIncrement;
};

type Commit = {
    associatedIssues: string[];
    sha: string;
    tag: string;
    title: string;
};

type ExecResult = {
    code: number;
    stderr: string;
    stdout: string;
};

type GitHub = {
    token?: string;
    tokenID?: number;
    userName?: string;
    password?: string;
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const GITHUB: GitHub = {};

const REPOSITORY_SLUG = 'sonarwhal/sonarwhal';
const REPOSITORY_URL = `https://github.com/${REPOSITORY_SLUG}`;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

shell.config.silent = true;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const exec = (cmd): Promise<ExecResult> => {
    return new Promise((resolve, reject) => {
        shell.exec(cmd, (code, stdout, stderr) => {
            const result = {
                code,
                stderr: stderr && stderr.trim(),
                stdout: stdout && stdout.trim()
            };

            if (code === 0) {
                return resolve(result);
            }

            return reject(result);
        });
    });
};

const removePackageFiles = (dir: string = 'packages/*') => {
    shell.rm('-rf',
        `${dir}/dist`,
        `${dir}/node_modules`,
        `${dir}/npm-shrinkwrap.json`,
        `${dir}/package-lock.json`,
        `${dir}/yarn.lock`
    );
};

const cleanup = (ctx) => {
    removePackageFiles(ctx.packagePath);
    delete ctx.packageNewTag;
};

const createGitHubToken = async (showInitialMessage = true) => {

    if (showInitialMessage) {
        console.log('Create GitHub token\n');
    }

    const questions = [{
        message: 'GitHub username:',
        name: 'username',
        type: 'input'
    }, {
        message: 'GitHub password:',
        name: 'password',
        type: 'password'
    }, {
        message: 'GitHub OTP:',
        name: 'otp',
        type: 'input'
    }];

    const answers = await inquirer.prompt(questions);

    const res = await promisify(request)({
        auth: {
            pass: answers.password,
            user: answers.username
        },
        body: {
            note: `sonarwhal release script (${new Date()})`,
            scopes: ['repo']
        },
        headers: {
            'User-Agent': 'Nellie The Narwhal',
            'X-GitHub-OTP': answers.otp
        },
        json: true,
        method: 'POST',
        url: 'https://api.github.com/authorizations'
    });

    if (res.statusCode !== 201) {
        console.error(`\nError: ${res.body.message}\n`);
        await createGitHubToken(false);
    } else {
        GITHUB.password = answers.password;
        GITHUB.token = res.body.token;
        GITHUB.tokenID = res.body.id;
        GITHUB.userName = answers.username;
    }
};

const updateFile = (filePath: string, content: string) => {
    const writeContent = shell['ShellString']; // eslint-disable-line dot-notation

    writeContent(content).to(filePath);
};

const createRelease = async (tag: string, releaseNotes: string) => {
    const res = await promisify(request)({
        body: {
            body: releaseNotes,
            name: tag,
            tag_name: tag // eslint-disable-line camelcase
        },
        headers: {
            Authorization: `token ${GITHUB.token}`,
            'User-Agent': 'Nellie The Narwhal'
        },
        json: true,
        method: 'POST',
        url: `https://api.github.com/repos/${REPOSITORY_SLUG}/releases`
    });

    if (res.statusCode !== 201) {
        throw new Error(res.body.message);
    }
};

const downloadFile = async (downloadURL: string, downloadLocation: string) => {
    const res = await promisify(request)({ url: downloadURL });

    if (res.body.message) {
        throw new Error(res.body.message);
    }

    await updateFile(downloadLocation, res.body);

    await exec('git reset HEAD');
    await exec(`git add ${downloadLocation}`);

    if ((await exec(`git diff --cached "${downloadLocation}"`)).stdout) {
        await exec(`git commit -m "Update: \\\`${path.basename(downloadLocation)}\\\`"`);
    }
};

const extractDataFromCommit = async (sha: string): Promise<Commit> => {
    const commitBodyLines = (await exec(`git show --no-patch --format=%B ${sha}`)).stdout.split('\n');

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

const gitCommitChanges = async (commitMessage: string) => {
    // Add all changes to the staging aread.
    await exec(`git add -A`);

    /*
     * If there aren't any changes in the staging area,
     * skip the following.
     */
    if (!(await exec('git status --porcelain')).stdout) {

        return;
    }

    // Otherwise commit the changes.
    await exec(`git commit -m "${commitMessage}"`);
};

const gitCommitBuildChanges = async (ctx) => {
    await gitCommitChanges(`🚀 ${ctx.packageName} - v${ctx.newPackageVersion}`);
};

const deleteGitHubToken = async () => {

    console.log('\nDelete GitHub token\n');

    const questions = [{
        message: 'GitHub OTP:',
        name: 'otp',
        type: 'input'
    }];

    const answers = await inquirer.prompt(questions);

    const res = await promisify(request)({
        auth: {
            pass: GITHUB.password,
            user: GITHUB.userName
        },
        headers: {
            'User-Agent': 'Nellie The Narwhal',
            'X-GitHub-OTP': answers.otp
        },
        method: 'DELETE',
        url: `https://api.github.com/authorizations/${GITHUB.tokenID}`
    });

    if (res.statusCode !== 204) {
        console.error(`Failed to delete GitHub Token: ${GITHUB.tokenID}`);
    }
};

const prettyPrintArray = (a: string[]): string => {
    return [a.slice(0, -1).join(', '), a.slice(-1)[0]].join(a.length < 2 ? '' : ', and ');
};

const prettyPrintCommit = (commit: Commit): string => {
    let result = `* [[\`${commit.sha.substring(0, 10)}\`](${REPOSITORY_URL}/commit/${commit.sha})] - ${commit.title}`;

    const issues = commit.associatedIssues.map((issue) => {
        return `[\`#${issue}\`](${REPOSITORY_URL}/issues/${issue})`;
    });

    if (issues.length > 0) {
        result = `${result} (see also: ${prettyPrintArray(issues)})`;
    }

    return `${result}.`;
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

const getChangelogContent = (ctx) => {
    return `# ${ctx.newPackageVersion} (${getDate()})\n\n${ctx.packageReleaseNotes}\n`;
};

const getChangelogData = (commits: Array<Commit>, packageName: string): ChangelogData => {

    /*
     * Note: Commits that use tags that do not denote user-facing
     * changes will not be included in changelog file, and the
     * release notes.
     */

    const breakingChanges = generateChangelogSection('Breaking Changes', ['Breaking'], commits);
    const bugFixesAndImprovements = generateChangelogSection('Bug fixes / Improvements', ['Docs', 'Fix'], commits);
    const newFeatures = generateChangelogSection('New features', ['New', 'Update'], commits);

    let releaseNotes = '';

    releaseNotes += breakingChanges ? `${breakingChanges}\n` : '';
    releaseNotes += bugFixesAndImprovements ? `${bugFixesAndImprovements}\n` : '';
    releaseNotes += newFeatures ? `${newFeatures}\n` : '';

    // Determine semver version.

    let semverIncrement: SemverIncrement = 'patch';

    if (breakingChanges) {
        // TODO: Remove this once `sonarwhal` v1.0.0 is released.
        if (packageName === 'sonarwhal') {
            semverIncrement = 'minor';
        } else {
            semverIncrement = 'major';
        }
    } else if (newFeatures) {
        semverIncrement = 'minor';
    }

    return {
        releaseNotes,
        semverIncrement
    };
};

const getCommitsSinceLastRelease = async (packagePath: string, lastRelease: string): Promise<Commit[]> => {
    const commits = [];
    const commitSHAsSinceLastRelease = (await exec(`git rev-list master...${lastRelease} ${packagePath}`)).stdout;

    if (!commitSHAsSinceLastRelease) {
        return commits;
    }

    const shas = commitSHAsSinceLastRelease.split('\n');

    for (const sha of shas) {
        const data = await extractDataFromCommit(sha);

        commits.push(data);
    }

    return commits;
};

const getCommitSHAsSinceLastRelease = async (ctx) => {
    ctx.commitSHAsSinceLastRelease = await getCommitsSinceLastRelease(ctx.packagePath, ctx.packageLastTag);
};

const getLastReleasedVersionNumber = async (ctx) => {
    const packageJSONFileContent = (await exec(`git show ${ctx.packageLastTag}:${ctx.packageJSONFilePath}`)).stdout;

    ctx.packageLastReleaseVersion = (JSON.parse(packageJSONFileContent)).version;
};

const getReleaseData = (ctx) => {
    ({
        semverIncrement: ctx.packageSemVerIncrement,
        releaseNotes: ctx.packageReleaseNotes
    } = getChangelogData(ctx.commitSHAsSinceLastRelease, ctx.packageName));

    if (!ctx.packageReleaseNotes) {
        ctx.skipRemainingTasks = true;
    }
};

const getReleaseNotes = (changelogFilePath: string): string => {

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

    return regex.exec(shell.cat(changelogFilePath))[1];
};

const gitCreateRelease = async (ctx) => {
    await createRelease(ctx.packageNewTag, getReleaseNotes(ctx.changelogFilePath));
};

const gitDeleteTag = async (tag: string) => {
    if ((await exec(`git tag --list "${tag}"`)).stdout) {
        await exec(`git tag -d ${tag}`);
    }
};

const gitGetLastTaggedRelease = async (ctx) => {
    ctx.packageLastTag = (await exec(`git describe --tags --abbrev=0 --match "${ctx.packageName}-v*"`)).stdout;
};

const gitPush = async (ctx) => {
    await exec(`git push origin master ${ctx.packageNewTag}`);
};

const gitReset = async () => {
    await exec(`git reset --quiet HEAD && git checkout --quiet .`);
};

const gitTagNewVersion = async (ctx) => {
    ctx.packageNewTag = `${ctx.packageName}-v${ctx.newPackageVersion}`;

    await gitDeleteTag(ctx.packageNewTag);
    await exec(`git tag -a "${ctx.packageNewTag}" -m "${ctx.packageNewTag}"`);
};

const newTask = (title: string, task, condition?: boolean) => {
    return {
        enabled: (ctx) => {
            return !ctx.skipRemainingTasks || condition;
        },
        task,
        title
    };
};

const npmInstall = async (ctx) => {
    await exec(`cd ${ctx.packagePath} && npm install`);
};

const npmPublish = (ctx, message = 'Enter OTP: ') => {
    return listrInput(message, {
        done: async (otp) => {
            await exec(`cd ${ctx.packagePath} && npm publish ${ctx.isUnpublishedPackage ? '--access public' : ''} --otp=${otp}`);
        }
    }).catch((err) => {
        if (err.stderr.indexOf('You must provide a one-time pass') !== -1) {
            return npmPublish(ctx, 'OTP was incorrect, try again:');
        }

        throw new Error(err);
    });
};

const npmRemoveDevDependencies = async (ctx) => {
    /*
     * Remove devDependencies, this will update `package-lock.json`.
     * Need to do so they aren't published on the `npm` package.
     */
    await exec(`cd ${ctx.packagePath} && npm prune --production`);
};

const npmRemovePrivateField = (ctx) => {
    delete ctx.packageJSONFileContent.private;
    updateFile(ctx.packageJSONFilePath, `${JSON.stringify(ctx.packageJSONFileContent, null, 2)}\n`);
};

const npmRunBuildForRelease = async (ctx) => {
    await exec(`cd ${ctx.packagePath} && npm run build-release`);
};

const npmRunTests = async (ctx) => {
    await exec(`cd ${ctx.packagePath} && npm test`);
};

const npmShrinkwrap = async (ctx) => {
    /*
     * (This is done because `npm` doesn't
     *  publish the `package-lock` file)
     */
    await exec(`cd ${ctx.packagePath} && npm shrinkwrap`);
};

const npmUpdateVersion = async (ctx) => {
    const version = (await exec(`cd ${ctx.packagePath} && npm --quiet version ${ctx.packageSemVerIncrement} --no-git-tag-version`)).stdout;

    /*
     * `verstion` will be something such as `vX.X.X`,
     *  so the `v` will need to be removed.
     */
    ctx.newPackageVersion = version.substring(1, version.length);
};

const updateChangelog = (ctx) => {
    if (!ctx.isUnpublishedPackage) {
        updateFile(ctx.changelogFilePath, `${getChangelogContent(ctx)}${shell.cat(ctx.changelogFilePath)}`);
    } else {
        ctx.packageReleaseNotes = '✨';
        updateFile(ctx.changelogFilePath, getChangelogContent(ctx));
    }
};

const updateConnectivityIni = async () => {
    await downloadFile(
        'https://raw.githubusercontent.com/WPO-Foundation/webpagetest/master/www/settings/connectivity.ini.sample',
        path.normalize('packages/rule-performance-budget/src/connections.ini')
    );
};

const updateSnykSnapshot = async () => {
    await downloadFile(
        'https://snyk.io/partners/api/v2/vulndb/clientside.json',
        path.normalize('packages/rule-no-vulnerable-javascript-libraries/src/snyk-snapshot.json')
    );
};

const updateSonarwhalVersionNumber = async (ctx) => {
    const packages = [...shell.ls('-d', `packages/!(${ctx.packageName})`)];

    for (const pkg of packages) {

        const packageJSONFilePath = `${pkg}/package.json`;
        const packageJSONFileContent = require(`../../${packageJSONFilePath}`);

        const sonarwhalDevDependencyRange = packageJSONFileContent.devDependencies.sonarwhal;
        const sonarwhalPeerDependencyRange = packageJSONFileContent.peerDependencies.sonarwhal;

        /*
         * Update the sonarwhal `devDependency` and `peerDependency`.
         * (This is done so that everything is keeped in sync)
         */

        if (sonarwhalDevDependencyRange) {
            packageJSONFileContent.devDependencies.sonarwhal = `^${ctx.newPackageVersion}`;
        }

        if (sonarwhalPeerDependencyRange) {
            packageJSONFileContent.peerDependencies.sonarwhal = `^${ctx.newPackageVersion}`;
        }

        if (sonarwhalDevDependencyRange || sonarwhalPeerDependencyRange) {
            updateFile(`${packageJSONFilePath}`, `${JSON.stringify(packageJSONFileContent, null, 2)}\n`);
        }
    }

    const semverIncrement = semver.diff(ctx.packageVersion, ctx.newPackageVersion);

    // `semver.diff` returns null if the versions are the same.

    if (!semverIncrement) {
        return;
    }

    // patch, prepatch, or prerelease
    let commitPrefix = 'Chore:';

    /*
     * TODO: Update this to include only `major` and `premajor`
     *       once `sonarwhal` reaches v1.
     */
    if (['minor', 'preminor', 'major', 'premajor'].includes(semverIncrement)) {
        commitPrefix = 'Breaking:';
    }

    await gitCommitChanges(`${commitPrefix} \\\`${ctx.packageName}\\\` to \\\`v${ctx.newPackageVersion}\\\``);
};

const waitForUser = async () => {
    return await listrInput('Press any key once you are done with the review:');
};

const getTasks = (packagePath: string) => {

    const packageName = packagePath.substring(packagePath.lastIndexOf('/') + 1);
    const packageJSONFileContent = require(`../../${packagePath}/package.json`);

    const tasks = [];

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    tasks.push({
        task: (ctx) => {
            ctx.skipRemainingTasks = false;

            ctx.packagePath = packagePath;
            ctx.packageName = ctx.packagePath.substring(ctx.packagePath.lastIndexOf('/') + 1);

            ctx.changelogFilePath = `${ctx.packagePath}/CHANGELOG.md`;
            ctx.packageJSONFilePath = `${ctx.packagePath}/package.json`;
            ctx.packageLockJSONFilePath = `${ctx.packagePath}/package-lock.json`;
            ctx.shrinkwrapFilePath = `${ctx.packagePath}/npm-shrinkwrap.json`;

            ctx.packageJSONFileContent = packageJSONFileContent;

            ctx.packageVersion = ctx.packageJSONFileContent.version;
            ctx.isUnpublishedPackage = ctx.packageJSONFileContent.private === true;
        },
        title: `Get package information.`
    });

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Update package related files.

    if (packageName === 'rule-no-vulnerable-javascript-libraries') {
        tasks.push(newTask('Update `snyk-snapshot.json`', updateSnykSnapshot));
    }

    if (packageName === 'rule-performance-budget') {
        tasks.push(newTask('Update `connections.ini`', updateConnectivityIni));
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Unpublished package tasks.

    if (packageJSONFileContent.private === true) {
        tasks.push(
            newTask('Remove `"private": true` from the `package.json` file.', npmRemovePrivateField),
            newTask('Update `CHANGELOG.md` file.', updateChangelog)
        );
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Unpublished package tasks.

    if (!packageJSONFileContent.private) {
        tasks.push(
            newTask('Get last tagged release.', gitGetLastTaggedRelease),
            newTask('Get last released version number.', getLastReleasedVersionNumber),
            newTask('Get commits SHAs since last release.', getCommitSHAsSinceLastRelease),
            newTask('Get release notes and semver increment.', getReleaseData),
            newTask('Update version in `package.json`.', npmUpdateVersion),
            newTask('Update `CHANGELOG.md` file.', updateChangelog),
            newTask(`Review 'CHANGELOG.md'.`, waitForUser)
        );
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Common tasks.

    tasks.push(
        newTask('Install dependencies.', npmInstall),
        newTask('Run tests.', npmRunTests),
        newTask('Run release build.', npmRunBuildForRelease),
        newTask('Commit changes.', gitCommitBuildChanges),
        newTask('Tag new version.', gitTagNewVersion),
        newTask('Remove `devDependencies`.', npmRemoveDevDependencies),
        newTask('Create `npm-shrinkwrap.json` file.', npmShrinkwrap),
        newTask(`Publish on npm.`, npmPublish),
        newTask(`Push changes upstream.`, gitPush),
        newTask(`Create release.`, gitCreateRelease)
    );

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    if (packageName === 'sonarwhal') {
        tasks.push(newTask('Update `sonarwhal` version numbers.', updateSonarwhalVersionNumber, packageName === 'sonarwhal'));
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    tasks.push(newTask(`Cleanup.`, cleanup));

    return new Listr(tasks);
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const main = async () => {

    await gitReset();
    await createGitHubToken();

    const packages = ['packages/sonarwhal', ...shell.ls('-d', 'packages/rule-*')];
    const tasks = [];

    for (const pkg of packages) {
        tasks.push({
            task: () => {
                return getTasks(pkg);
            },
            title: `${pkg}`
        });
    }

    new Listr(tasks).run()
        .catch(async (err) => {
            console.error(err);

            // Try to revert things to their previous state.

            await gitDeleteTag(err.context.packageNewTag);
            await removePackageFiles();
            await gitReset();
            await deleteGitHubToken();
        });

    await deleteGitHubToken();
};

main();
