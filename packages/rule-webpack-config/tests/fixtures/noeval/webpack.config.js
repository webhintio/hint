const path = require('path');

module.exports = {
    devtool: 'source-map',
    entry: ['entrypoint'],
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist')
    }
};
