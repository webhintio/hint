const fs = require('fs');
const glob = require('glob');
const path = require('path');
const packageJSON = require('../package.json');

const folder = process.argv[2];

let extensionPath = path.resolve(__dirname, '..', folder);

extensionPath = path.join(extensionPath, 'webhint-*.zip');

// starting on v8 glob expects all paths to be forward slash
extensionPath = extensionPath.replace(/\\/g, '/');

glob(extensionPath, (err, files) => {
    if (err) {
        throw new Error(`Validating bundle size failed: ${err}`);
    }

    if (files.length !== 1) {
        throw new Error(`Expected one bundle, but found ${files.length}`);
    }

    const filename = files[0];

    fs.stat(filename, (err, stats) => {
        if (err) {
            throw new Error(`Reading bundle failed: ${err}`);
        }

        const sizeKB = Math.round(stats.size / 1000);
        const limitKB = Math.round(packageJSON.bundleSize / 1000);

        if (sizeKB > limitKB) {
            throw new Error(`Bundle size of ${sizeKB}KB exceeds limit of ${limitKB}KB defined in package.json for ${filename}.`);
        } else {
            console.log(`Bundle size of ${sizeKB}KB is within limit of ${limitKB}KB defined in package.json for ${filename}.`);
        }
    });
});
