const fs = require('fs');
const mdn = require('mdn-browser-compat-data');
const path = require('path');
const filename = path.resolve(`${__dirname}/../dist/mdn-browser-compat-data.packed.json`);

fs.writeFile(filename, JSON.stringify({
    browsers: mdn.browsers,
    css: mdn.css,
    html: mdn.html
}), (err) => {
    if (err) {
        throw err;
    } else {
        console.log(`Created: ${filename}`);
    }
});
