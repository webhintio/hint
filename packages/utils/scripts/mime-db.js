const fs = require('fs');
const path = require('path');
const filename = path.resolve(`${__dirname}/../src/mime-db/db.json`);

/** @type import('../src/mime-db').MimeDB */
const mimeDB = require('mime-db');

const data = Object.keys(mimeDB).reduce((dict, type) => {
    const value = mimeDB[type];

    if (value.charset || value.extensions) {
        dict[type] = {
            charset: value.charset,
            extensions: value.extensions
        };
    }

    return dict;
}, /** @type import('../src/mime-db').MimeDB */ ({}));

fs.writeFile(filename, JSON.stringify(data), (err) => {
    if (err) {
        throw err;
    } else {
        console.log(`Created: ${filename}`);
    }
});
