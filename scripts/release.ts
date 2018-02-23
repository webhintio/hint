import * as path from 'path';

import * as inquirer from 'inquirer';
import * as Listr from 'listr';
import * as listrInput from 'listr-input';
import { promisify } from 'util';
import * as request from 'request';
import * as shell from 'shelljs';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

/*
 * We only use these 3 values for now.
 * See also: https://docs.npmjs.com/cli/version#description.
 */

type SemVerIncrement = 'patch' | 'minor' | 'major';

type ChangelogData = {
    releaseNotes: string;
    semVerIncrement: SemVerIncrement;
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

const deleteTag = async (tag: string) => {
    if ((await exec(`git tag --list "${tag}"`)).stdout) {
        await exec(`git tag -d ${tag}`);
    }
};

const updateFile = (filePath: string, content: string) => {
    const writeContent = shell['ShellString']; // eslint-disable-line dot-notation

    writeContent(content).to(filePath);
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
    return `# ${ctx.packageVersion} (${getDate()})\n\n${ctx.packageReleaseNotes}\n`;
};

const getChangelogData = (commits: Array<Commit>, packageName: string): ChangelogData => {

    /*
     * Note: Commits that use tags that do not denote user-facing
     * changes will not be included in changelog file, and the
     * release notes.
     */

    const breakingChanges = generateChangelogSection('Breaking Changes', ['Breaking'], commits);
    const bugFixesAndImprovements = generateChangelogSection('Bug fixes / Improvements', ['Docs', 'Fix', 'Update'], commits);
    const newFeatures = generateChangelogSection('New features', ['New'], commits);

    let releaseNotes = '';

    releaseNotes += breakingChanges ? `${breakingChanges}\n` : '';
    releaseNotes += bugFixesAndImprovements ? `${bugFixesAndImprovements}\n` : '';
    releaseNotes += newFeatures ? `${newFeatures}\n` : '';

    // Determine semver version.

    let semVerIncrement: SemVerIncrement = 'patch';

    if (breakingChanges) {
        // TODO: Remove this once `sonarwhal` v1.0.0 is released.
        if (packageName === 'sonarwhal') {
            semVerIncrement = 'minor';
        } else {
            semVerIncrement = 'major';
        }
    } else if (newFeatures) {
        semVerIncrement = 'minor';
    }

    return {
        releaseNotes,
        semVerIncrement
    };
};

const gitReset = async () => {
    await exec(`git reset --quiet HEAD && git checkout --quiet .`);
};

const publishOnNPM = (ctx, message = 'Enter OTP: ') => {
    return listrInput(message, {
        done: async (otp) => {
            await exec(`npm publish ${ctx.isUnpublishedPackage ? '--access public' : ''} --otp=${otp}`);
        }
    }).catch((err) => {
        if (err.stderr.indexOf('You must provide a one-time pass') !== -1) {
            return publishOnNPM(ctx, 'OTP was incorrect, try again:');
        }

        throw new Error(err);
    });
};

const removePackageFiles = () => {
    shell.rm('-rf',
        `packages/*/dist`,
        `packages/*/node_modules`,
        `packages/*/npm-shrinkwrap.json`,
        `packages/*/package-lock.json`,
        `packages/*/yarn.lock`
    );
};

const getUnpublishedPackageTasks = () => {
    return [
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: (ctx) => {
                delete ctx.packageJSONFileContent.private;
                updateFile(ctx.packageJSONFilePath, `${JSON.stringify(ctx.packageJSONFileContent, null, 2)}\n`);
            },
            title: 'Remove `"private": true` from the `package.json` file.'
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: (ctx) => {
                ctx.packageReleaseNotes = '✨';
                updateFile(ctx.changelogFilePath, getChangelogContent(ctx));
            },
            title: 'Update `CHANGELOG.md` file.'
        }
    ];
};

