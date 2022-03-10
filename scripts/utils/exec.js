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
        let stderr = '';
        let stdout = '';

        const command = spawn(cmd, [], {
            shell: true,
            stdio: 'inherit',
            ...options
        });

        const stderrClosed = !command.stderr ? Promise.resolve() : new Promise((resolve) => {
            command.stderr.on('close', resolve);
        });

        const stdoutClosed = !command.stdout ? Promise.resolve() : new Promise((resolve) => {
            command.stdout.on('close', resolve);
        });

        command.stderr?.on('data', (data) => {
            stderr += data;
        });

        command.stdout?.on('data', (data) => {
            stdout += data;
        });

        command.on('error', (err) => {
            reject(err);
        });

        command.on('exit', async (code) => {
            await Promise.all([stderrClosed, stdoutClosed]);

            if (code) {
                reject(new Error(`Exit Code: ${code}\n${stderr}`));
            } else {
                resolve({ stderr: stderr.trimEnd(), stdout: stdout.trimEnd() });
            }
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
