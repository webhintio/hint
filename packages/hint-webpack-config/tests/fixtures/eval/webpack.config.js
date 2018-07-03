const path = require('path');

module.exports = {
    devtool: 'eval',
    entry: ['entrypoint'],
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist')
    }
};
