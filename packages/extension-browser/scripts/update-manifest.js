const fs = require('fs');
const path = require('path');
const manifest = require('../dist/bundle/manifest.json');

// Remove the "persistent" flag when building for Firefox to avoid a warning.
delete manifest.background.persistent;
// Remove the "browser_action" property to avoid displaying the logo close to the address bar on Firefox
delete manifest.browser_action;

const filename = path.resolve(`${__dirname}/../dist/bundle/manifest.json`);
const content = JSON.stringify(manifest, null, 2);

fs.writeFile(filename, content, (err) => {
    if (err) {
        throw err;
    } else {
        console.log(`Removed \`background.persistent=false\` from: ${filename}`);
        console.log(`Removed \`browser_action\` from: ${filename}`);
    }
});
