const fs = require('fs');
const path = require('path');
const packageJSON = require('../package.json');

const filename = `${path.resolve(__dirname, '..')}/vscode-webhint-${packageJSON.version}.vsix`;

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
