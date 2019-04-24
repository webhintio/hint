const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env) => {
    return {
        entry: {
            'background-script': './dist/src/background-script.js',
            'content-script/webhint': './dist/src/content-script/webhint.js',
            'devtools/devtools': './dist/src/devtools/devtools.js',
            'devtools/panel': './dist/src/devtools/panel.js'
        },
        mode: env && env.release ? 'production' : 'none',
        module: {
            rules: [
                // Bundle `axe-core` as a raw string so it can be injected at runtime.
                {
                    test: /axe-core/,
                    use: 'raw-loader'
                },
                // Bundle `js-library-detector as a raw string so it can be injected at runtime.
                {
                    test: /js-library-detector/,
                    use: 'raw-loader'
                },
                // Automatically bundle and inject referenced CSS files.
                {
                    exclude: /highlight\.js[/\\]styles/,
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                /*
                                 * Generate scoped class names using the same format as `create-react-app` (unique, but readable).
                                 * https://facebook.github.io/create-react-app/docs/adding-a-css-modules-stylesheet
                                 */
                                localIdentName: '[name]_[local]_[hash:base64:5]',
                                modules: true
                            }
                        }
                    ]
                },
                // Bundle highlight.js styles with `Useable` so they can be turned on/off.
                {
                    test: /highlight\.js[/\\]styles/,
                    use: [
                        'style-loader/useable',
                        'css-loader'
                    ]
                },
                {
                    test: /\.svg$/,
                    use: {
                        loader: 'svg-url-loader',
                        options: { noquotes: true }
                    }
                }
            ]
        },
        node: { fs: 'empty' },
        optimization: {
            minimizer: [
                /*
                 * Fix handling of non-ASCII characters in minified content script
                 * when running in Chrome by forcing them to be escaped.
                 */
                // eslint-disable-next-line camelcase
                new TerserPlugin({ terserOptions: { output: { ascii_only: true } } })
            ]
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist/bundle')
        },
        plugins: [
            new webpack.DefinePlugin({ 'process.env.webpack': JSON.stringify(true) })
        ],
        resolve: {
            alias: {
                '@hint/utils/dist/src/network/request-async$': path.resolve(__dirname, 'dist/src/shims/request-async.js'),
                url$: path.resolve(__dirname, 'dist/src/shims/url.js')
            }
        }
    };
};
