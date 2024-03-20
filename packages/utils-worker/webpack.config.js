const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env) => {
    return {
        context: __dirname,
        entry: { webhint: './dist/src/webhint.js' },
        mode: env && env.release ? 'production' : 'none',
        node: { __dirname: true },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                    // Fix handling of non-ASCII characters by forcing them to be escaped.
                    terserOptions: { output: { ascii_only: true } } // eslint-disable-line camelcase
                })
            ]
        },
        output: {
            filename: '[name].js',
            path: __dirname
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.argv': [],
                'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG), // eslint-disable-line no-process-env
                'process.env.webpack': JSON.stringify(true)
            }),
            new webpack.ProvidePlugin({ process: 'process/browser' })
        ],
        resolve: {
            alias: {
                './get-message$': path.resolve(__dirname, 'dist/src/shims/get-message.js'),
                './request-async$': path.resolve(__dirname, 'dist/src/shims/request-async.js'),
                'acorn-jsx$': path.resolve(__dirname, 'dist/src/shims/acorn-jsx.js'),
                'acorn-jsx-walk$': path.resolve(__dirname, 'dist/src/shims/acorn-jsx-walk.js'),
                'file-type': path.resolve(__dirname, 'dist/src/shims/file-type.js'),
                'is-svg': path.resolve(__dirname, 'dist/src/shims/is-svg.js'),
                url$: path.resolve(__dirname, 'dist/src/shims/url.js')
            },
            fallback: {
                crypto: 'crypto-browserify',
                fs: false,
                os: 'os-browserify',
                path: 'path-browserify',
                setImmediate: 'setimmediate',
                stream: 'stream-browserify',
                vm: false
            }
        }
    };
};
