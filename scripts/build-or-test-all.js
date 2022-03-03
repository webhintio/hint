const path = require('path');

const chalk = require('chalk');

const { downloadBuild } = require('./dist-management/download-dist');
const { execWithRetry } = require('./utils/exec');

const ALREADY_BUILD_DEPENDENCIES = new Set();

const action = process.argv[2] === 'build' ?
    'build' :
    'test';

/** Loads all the references of a `tsconfig.json` file to resolve dependencies. */
const loadReferences = (route) => {
    const tsconfig = require(path.resolve(process.cwd(), route));

    const references = tsconfig.references ?
        tsconfig.references.map((reference) => {
            return reference.path;
        }) :
        [];

    return references;
};

/** Format a duration in ms to `mm:ss`. */
const formatDuration = (duration) => {
    const totalSecs = Math.floor(duration / 1000);

    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;

    return `${mins}m:${secs}s`;
};

/**
 * Run `yarn test` (which generally runs `build`, `lint`, and `test-only`
 * scripts) in the given `route`
 */
const testPackage = async (route) => {
    await execWithRetry(`cd ${route} && yarn ${action}`);

    ALREADY_BUILD_DEPENDENCIES.add(route);
};

/**
 * Test all the passed packages and doing it first for their dependencies.
 */
const testAllPackages = async (references) => {

    for (const reference of references) {
        const route = reference.replace(/^\.\.\//, 'packages/'); // Remove the initial `'../'` because we resolve from the root

        const subReferences = loadReferences(path.join(route, 'tsconfig.json'));

        if (ALREADY_BUILD_DEPENDENCIES.has(route)) {
            // Route already tested, nothing to do
        } else if (subReferences.length === 0) {
            await testPackage(route);
        } else {
            await testAllPackages(subReferences);
            await testPackage(route);
        }
    }
};

const main = async () => {
    const references = loadReferences('tsconfig.json');
    const start = Date.now();

    console.log(chalk.green.bold(`${action} all packages`));

    if (action === 'build') {
        try {
            await downloadBuild();
        } catch (e) {
            console.log(chalk.red.bold(`Couldn't get precompiled assets, building from local sources`));

            await testAllPackages(references);
        }
    } else {
        await testAllPackages(references);
    }

    console.log(chalk.green.bold(`${action} time: ${formatDuration(Date.now() - start)}`));
};

main();
