const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env) => {
    return {
        context: __dirname,
        entry: { webhint: './dist/src/webhint.js' },
        mode: env && env.release ? 'production' : 'none',
        module: {
            rules: [
                // Bundle `axe-core` as a raw string so it can be injected at runtime.
                {
                    test: /axe-core/,
                    use: 'raw-loader'
                },
                {
                    test: /\.md$/,
                    use: 'raw-loader'
                }
            ]
        },
        node: {
            __dirname: true,
            fs: 'empty'
        },
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
            new webpack.DefinePlugin({ 'process.env.webpack': JSON.stringify(true) })
        ],
        resolve: {
            alias: {
                './get-message$': path.resolve(__dirname, 'dist/src/shims/get-message.js'),
                './request-async$': path.resolve(__dirname, 'dist/src/shims/request-async.js'),
                'acorn-jsx$': path.resolve(__dirname, 'dist/src/shims/acorn-jsx.js'),
                'acorn-jsx-walk$': path.resolve(__dirname, 'dist/src/shims/acorn-jsx-walk.js'),
                'axe-core': require.resolve('axe-core/axe.min.js'),
                url$: path.resolve(__dirname, 'dist/src/shims/url.js')
            }
        }
    };
};
