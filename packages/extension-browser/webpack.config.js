const path = require('path');

module.exports = {
    entry: './dist/src/index.js',
    mode: 'none',
    output: {
        filename: 'webhint.js',
        path: path.resolve(__dirname, 'dist/bundle')
    }
};
