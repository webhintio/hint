const path = require('path');

const backgroundConfig = {
    entry: './dist/src/background-script.js',
    mode: 'none',
    node: { fs: 'empty' },
    output: {
        filename: 'background-script.js',
        path: path.resolve(__dirname, 'dist/bundle')
    }
};

const contentConfig = {
    entry: './dist/src/index.js',
    mode: 'none',
    node: { fs: 'empty' },
    output: {
        filename: 'webhint.js',
        path: path.resolve(__dirname, 'dist/bundle')
    },
    resolve: {
        alias: { // eslint-disable-line
            url$: path.resolve(__dirname, 'dist/src/shims/url.js')
        }
    }
};

const devtoolsConfig = {
    entry: './dist/src/devtools.js',
    mode: 'none',
    output: {
        filename: 'devtools.js',
        path: path.resolve(__dirname, 'dist/bundle')
    }
};

const webhintPanelConfig = {
    entry: './dist/src/webhint-panel.js',
    mode: 'none',
    output: {
        filename: 'webhint-panel.js',
        path: path.resolve(__dirname, 'dist/bundle')
    }
};

module.exports = [backgroundConfig, contentConfig, devtoolsConfig, webhintPanelConfig];
