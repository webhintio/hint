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
    entry: './dist/src/index.js',
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
        path: path.resolve(__dirname, 'dist/bundle')
    }
};

const devtoolsConfig = {
    ...baseConfig,
    entry: './dist/src/devtools.js',
    output: {
        filename: 'devtools.js',
        path: path.resolve(__dirname, 'dist/bundle')
    }
};

const webhintPanelConfig = {
    ...baseConfig,
    entry: './dist/src/webhint-panel.js',
    output: {
        filename: 'webhint-panel.js',
        path: path.resolve(__dirname, 'dist/bundle')
    }
};

module.exports = [backgroundConfig, contentConfig, devtoolsConfig, webhintPanelConfig];
