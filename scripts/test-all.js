const spawn = require('child_process').spawn;
const path = require('path');

const chalk = require('chalk');
const pRetry = require('p-retry');

const ALREADY_BUILD_DEPENDENCIES = new Set();
const TEST_RETRIES = 2; // Will retry 2 times on top of the regular one

const action = process.argv[2] === 'build' ?
    'build' :
    'test';

/** Loads all the references of a `tsconfig.json` file to resolve dependencies. */
const loadReferences = (route) => {
    const tsconfig = require(path.resolve(process.cwd(), route));

    const references = tsconfig.references ?
        tsconfig.references.map((reference) => reference.path) :
        [];

    return references;
};

/** Execute the `cmd` in a new process. */
const exec = (cmd) => new Promise((resolve, reject) => {
    console.log(chalk.green(`  ${cmd}`));
    const command = spawn(cmd, [], {
        shell: true,
        stdio: 'inherit'
    });

    command.on('error', (err) => reject(err));

    command.on('exit', (code) => {
        if (code !== 0) {
            return reject(new Error('NoExitCodeZero'));
        }

        return resolve(true);
    });

});

/** Execute a `command` retrying if `exitCode` is different than 0. */
const execWithRetry = (command) => {
    const fn = () => exec(command);

    return pRetry(fn, {
        onFailedAttempt: (error) => {
            console.error(`Failed executing "${command}". Retries left: ${error.retriesLeft}.`);
        },
        retries: TEST_RETRIES
    });
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

    console.log(chalk.green.bold(`Testing all packages`));

    await testAllPackages(references);

    console.log(chalk.green.bold(`Test time: ${formatDuration(Date.now() - start)}`));
};

main();
