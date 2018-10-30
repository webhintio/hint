const path = require('path');

const baseConfig = {
    mode: 'none',
    node: { fs: 'empty' },
    resolve: {
        alias: { // eslint-disable-line
            url$: path.resolve(__dirname, 'dist/src/shims/url.js')
        }
    }
};

const backgroundConfig = {
    ...baseConfig,
    entry: './dist/src/background-script.js',
    output: {
        filename: 'background-script.js',
        path: path.resolve(__dirname, 'dist/bundle')
    }
};

const contentConfig = {
    ...baseConfig,
    entry: './dist/src/content-script/webhint.js',
    module: {
        rules: [
            {
                test: /axe-core/,
                use: 'raw-loader'
            }
        ]
    },
    output: {
        filename: 'webhint.js',
        path: path.resolve(__dirname, 'dist/bundle/content-script')
    }
};

const devtoolsConfig = {
    ...baseConfig,
    entry: './dist/src/devtools/devtools.js',
    output: {
        filename: 'devtools.js',
        path: path.resolve(__dirname, 'dist/bundle/devtools')
    }
};

const webhintPanelConfig = {
    ...baseConfig,
    entry: './dist/src/devtools/panel/panel.js',
    output: {
        filename: 'panel.js',
        path: path.resolve(__dirname, 'dist/bundle/devtools/panel')
    }
};

module.exports = [backgroundConfig, contentConfig, devtoolsConfig, webhintPanelConfig];
