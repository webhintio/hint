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
        console.log(chalk.green(`   ${cmd}`));

        return stdout.trim();
    } catch ({ stderr }) {
        console.error(chalk.red(`${msg}`));
        console.log(chalk.green(`   ${cmd}`));
        console.error(stderr);

        process.exit(1); // eslint-disable-line no-process-exit
    }
};

const getLastCommitsWithSameMessage = async () => {
    const output = await exec('Get last number of commits with the same message', `git log --pretty=format:'%s' --max-count=70`);
    const messages = output.trim().split('\n');
    let same = true;
    let commits = 0;

    while (same && commits < messages.length) {
        commits++;
        same = messages[commits - 1] === messages[commits];
    }

    return commits;
};

const getLastCommitInfo = async (message, format) => {
    // See: https://git-scm.com/docs/pretty-formats#_pretty_formats.
    return await exec(message, `git show --no-patch --format=%${format} -1`);
};

const getLastCommitAuthorEmail = async () => {
    return await getLastCommitInfo('Get author email for the last commit.', 'ae');
};

const getLastCommitAuthorName = async () => {
    return await getLastCommitInfo('Get author name for the last commit.', 'an');
};

const getLastCommitSubject = async () => {
    return await getLastCommitInfo('Get subject for the last commit.', 's');
};

module.exports = {
    exec,
    getLastCommitAuthorEmail,
    getLastCommitAuthorName,
    getLastCommitSubject,
    getLastCommitsWithSameMessage
};
