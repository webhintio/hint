const path = require('path');

// See https://code.visualstudio.com/api/working-with-extensions/bundling-extension
module.exports = {
    entry: {
        extension: './dist/src/extension.js',
        server: './dist/src/server.js'
    },
    externals: { vscode: 'commonjs vscode' },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'dist/bundle')
    },
    target: 'node'
};
