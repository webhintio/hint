const shell = require('shelljs');
const chalk = require('chalk');

shell.config.silent = true;

const shellExec = (cmd) => {
    return new Promise((resolve, reject) => {
        shell.exec(cmd, (code, stdout, stderr) => {
            if (code === 0) {
                return resolve({ code, stderr, stdout });
            }

            return reject({ code, stderr, stdout });
        });
    });
};

const exec = async (msg, cmd) => { // eslint-disable-line consistent-return

    if (typeof cmd === 'function') {
        try {
            const result = await cmd();

            console.log(chalk.green(`${msg}`));

            return result && result.trim && result.trim();
        } catch (e) {
            console.error(chalk.red(`${msg}`));
            console.error(e);

            process.exit(1); // eslint-disable-line no-process-exit
        }

        return '';
    }

    try {
        const { stdout } = await shellExec(cmd);

        console.log(chalk.green(`${msg}`));

        return stdout.trim();
    } catch ({ stderr }) {
        console.error(chalk.red(`${msg}`));
        console.error(stderr);

        process.exit(1); // eslint-disable-line no-process-exit
    }
};

exports.exec = exec;
