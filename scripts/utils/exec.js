const spawn = require('child_process').spawn;

const TEST_RETRIES = 2; // Will retry 2 times on top of the regular one

const delay = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

/**
 * Execute the `cmd` in a new process.
 */
const exec = (cmd, options = {}) => {
    return new Promise((resolve, reject) => {
        let stdout = '';

        const command = spawn(cmd, [], {
            shell: true,
            stdio: 'inherit',
            ...options
        });

        command.stdout?.on('data', (data) => {
            stdout += data;
        });

        command.on('error', (err) => {
            return reject(err);
        });

        command.on('exit', (code) => {
            if (code !== 0) {
                return reject(new Error('NoExitCodeZero'));
            }

            return resolve({ stdout: stdout.trimEnd() });
        });

    });
};

/**
 * Execute a `command` retrying if `exitCode` is different than 0.
 */
const execWithRetry = async (command, options = {}, allowedRetries = TEST_RETRIES) => {
    let retriesLeft = allowedRetries;

    while (retriesLeft >= 0) {
        try {
            return await exec(command, options);
        } catch (e) {
            console.error(`Failed executing "${command}". Retries left: ${retriesLeft}.`);

            if (retriesLeft === 0) {
                throw e;
            }

            retriesLeft--;
            await delay(1000 * Math.pow(2, allowedRetries - retriesLeft));
        }
    }

    return Promise.resolve();
};

module.exports = {
    exec,
    execWithRetry
};
