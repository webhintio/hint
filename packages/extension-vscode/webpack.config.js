const path = require('path');

// See https://code.visualstudio.com/api/working-with-extensions/bundling-extension
/** @type {import('webpack').Configuration}*/
module.exports = {
    entry: {
        extension: './src/extension.ts',
        server: './src/server.ts'
    },
    externals: { vscode: 'commonjs vscode' },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.ts$/,
                use: [
                    { loader: 'ts-loader' }
                ]
            }
        ]
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, 'dist/src')
    },
    resolve: {
        alias: { '../../package.json$': path.resolve(__dirname, 'package.json') },
        extensions: ['.ts', '.js']
    },
    target: 'node'
};
