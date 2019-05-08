/**
 * Bumps the patch number version in `package.json` and `manifest.json`
 * and creates a new commit.
 */
const fs = require('fs');
const util = require('util');
const path = require('path');

const execa = require('execa');
const semver = require('semver');

const writeFile = util.promisify(fs.writeFile);

/**
 * Returns the version of a given json incremented by a patch.
 * @param {string} file The file used to read the current version.
 */
const getNewVersion = (file) => {
    const pkg = require(file);

    pkg.version = semver.inc(pkg.version, 'patch') || pkg.version;

    console.log(`New extension version: ${pkg.version}`);

    return pkg.version;
};

/**
 * Updates any `json` file that has a `vesion` property to the given one.
 * @param {string} file The file to open
 * @param {string} version The new version
 */
const updateFile = async (file, version) => {
    const content = require(file);

    content.version = version;
    await writeFile(path.join(__dirname, file), `${JSON.stringify(content, null, 2)}\n`, 'utf-8');
};

/**
 * Creates a commit with the changes.
 * @param {string} version The new extension version
 */
const commit = async (version) => {
    console.log('Commiting changes');

    await execa('git', ['add', '.']);
    await execa('git', ['commit', '-m', `Chore: Bump version to ${version}`]);
};

const start = async () => {
    const pkgPath = '../package.json';
    const manifestPath = '../src/manifest.json';
    const version = getNewVersion(pkgPath);

    await updateFile(pkgPath, version);
    await updateFile(manifestPath, version);

    await commit(version);
};

start();
