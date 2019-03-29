/**
 * When running individual ava test files via `profile.js` ava
 * expects the directory `node_modules/.cache/ava` to exists. If
 * it doesn't it fails. This script is used to guarantee it exists
 * before running the `AVA test` task set in `launch.json`
 */

const fs = require('fs-extra');
const path = require('path');
const dir = path.join(__dirname, '..', 'node_modules', '.cache', 'ava');

fs.ensureDir(dir, (err) => {
    if (err) {
        console.error(err);

        process.exitCode = 1;
    }
});
