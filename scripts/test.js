const spawn = require('child_process').spawn;

const chalk = require('chalk');
const shell = require('shelljs');
const yargs = require('yargs');

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

shell.config.silent = true;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const ALREADY_BUILD_DEPENDENCIES = new Set();
const CI_FILE_NAME = '.ci-run-tests';
const PROJECT_NAME = 'hint';
const TEST_SCRIPT_NAMES = {
    lintMarkdown: 'lint:md',
    test: 'test',
    testOnly: 'test-only',
    testRoot: 'build:scripts'
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const cleanUpProjectData = (projectData) => {
    // Clene up and ajust things.

    for (const [packagePath, packageData] of Object.entries(projectData)) {
        // Remove all packages for which no tests need to be executed.
        if (!packageData.testScript) {
            delete projectData[packagePath];

            continue;
        }

        // Put dependencies in the order they should be build.
        projectData[packagePath].dependencies = projectData[packagePath].dependencies.reverse();
    }

    return projectData;
};

const exec = (cmd) => {
    return new Promise((resolve, reject) => {
        const command = spawn(cmd, [], {
            shell: true,
            stdio: 'inherit'
        });

        command.on('error', (err) => {
            return reject(err);
        });

        command.on('exit', (code) => {
            if (code !== 0) {
                return reject();
            }

            return resolve(true);
        });

    });
};

const buildDependencies = async (dependencies) => {
    for (const dependency of dependencies) {
        if (!ALREADY_BUILD_DEPENDENCIES.has(dependency)) {
            ALREADY_BUILD_DEPENDENCIES.add(dependency);
            await exec(`cd ${dependency} && yarn build`);
        }
    }
};

const getArgs = () => {
    return yargs.options({
        n: {
            alias: 'batch-number',
            default: 1,
            describe: 'Batch numbers',
            type: 'number'
        },
        s: {
            alias: 'batch-size',
            default: 1,
            describe: 'Batch size',
            type: 'number'
        },
        t: {
            alias: 'run-tests',
            default: true,
            describe: 'Run tests',
            type: 'boolean'
        }
    })
        .help()
        .argv;
};

const getCurrentBatch = (projectData, numberOfBatches = 1, batchNumber = 1) => {
    const batchSize = Math.ceil(Object.keys(projectData).length / numberOfBatches);
    const batchStartPosition = (batchNumber - 1) * batchSize;
    const batchEndPosition = batchStartPosition + batchSize;

    const newPackageData = {};

    let i = 0;

    for (const key of Object.keys(projectData)) {
        if (i >= batchStartPosition && i < batchEndPosition) {
            newPackageData[key] = projectData[key];
        }

        i++;
    }

    return newPackageData;
};

const getGitOutput = async (cmd) => {
    return (await shell.exec(cmd)).stdout
        // Remove trailing newline to make it easier to use the output.
        .replace(/\n$/, '');
};

const getGitMultilineOutput = async (cmd) => {
    const output = await getGitOutput(cmd);

    if (!output) {
        return [];
    }

    return output.split('\n');
};

const getLocalFilesChanged = async () => {
    const output = await getGitOutput('git status --porcelain');

    if (!output) {
        return [];
    }

    /*
     * If any output is produced, it will look something such as:
     *
     *   M  packages/hint/README.md
     *    M packages/parser-manifest/README.md
     *    M packages/parser-manifest/package.json
     *    M scripts/test.ts
     *   ?? test.sh
     */

    return output

    /*
     * Split by line.
     *
     * (Because the output comes from Git,
     *  `\n` is used regardless of the OS type)
     */

        .split('\n').map((change) => {

            /*
             * Get file path:
             *
             * (`M  packages/hint/README.md` => `packages/hint/README.md`
             */

            return change.split(/\s/).pop();
        });
};

const getLocalDependencies = (packagePath, packageJSONFileContent) => {
    const dependencies = new Set();

    [
        'dependencies',
        'devDependencies',
        'optionalDependencies',
        'peerDependencies'
    ].forEach((dependencyType) => {

        /*
         * Try to find all the other local packages in
         * the list of the current package's dependencies.
         */

        Object.keys(packageJSONFileContent[dependencyType] || []).forEach((dependency) => {
            if (dependency.startsWith(`@${PROJECT_NAME}/`) ||
                dependency === PROJECT_NAME) {

                /*
                 * The following converts something such as:
                 *
                 *  @hint/hint-http-compression
                 *
                 *  to
                 *
                 *  packages/hint-http-compression
                 */

                dependencies.add(`packages/${dependency.replace(`@${PROJECT_NAME}/`, '')}`);
            }
        });
    });

    return [...dependencies];
};

const log = (title, content = '') => {
    console.log(`
* ${chalk.green.bold(title)}

${content}`);
};

const getFilesChanged = async () => {

    let fileChanges;

    /*
     * Ensure that things work as expected for shallow clones.
     * (This is usually the case with CIs such as Travis)
     */
    await shell.exec(`git remote set-branches origin master`);

    // Update local data.
    await shell.exec(`git fetch`);

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Check if any files changed compared to `origin/master`.

    // Get files changes between the current branch and `origin/master`.

    let fileChangesComparedToMaster = [];
    const shaLastCommitFromMaster = (await getGitOutput('git rev-parse origin/master')).split(/\s/)[0];

    if (shaLastCommitFromMaster) {
        log('Last commit from `origin/master`', shaLastCommitFromMaster);

        fileChangesComparedToMaster = await getGitMultilineOutput(`git diff --name-only HEAD..${shaLastCommitFromMaster}`);

        if (fileChangesComparedToMaster.length !== 0) {
            log('Commits compared to `origin/master`', (await getGitMultilineOutput(`git log --oneline HEAD...${shaLastCommitFromMaster}`)).join('\n'));
        }

        log('File changed compared to `origin/master`', fileChangesComparedToMaster.join('\n'));
    }

    // Get files changed locally (untracked, unstaged, and staged files).
    const fileChangesLocally = await getLocalFilesChanged();

    log('File changed locally', fileChangesLocally.join('\n'));

    fileChanges = [...(new Set([
        ...fileChangesComparedToMaster,
        ...fileChangesLocally
    ]))];

    if (fileChanges.length !== 0) {
        log('All changed files', fileChanges.join('\n'));

        return fileChanges;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    /*
     * If nothing changed compared to `origin/master`, check what
     * changed since the last tag or since some number of commits
     * ago (whichever happened more recently).
     */

    const shaLastTag = await getGitOutput('git rev-list --tags --max-count=1');

    let tagCommitNumber = -1;

    if (shaLastTag) {
        log('Last tag', shaLastTag);

        tagCommitNumber = parseInt(await getGitOutput(`git rev-list --count HEAD...${shaLastTag}`));
    }

    /*
     * If there is no last tag, or it was more than a certain number
     * of commits ago.
     */

    const numberOfCommitsToGoBack = 5;

    if (!shaLastTag || tagCommitNumber > numberOfCommitsToGoBack) {
        // Get files changed since some number of commits ago.
        fileChanges = await getGitMultilineOutput(`git diff --name-only HEAD..HEAD~${numberOfCommitsToGoBack}`);

        if (fileChanges.length !== 0) {
            log(`Last ${numberOfCommitsToGoBack} commits`, (await getGitMultilineOutput(`git log --oneline HEAD...HEAD~${numberOfCommitsToGoBack}`)).join('\n'));
        }

        log(`File changed in the last ${numberOfCommitsToGoBack} commits`, fileChanges.join('\n'));

        return fileChanges;
    }

    /*
     * Otherwise, get the files changed since the last tag.
     * (Everything should be tested from that point on because
     *  of how the release script works).
     */

    fileChanges = await getGitMultilineOutput(`git diff --name-only HEAD..${shaLastTag}`);

    if (fileChanges.length !== 0) {
        log(`Commits since last tag (${shaLastTag})`, (await getGitMultilineOutput(`git log --oneline HEAD...${shaLastTag}`)).join('\n'));
        log(`File changed since last tag (${shaLastTag})`, fileChanges.join('\n'));
    }

    return fileChanges;
};

const getTestScript = (availableScripts, scriptName) => {
    if (availableScripts && availableScripts.includes(scriptName)) {
        return scriptName;
    }

    return '';
};

const determineTestScript = (changedFiles, packagePath, availableScripts) => {

    /*
     * If there are no files changed related to the package path,
     * just ignore the rest.
     */

    if (changedFiles.length === 0) {
        return '';
    }

    // If only files related to the documentation changed.

    if (changedFiles.every((file) => {
        return (/^.*\/(.*.md)$/i).test(file);
    })) {
        return getTestScript(availableScripts, TEST_SCRIPT_NAMES.lintMarkdown);
    }

    // If any other files changed.

    return getTestScript(availableScripts, TEST_SCRIPT_NAMES.test);
};

const getPackageData = async (pkg, packageJSONFileContent, filesChanged) => {
    const currentPlatform = process.platform;

    /*
     * Try to eliminate packages that don't need to be tested.
     *
     * Check if the package:
     */

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // * 1) Is intended for the current platform.

    const os = packageJSONFileContent.os;

    if (os &&
        (!os.includes(currentPlatform) ||
         /*
          * `os` can also include values such as `!win`.
          * https://docs.npmjs.com/files/package.json#os
          */
         os.includes(`!${currentPlatform}`))) {
        return null;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // 2) `script` cannot be triggered because the package:

    const scripts = packageJSONFileContent.scripts && Object.keys(packageJSONFileContent.scripts);

    // * has no `scripts`

    if (!scripts) {
        return null;
    }

    const filesChangedInPackage = filesChanged.filter((file) => {
        return file.startsWith(pkg);
    });

    const testScript = await determineTestScript(filesChangedInPackage, pkg, scripts);

    if (
    /*
     * * doesn't have any of the script
     *   that this script will run
     */

        [
            TEST_SCRIPT_NAMES.lintMarkdown,
            TEST_SCRIPT_NAMES.test,
            TEST_SCRIPT_NAMES.testOnly
        ].every((scriptValue) => {
            return !scripts.includes(scriptValue);
        }) ||

        /*
         * * doesn't have scripts that may
         *   be run by this script
         */

            (!scripts.includes(TEST_SCRIPT_NAMES.test) && testScript !== TEST_SCRIPT_NAMES.lintMarkdown)) {

        return null;
    }

    // * has no dependencies, nor changes.

    const dependencies = getLocalDependencies(pkg, packageJSONFileContent);

    if (!dependencies && !testScript) {
        return null;
    }

    return {
        dependencies,
        testScript
    };
};

const getRootData = async (filesChanged, packageJSONFileContent) => {
    const filesChangedInRoot = filesChanged.filter((file) => {
        return !file.startsWith('packages/');
    });

    if (filesChangedInRoot.length === 0) {
        return null;
    }

    const scripts = packageJSONFileContent.scripts && Object.keys(packageJSONFileContent.scripts);
    const testScript = await determineTestScript(filesChangedInRoot, '.', scripts);

    if (!testScript) {
        return null;
    }

    return {
        dependencies: [],
        testScript: testScript === TEST_SCRIPT_NAMES.test ? 'build:scripts' : testScript
    };
};


const getPackagesData = async () => {
    const excludedPackages = [

        /*
         * Exclude `connector-edge` for now to allow tests
         * to run on Windows.
         *
         * TODO: Remove this once the `yarn` related issues are
         *       fixed or we find a better solution to handle this.
         *
         * Ref: https://github.com/yarnpkg/yarn/issues/5951
         *
         */

        'packages/connector-edge'
    ];

    const filesChanged = await getFilesChanged();

    const packages = [
        '.', // <= root
        ...shell.ls('-d', 'packages/!(connector-edge)')
    ];

    const projectData = {};

    for (const pkg of packages) {

        let packageJSONFileContent;

        try {
            packageJSONFileContent = require(`../${pkg}/package.json`);
        } catch (e) {
            // Ignore packages that don't have a `package.json` file.
            continue;
        }

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        const isRegularPackage = pkg.startsWith('packages/');
        const packageData = isRegularPackage ?
            await getPackageData(pkg, packageJSONFileContent, filesChanged) :
            await getRootData(filesChanged, packageJSONFileContent);

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        if (!packageData) {
            excludedPackages.push(pkg);

            continue;
        }

        projectData[pkg] = packageData;
    }

    /*
     * Since the excluded packages will never be run, removed them
     * from the dependencies of other packages.
     */

    for (const [, packageData] of Object.entries(projectData)) {
        if (!packageData.dependencies) {
            continue;
        }

        packageData.dependencies = packageData.dependencies.filter((dep) => {
            return !excludedPackages.includes(dep);
        });
    }

    return projectData;
};

const includeDeepDependencies = (projectData) => {
    for (const [packagePath, packageData] of Object.entries(projectData)) {
        let dependencies = Array.from(packageData.dependencies);
        let newDependencies;

        while (dependencies.length !== 0) {
            newDependencies = [];

            for (const dep of dependencies) {

                if (projectData[dep].testScript === TEST_SCRIPT_NAMES.test) {
                    projectData[packagePath].testScript = TEST_SCRIPT_NAMES.test;
                }

                const subDependencies = Array.from(projectData[dep].dependencies);

                for (const subDependency of subDependencies) {
                    if (projectData[packagePath].dependencies.includes(subDependency)) {
                        projectData[packagePath].dependencies.splice(projectData[packagePath].dependencies.indexOf(subDependency), 1);
                    }

                    if (!newDependencies.includes(subDependency)) {
                        newDependencies.push(subDependency);
                    }

                    projectData[packagePath].dependencies.push(subDependency);
                }
            }

            dependencies = Array.from(newDependencies);
        }
    }

    return projectData;
};

const runTests = async (projectData) => {
    for (const [packagePath, packageData] of Object.entries(projectData)) {
        log(packagePath);

        if (!ALREADY_BUILD_DEPENDENCIES.has(packagePath)) {
            await buildDependencies(packageData.dependencies);
            await exec(`cd ${packagePath} && yarn ${packageData.testScript}`);

            continue;
        }

        // If the package was already build, just execute the tests.
        await exec(`cd ${packagePath} && yarn ${TEST_SCRIPT_NAMES.testOnly}`);
    }
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const main = async () => {
    const args = getArgs();

    const projectData = getCurrentBatch(
        cleanUpProjectData(includeDeepDependencies(await getPackagesData())),
        args['batch-size'],
        args['batch-number']
    );

    const currentBatchSize = Object.keys(projectData).length;
    const testsShouldRun = args['run-tests'];

    log('Project data', JSON.stringify(projectData, null, 4));

    if (shell.test('-f', CI_FILE_NAME)) {
        shell.rm('-rf', CI_FILE_NAME);
    }

    if (!testsShouldRun) {
        if (currentBatchSize !== 0) {
            shell.echo('').to(CI_FILE_NAME);
        }

        return;
    }

    try {
        await runTests(projectData);
    } catch (e) {
        console.error(e);
        process.exit(1); // eslint-disable-line no-process-exit
    }
};

main();