const getPublishedPackageTasks = () => {
    return [
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: async (ctx) => {
                ctx.packageLastTag = (await exec(`git describe --tags --abbrev=0 --match "${ctx.packageName}-v*"`)).stdout;
            },
            title: 'Get last tagged release.'
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: async (ctx) => {
                const packageJSONFileContent = (await exec(`git show ${ctx.packageLastTag}:${ctx.packageJSONFilePath}`)).stdout;

                ctx.packageLastReleaseVersion = (JSON.parse(packageJSONFileContent)).version;
            },
            title: 'Get last released version number.'
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: async (ctx) => {
                ctx.commitSHAsSinceLastRelease = await getCommitsSinceLastRelease(ctx.packagePath, ctx.packageLastTag);

            },
            title: 'Get commits SHAs since last release.'
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: (ctx) => {
                ({
                    semVerIncrement: ctx.packageSemVerIncrement,
                    releaseNotes: ctx.packageReleaseNotes
                } = getChangelogData(ctx.commitSHAsSinceLastRelease, ctx.packageName));

                if (!ctx.packageReleaseNotes) {
                    ctx.skipRemainingTasks = true;
                }
            },
            title: 'Get release notes and semver increment.'
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: async (ctx) => {
                const version = (await exec(`cd ${ctx.packagePath} && npm --quiet version ${ctx.packageSemVerIncrement} --no-git-tag-version`)).stdout;

                /*
                 * `verstion` will be something such as `vX.X.X`,
                 *  so the `v` will need to be removed.
                 */
                ctx.packageVersion = version.substring(1, version.length);
            },
            title: 'Update version in `package.json`.'
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: (ctx) => {
                updateFile(ctx.changelogFilePath, `${getChangelogContent(ctx)}${shell.cat(ctx.changelogFilePath)}`);
            },
            title: 'Update `CHANGELOG.md` file.'
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: async () => {
                return await listrInput('Press any key once you are done with the review:');
            },
            title: `Review 'CHANGELOG.md'.`
        }
    ];
};

const getTasks = (packagePath: string) => {

    const packageJSONFileContent = require(`../../${packagePath}/package.json`);
    const tasks = [];

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    tasks.push(
        {
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
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: async (ctx) => {
                switch (ctx.packageName) {
                    case 'rule-no-vulnerable-javascript-libraries':
                        await downloadFile(
                            'https://snyk.io/partners/api/v2/vulndb/clientside.json',
                            path.normalize('packages/rule-no-vulnerable-javascript-libraries/src/snyk-snapshot.json')
                        );
                        break;
                    case 'rule-performance-budget':
                        await downloadFile(
                            'https://raw.githubusercontent.com/WPO-Foundation/webpagetest/master/www/settings/connectivity.ini.sample',
                            path.normalize('packages/rule-performance-budget/src/connections.ini')
                        );
                        break;
                    default:
                }
            },
            title: `Update package related files.`
        },
        ...(!packageJSONFileContent.private ? getPublishedPackageTasks() : getUnpublishedPackageTasks()),
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: async (ctx) => {
                await exec(`cd ${ctx.packagePath} && npm install`);
            },
            title: `Install dependencies.`
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: async (ctx) => {
                await exec(`cd ${ctx.packagePath} && npm test`);
            },
            title: 'Run tests.'
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: async (ctx) => {
                await exec(`cd ${ctx.packagePath} && npm run build-release`);
            },
            title: 'Run release build.'
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: async (ctx) => {

                // Add all changes to the staging aread.
                await exec(`git add -A`);

                /*
                 * If there aren't any changes in the staging area,
                 * skip to the next task.
                 */
                if (!(await exec('git status --porcelain')).stdout) {

                    return;
                }

                // Otherwise commit the changes.
                await exec(`git commit -m "🚀 ${ctx.packageName} - v${ctx.packageVersion}"`);
            },
            title: `Commit changes.`
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: async (ctx) => {
                ctx.packageNewTag = `${ctx.packageName}-v${ctx.packageVersion}`;

                await deleteTag(ctx.packageNewTag);
                await exec(`git tag -a "${ctx.packageNewTag}" -m "${ctx.packageNewTag}"`);
            },
            title: `Tag new version.`
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: async (ctx) => {
                /*
                 * Remove devDependencies, this will update `package-lock.json`.
                 * Need to do so they aren't published on the `npm` package.
                 */
                await exec(`cd ${ctx.packagePath} && npm prune --production`);
            },
            title: 'Remove `devDependencies`.'
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: async (ctx) => {
                /*
                 * (This is done because `npm` doesn't
                 *  publish the `package-lock` file)
                 */
                await exec(`cd ${ctx.packagePath} && npm shrinkwrap`);
            },
            title: 'Create `npm-shrinkwrap.json` file.'
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: (ctx) => {
                publishOnNPM(ctx);
            },
            title: `Publish on npm.`
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: async (ctx) => {
                await exec(`git push origin master ${ctx.packageNewTag}`);
            },
            title: `Push changes upstream.`
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: async (ctx) => {
                await createRelease(ctx.packageNewTag, ctx.packageReleaseNotes);
            },
            title: `Create release.`
        },
        {
            enabled: (ctx) => {
                return !ctx.skipRemainingTasks;
            },
            task: (ctx) => {
                removePackageFiles();
                delete ctx.packageNewTag;
            },
            title: `Cleanup.`
        }
    );

    return new Listr(tasks);
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const main = async () => {

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

            await deleteTag(err.context.packageNewTag);
            await gitReset();
            removePackageFiles();
            await deleteGitHubToken();
        });

    await deleteGitHubToken();
};

main();
