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
    const filename = path.join(__dirname, file);

    content.version = version;
    await writeFile(filename, `${JSON.stringify(content, null, 2)}\n`, 'utf-8');
    console.log(`Set version to ${version} in ${filename}`);
};

const start = async () => {
    const pkgPath = '../package.json';
    const manifestPaths = ['../dist/bundle/manifest.json', '../dist/src/manifest.json'];
    const { version } = require(pkgPath);

    for (const manifestPath of manifestPaths) {
        await updateFile(manifestPath, version);
    }
};

start();
