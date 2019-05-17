const fs = require('fs');
const path = require('path');

const semver = require('semver');

const updatePackage = () => {
    const pkg = require('../package.json');

    pkg.version = semver.inc(pkg.version, 'patch') || pkg.version;

    fs.writeFileSync(path.join(__dirname, '../package.json'), `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8'); // eslint-disable-line no-sync

    return pkg.version;
};

const updateManifest = (version) => {
    const manifest = require('../src/manifest.json');

    manifest.version = version;

    fs.writeFileSync(path.join(__dirname, '../src/manifest.json'), `${JSON.stringify(manifest, null, 4)}\n`, 'utf-8'); // eslint-disable-line no-sync
};


const version = updatePackage();

updateManifest(version);
