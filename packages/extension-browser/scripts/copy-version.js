/**
 * Copies current version from `package.json` to `dist/bundle/manifest.json`.
 */
const fs = require('fs');
const util = require('util');
const path = require('path');

const writeFile = util.promisify(fs.writeFile);

/**
 * Updates any `json` file that has a `version` property to the given one.
 * @param {string} file The file to open
 * @param {string} version The new version
 */
const updateFile = async (file, version) => {
    const content = require(file);

    content.version = version;
    await writeFile(path.join(__dirname, file), `${JSON.stringify(content, null, 2)}\n`, 'utf-8');
};

const start = async () => {
    const pkgPath = '../package.json';
    const manifestPath = '../dist/bundle/manifest.json';
    const { version } = require(pkgPath);

    await updateFile(manifestPath, version);
};

start();
