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
            {
                test: /axe-core/,
                use: 'raw-loader'
            },
            {
                test: /\.ejs$/,
                use: 'compile-ejs-loader'
            }
        ]
    },
    node: { fs: 'empty' },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist/bundle')
    },
    resolve: {
        alias: { // eslint-disable-line
            url$: path.resolve(__dirname, 'dist/src/shims/url.js')
        }
    }
};
