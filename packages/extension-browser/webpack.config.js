const path = require('path');

module.exports = {
    entry: {
        'background-script': './dist/src/background-script.js',
        'content-script/webhint': './dist/src/content-script/webhint.js',
        'devtools/devtools': './dist/src/devtools/devtools.js',
        'devtools/panel/panel': './dist/src/devtools/panel/panel.js'
    },
    mode: 'none',
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
                    'css-loader'
                ]
            },
            // Bundle highlight.js styles with `Useable` so they can be turned on/off.
            {
                test: /highlight\.js[/\\]styles/,
                use: [
                    'style-loader/useable',
                    'css-loader'
                ]
            }
        ]
    },
    node: { fs: 'empty' },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/bundle')
    },
    resolve: { alias: { url$: path.resolve(__dirname, 'dist/src/shims/url.js') } }
};
