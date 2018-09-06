import { EOL } from 'os';
import * as path from 'path';

import { argv } from 'yargs';
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

const REPOSITORY_SLUG = 'webhintio/hint';
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
    ctx = {}; // eslint-disable-line no-param-reassign
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
            note: `webhint release script (${new Date()})`,
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

const gitCommitChanges = async (commitMessage: string, skipCI: boolean = false) => {
    // Add all changes to the staging aread.
    await exec(`git add packages yarn.lock`);

    /*
     * If there aren't any changes in the staging area,
     * skip the following.
     */
    if (!(await exec('git status --porcelain')).stdout) {

        return;
    }

    // Otherwise commit the changes.
    await exec(`git commit -m "${commitMessage}${skipCI ? ' [skip ci]' : ''}"`);
};

const gitCommitBuildChanges = async (ctx) => {
    await gitCommitChanges(`🚀 ${ctx.packageName} - v${ctx.newPackageVersion}`, true);
};

const gitCommitPrerelease = async () => {
    await gitCommitChanges(`🚀 Prerelease`, true);
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

const getCommitAuthorInfo = async (commitSHA: string): Promise<object> => {
    let commitInfo;

    // Get commit related info.

    const responseForCommitInfoRequest = await promisify(request)({
        headers: {
            Authorization: `token ${GITHUB.token}`,
            'User-Agent': 'Nellie The Narwhal'
        },
        method: 'GET',
        url: `https://api.github.com/repos/${REPOSITORY_SLUG}/commits/${commitSHA}`
    });

    if (responseForCommitInfoRequest.statusCode === 200) {
        try {
            commitInfo = JSON.parse(responseForCommitInfoRequest.body);
        } catch (e) {
            // Ignore as it's not important.
        }
    }

    if (!commitInfo) {
        return null;
    }

    /*
     * Get commit author related info.
     *
     * This is done because the previous request doesn't provide
     * the user name, only the user name associated with the commit,
     * which in most cases, is wrongly set.
     */

    const responseForUserInfoRequest = await promisify(request)({
        headers: {
            Authorization: `token ${GITHUB.token}`,
            'User-Agent': 'Nellie The Narwhal'
        },
        method: 'GET',
        url: `https://api.github.com/users/${commitInfo.author.login}`
    });

    if (responseForUserInfoRequest.statusCode === 200) {
        try {
            const response = JSON.parse(responseForUserInfoRequest.body);

            if (response.name) {
                return {
                    gitHubProfileURL: response.html_url,
                    /*
                     * Get the user name, and if one is not provided,
                     * use the name associated with the commit.
                     */
                    name: response.name || commitInfo.commit.author.name
                };
            }
        } catch (e) {
            // Ignore as this is not important.
        }
    }

    return null;
};

const prettyPrintCommit = async (commit: Commit): Promise<string> => {

    let additionalInfo = false;
    let commitAuthorInfo = '';
    let issuesInfo = '';
    let result = `* [[\`${commit.sha.substring(0, 10)}\`](${REPOSITORY_URL}/commit/${commit.sha})] - ${commit.title}`;

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Get commit author information.

    const commitAuthor = await getCommitAuthorInfo(commit.sha);

    if (commitAuthor) {
        commitAuthorInfo = `by [\`${(commitAuthor as any).name}\`](${(commitAuthor as any).gitHubProfileURL})`;
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
        result = `${result} (${commitAuthorInfo}${commitAuthorInfo && issuesInfo ? ' / ': ''}${issuesInfo})`;
    }

    return `${result}.`;
};

const generateChangelogSection = async (title: string, tags: Array<string>, commits: Array<Commit>): Promise<string> => {
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

const getChangelogContent = (ctx) => {
    return `# ${ctx.newPackageVersion} (${getDate()})\n\n${ctx.packageReleaseNotes}\n`;
};

const getChangelogData = async (commits: Array<Commit>): Promise<ChangelogData> => {

    /*
     * Note: Commits that use tags that do not denote user-facing
     * changes will not be included in changelog file, and the
     * release notes.
     */

    const breakingChanges = await generateChangelogSection('Breaking Changes', ['Breaking'], commits);
    const bugFixesAndImprovements = await generateChangelogSection('Bug fixes / Improvements', ['Docs', 'Fix'], commits);
    const newFeatures = await generateChangelogSection('New features', ['New', 'Update'], commits);

    let releaseNotes = '';

    releaseNotes += breakingChanges ? `${breakingChanges}\n` : '';
    releaseNotes += bugFixesAndImprovements ? `${bugFixesAndImprovements}\n` : '';
    releaseNotes += newFeatures ? `${newFeatures}\n` : '';

    // Determine semver version.

    let semverIncrement: SemverIncrement = 'patch';

    if (breakingChanges) {
        semverIncrement = 'major';
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

    ctx.packageVersion = (JSON.parse(packageJSONFileContent)).version;
};

const getVersionNumber = (ctx) => {
    ctx.newPackageVersion = ctx.packageJSONFileContent.version;
};

const getReleaseData = async (ctx) => {
    ({
        semverIncrement: ctx.packageSemverIncrement,
        releaseNotes: ctx.packageReleaseNotes
    } = await getChangelogData(ctx.commitSHAsSinceLastRelease));

    if (!ctx.isPrerelease && !ctx.packageReleaseNotes) {
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
    if (!ctx.isUnpublishedPackage) {
        await createRelease(ctx.packageNewTag, getReleaseNotes(ctx.changelogFilePath));
    } else {
        await createRelease(ctx.packageNewTag, `${shell.cat(ctx.changelogFilePath)}`);
    }
};

const gitDeleteTag = async (tag: string) => {
    if ((await exec(`git tag --list "${tag}"`)).stdout) {
        await exec(`git tag -d ${tag}`);
    }
};

const gitFetchTags = async () => {
    await exec('git fetch --tags');
};

const gitGetLastTaggedRelease = async (ctx) => {
    ctx.packageLastTag = (await exec(`git describe --tags --abbrev=0 --match "${ctx.packageName}-v*"`)).stdout;
};

const gitPush = async (ctx) => {
    await exec(`git push origin master ${ctx.packageNewTag ? ctx.packageNewTag : ''}`);
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

const npmPublish = (ctx) => {
    return listrInput('Enter OTP: ', {
        done: async (otp) => {
            if (!ctx.isPrerelease) {
                await exec(`cd ${ctx.packagePath} && npm publish ${ctx.isUnpublishedPackage ? '--access public' : ''} --otp=${otp}`);
            } else {
                await exec(`cd ${ctx.packagePath} && npm publish --otp=${otp} --tag next`);
            }
        }
    }).catch((err) => {
        if (err.stderr.indexOf('you already provided a one-time password then it is likely that you either typoed') !== -1) {
            return npmPublish(ctx);
        }

        ctx.npmPublishError = err;

        throw new Error(JSON.stringify(err));
    });
};

const npmRemovePrivateField = (ctx) => {
    delete ctx.packageJSONFileContent.private;
    updateFile(ctx.packageJSONFilePath, `${JSON.stringify(ctx.packageJSONFileContent, null, 2)}\n`);
};

const npmRunBuildForRelease = async (ctx) => {
    await exec(`cd ${ctx.packagePath} && npm run build-release`);
};

const npmRunTests = async (ctx) => {
    await exec(`cd ${ctx.packagePath} && npm run test`);
};

const npmUpdateVersion = async (ctx) => {
    const version = (await exec(`cd ${ctx.packagePath} && npm --quiet version ${ctx.packageSemverIncrement} --no-git-tag-version`)).stdout;

    /*
     * `verstion` will be something such as `vX.X.X`,
     *  so the `v` will need to be removed.
     */
    ctx.newPackageVersion = version.substring(1, version.length);
};

const npmUpdateVersionForPrerelease = (ctx) => {
    const newPrereleaseVersion = semver.inc(ctx.packageJSONFileContent.version, (`pre${ctx.packageSemverIncrement}` as any), ('beta' as any));

    ctx.packageJSONFileContent.version = newPrereleaseVersion;
    ctx.newPackageVersion = newPrereleaseVersion;

    updateFile(`${ctx.packageJSONFilePath}`, `${JSON.stringify(ctx.packageJSONFileContent, null, 2)}\n`);
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
        path.normalize('packages/hint-performance-budget/src/connections.ini')
    );
};

const updateSnykSnapshot = async () => {
    await downloadFile(
        'https://snyk.io/partners/api/v2/vulndb/clientside.json',
        path.normalize('packages/hint-no-vulnerable-javascript-libraries/src/snyk-snapshot.json')
    );
};

const commitUpdatedPackageVersionNumberInOtherPackages = async (ctx) => {

    const semverIncrement = semver.diff(ctx.packageVersion, ctx.newPackageVersion);

    // `semver.diff` returns `null` if the versions are the same.

    if (!semverIncrement) {
        return;
    }

    // patch, prepatch, or prerelease
    let commitPrefix = 'Chore:';

    if (['major', 'premajor'].includes(semverIncrement)) {
        commitPrefix = 'Breaking:';
    }

    await gitCommitChanges(`${commitPrefix} Update \\\`${ctx.packageName}\\\` to \\\`v${ctx.newPackageVersion}\\\``, true);
};

const updatePackageVersionNumberInOtherPackages = (ctx) => {
    const packages = [...shell.ls('-d', `packages/!(${ctx.packageName})`)];

    for (const pkg of packages) {

        const packageJSONFilePath = `${pkg}/package.json`;
        const packageJSONFileContent = require(`../../${packageJSONFilePath}`);
        const dependencyName = ctx.packageName === 'hint' ? ctx.packageName : `@hint/${ctx.packageName}`;

        let packageJSONFileHasBeenUpdated = false;

        [
            'dependencies',
            'devDependencies',
            'optionalDependencies',
            'peerDependencies'
        ].forEach((dependencyType) => {
            const dependencyRange = packageJSONFileContent[dependencyType] && packageJSONFileContent[dependencyType][dependencyName];

            if (dependencyRange) {
                packageJSONFileContent[dependencyType][dependencyName] = `^${ctx.newPackageVersion}`;
                packageJSONFileHasBeenUpdated = true;
            }
        });

        if (packageJSONFileHasBeenUpdated) {
            updateFile(`${packageJSONFilePath}`, `${JSON.stringify(packageJSONFileContent, null, 2)}\n`);
        }
    }
};

const updateYarnLockFile = async () => {
    await exec('yarn');
    await gitCommitChanges(`Chore: Update \\\`yarn.lock\\\` file`);
};

const waitForUser = async () => {
    return await listrInput('Press any key once you are done with the review:');
};

const getTasksForRelease = (packageName: string, packageJSONFileContent) => {

    const tasks = [];

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Update package related files.

    if (packageName === 'hint-no-vulnerable-javascript-libraries') {
        tasks.push(newTask('Update `snyk-snapshot.json`', updateSnykSnapshot));
    }

    if (packageName === 'hint-performance-budget') {
        tasks.push(newTask('Update `connections.ini`', updateConnectivityIni));
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Unpublished package tasks.

    if (packageJSONFileContent.private === true) {
        tasks.push(
            newTask('Get version number.', getVersionNumber),
            newTask('Remove `"private": true` from the `package.json` file.', npmRemovePrivateField),
            newTask('Update `CHANGELOG.md` file.', updateChangelog)
        );

        // Published package tasks.

    } else {
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

    // Common tasks for both published and unpublished packages.

    tasks.push(newTask('Install dependencies.', npmInstall));

    // `configurations` don't have tests or build step.

    if (!packageName.startsWith('configuration-')) {
        tasks.push(
            newTask('Run tests.', npmRunTests),
            newTask('Run release build.', npmRunBuildForRelease),
        );
    }

    tasks.push(
        newTask('Commit changes.', gitCommitBuildChanges),
        newTask('Tag new version.', gitTagNewVersion),
        newTask(`Publish on npm.`, npmPublish),
        newTask(`Push changes upstream.`, gitPush),
        newTask(`Create release.`, gitCreateRelease),

        /*
         * To keep things in sync, after a package is released,
         * update all other packages to use its newly released version.
         */

        newTask(`Update \`${packageName}\` version numbers in other packages.`, updatePackageVersionNumberInOtherPackages),
        newTask(`Commit updated \`${packageName}\` version numbers.`, commitUpdatedPackageVersionNumberInOtherPackages),
        newTask(`Push changes upstream.`, gitPush)
    );

    return tasks;
};

const getTaksForPrerelease = (packageName: string) => {

    const tasks = [];

    tasks.push(
        newTask('Get last tagged release.', gitGetLastTaggedRelease),
        newTask('Get commits SHAs since last release.', getCommitSHAsSinceLastRelease),
        newTask('Get semver increment.', getReleaseData),
        newTask('Update version in `package.json`.', npmUpdateVersionForPrerelease),
        newTask('Install dependencies.', npmInstall)
    );

    // `configurations` don't have tests or build step.

    if (!packageName.startsWith('configuration-')) {
        tasks.push(
            newTask('Run tests.', npmRunTests),
            newTask('Run release build.', npmRunBuildForRelease)
        );
    }

    tasks.push(
        newTask(`Publish on npm.`, npmPublish),
        newTask(`Update \`${packageName}\` version number in other packages.`, updatePackageVersionNumberInOtherPackages)
    );

    return tasks;
};

const getTasks = (packagePath: string) => {

    const packageName = packagePath.substring(packagePath.lastIndexOf('/') + 1);
    const packageJSONFileContent = require(`../../${packagePath}/package.json`);
    const isUnpublishedPackage = packageJSONFileContent.private === true;
    const isPrerelease = !!argv.prerelease;

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

            ctx.packageJSONFileContent = packageJSONFileContent;

            ctx.isUnpublishedPackage = isUnpublishedPackage;
            ctx.isPrerelease = isPrerelease;
        },
        title: `Get package information.`
    });

    if (!isPrerelease) {
        tasks.push(...getTasksForRelease(packageName, packageJSONFileContent));

        // For prereleases, ignore packages that have not yet been released.

    } else if (!isUnpublishedPackage) {
        tasks.push(...getTaksForPrerelease(packageName));
    }

    tasks.push(newTask(`Cleanup.`, cleanup));

    return new Listr(tasks);
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const main = async () => {

    const isPrerelease = argv.prerelease;

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    await gitFetchTags();

    /*
     * For prereleases the release logs are not published,
     * so there is no need to create a GitHub token.
     */

    if (!isPrerelease) {
        await createGitHubToken();
    }

    /*
     * Note: The order of the followings matters as some
     * packages depend on previous ones to be released first.
     */

    const exceptions = [
        'packages/parser-webpack-config',
        'packages/hint-webpack-config'
    ];

    if (process.platform !== 'win32') {
        exceptions.push('packages/connector-edge');
    }

    const packages = [
        'packages/hint',
        ...shell.ls('-d', 'packages/create-*'),
        ...shell.ls('-d', 'packages/utils-create-server'),
        ...shell.ls('-d', 'packages/utils-connector-tools'),
        ...shell.ls('-d', 'packages/utils-debugging-protocol-common'),
        ...shell.ls('-d', 'packages/parser-html'),
        ...shell.ls('-d', 'packages/connector-*'),
        ...shell.ls('-d', 'packages/utils-tests-helpers'),
        ...shell.ls('-d', 'packages/formatter-*'),
        ...shell.ls('-d', 'packages/parser-!(html)'),
        ...shell.ls('-d', 'packages/hint-*'),
        ...shell.ls('-d', 'packages/configuration-*')
    ].filter((name) => {
        return !exceptions.includes(name);
    });

    const tasks = [];

    for (const pkg of packages) {
        tasks.push({
            task: () => {
                return getTasks(pkg);
            },
            title: `${pkg}`
        });
    }

    /*
     * For prereleases no commits or tags
     * are done, just this one at the end.
     */

    if (isPrerelease) {
        tasks.push(
            newTask('Commit changes.', gitCommitPrerelease),
            newTask(`Push changes upstream.`, gitPush)
        );
    }

    tasks.push(newTask('Update `yarn.lock`', updateYarnLockFile));

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    await new Listr(tasks).run()
        .catch(async (err) => {
            console.error(typeof err === 'object' ? JSON.stringify(err, null, 4) : err);

            // Try to revert things to their previous state.

            await gitReset();
            await gitDeleteTag(err.context.packageNewTag);
            await removePackageFiles();
        });

    if (!isPrerelease) {
        await deleteGitHubToken();
    }
};

main();
