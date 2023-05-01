const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');

module.exports = (env) => {
    return {
        amd: false,
        context: __dirname,
        entry: {
            'background-script': './dist/src/background-script.js',
            'content-script/webhint': './dist/src/content-script/webhint.js',
            'devtools/devtools': './dist/src/devtools/devtools.js',
            'devtools/panel': './dist/src/devtools/panel.js'
        },
        mode: env && env.release ? 'production' : 'none',
        module: {
            rules: [
                // Bundle `js-library-detector as a raw string so it can be injected at runtime.
                {
                    test: /js-library-detector/,
                    type: 'asset/source'
                },
                // Automatically bundle and inject referenced CSS files.
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: 'style-loader',
                            options: { esModule: false }
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    /*
                                     * Generate scoped class names using the same format as `create-react-app` (unique, but readable).
                                     * https://facebook.github.io/create-react-app/docs/adding-a-css-modules-stylesheet
                                     */
                                    localIdentName: '[name]_[local]_[hash:base64:5]'
                                }
                            }
                        }
                    ]
                },
                {
                    generator: {
                        dataUrl: (content) => {
                            return svgToMiniDataURI(content.toString());
                        }
                    },
                    test: /\.svg$/,
                    type: 'asset/inline'
                },
                {
                    test: /\.md$/,
                    type: 'asset/source'
                }
            ]
        },
        node: { __dirname: true },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    terserOptions: {

                        /**
                         * Terser is minifying the variable name 'module' inside axe-core which causes axe-core
                         * to fail the initialization. References: hint-axe/axe.ts:evaluateAxe
                         */
                        mangle: { reserved: ['module'] },

                        /*
                         * Fix handling of non-ASCII characters in minified content script
                         * when running in Chrome by forcing them to be escaped.
                         */
                        // eslint-disable-next-line camelcase
                        output: { ascii_only: true }
                    }
                })
            ]
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist/bundle')
        },
        plugins: [
            new webpack.DefinePlugin({
                DESIGN_SYSTEM: JSON.stringify(env && env.design || 'fluent'),
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
                assert: 'assert',
                crypto: 'crypto-browserify',
                fs: false,
                os: 'os-browserify',
                path: 'path-browserify',
                setImmediate: 'setimmediate',
                stream: 'stream-browserify',
                util: 'util'
            }
        }
    };
};
