const path = require('path');

const backgroundConfig = {
    entry: './dist/src/background-script.js',
    mode: 'none',
    node: { fs: 'empty' },
    output: {
        filename: 'background-script.js',
        path: path.resolve(__dirname, 'dist/bundle')
    }
};

const contentConfig = {
    entry: './dist/src/index.js',
    mode: 'none',
    node: { fs: 'empty' },
    output: {
        filename: 'webhint.js',
        path: path.resolve(__dirname, 'dist/bundle')
    }
};

module.exports = [backgroundConfig, contentConfig];
