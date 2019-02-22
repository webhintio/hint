const path = require('path');

const baseConfig = {
    mode: 'production',
    module: {
        rules: [
            // Bundle `axe-core` as a raw string so it can be injected at runtime.
            {
                test: /axe-core/,
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
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/bundle')
    },
    resolve: {
        alias: {
            'hint/dist/src/lib/utils/network/request-async$': path.resolve(__dirname, 'dist/src/shims/request-async.js'),
            'mdn-browser-compat-data$': path.resolve(__dirname, 'dist/mdn-browser-compat-data.packed.json'),
            url$: path.resolve(__dirname, 'dist/src/shims/url.js')
        }
    }
};

const contentScriptConfig = {
    ...baseConfig,
    ...{
        entry: { webhint: './dist/src/content-script/webhint.js' },
        output: { ...baseConfig.output, path: path.resolve(__dirname, 'dist') }
    }
};

const extensionConfig = {
    ...baseConfig,
    ...{
        entry: {
            'background-script': './dist/src/background-script.js',
            'devtools/devtools': './dist/src/devtools/devtools.js',
            'devtools/panel/panel': './dist/src/devtools/panel/panel.js'
        }
    }
};

module.exports = (env) => {
    if (env && env['content-script']) {
        return contentScriptConfig;
    }

    return extensionConfig;
};
