const path = require('path');
const fs = require('fs');

const execa = require('execa');
const request = require('request');
const unzipper = require('unzipper');

// Files that can be updated via the prebuild step but are safe to ignore in the build process
const thirdPartyFiles = [
    'snyk-snapshot.json',
    'validator'
];

const getCurrentCommitHash = async () => {
    const { stdout: hash } = await execa('git', ['rev-parse', '--verify', 'HEAD']);

    return hash;
};

/**
 * Determines if a modified file is a safe third party one
 * @param {string} line One line of the output of `git status --short`
 */
const isThirdPartyFile = (line) => {
    const filePath = line.split(' ').pop();

    for (const thirdPartyFile of thirdPartyFiles) {
        if (filePath.endsWith(thirdPartyFile)) {
            return true;
        }
    }

    return false;
};

const repoClean = async () => {
    const { stdout } = await execa('git', ['status', '--short']);

    if (stdout !== '') {
        const lines = stdout.trim().split('\n');

        for (const line of lines) {
            if (!isThirdPartyFile(line)) {
                throw new Error('Repository is not clean');
            }
        }
    }
};

const download = (fileName) => {
    const file = fs.createWriteStream(fileName);

    return new Promise((resolve, reject) => {

        request(`https://github.com/webhintio/hint/releases/download/dist/${fileName}`, (err, res) => {
            if (err) {
                reject(err);

                return;
            }

            if (res.statusCode !== 200) {
                reject(new Error(`Artifacts for ${fileName} aren't available`));

                return;
            }
        })
            .pipe(file)
            .on('finish', resolve)
            .on('error', reject);
    });
};

const unzip = (fileName) => {

    return new Promise((resolve, reject) => {

        fs.createReadStream(path.join(process.cwd(), fileName))
            .pipe(unzipper.Extract({ path: process.cwd() })) // eslint-disable-line new-cap
            .on('finish', resolve)
            .on('error', reject);
    });
};

const deleteFile = (fileName) => {
    console.log(`Deleting ${fileName}`);

    fs.unlinkSync(fileName); // eslint-disable-line no-sync

    console.log(`Done!`);
};


const downloadBuild = async () => {
    const hash = await getCurrentCommitHash();
    const fileName = `${hash}.zip`;

    try {
        console.log(`Verifying if repo does not have any changes`);

        await repoClean();
    } catch (e) {
        console.error('Repository has uncommited changes');

        throw e;
    }

    try {
        console.log(`Downloading revision "${hash}"`);

        await download(fileName);
    } catch (e) {
        console.error(`Couldn't download revision. Maybe sources aren't available?`);

        deleteFile(fileName);

        throw e;
    }

    try {
        console.log(`Unzipping`);

        await unzip(fileName);
    } catch (e) {
        console.error(`Couldn't unzip the contents.`);

        throw e;
    }

    deleteFile(fileName);
};

module.exports = { downloadBuild };

if (process.argv[1] === __filename) {
    downloadBuild();
}
