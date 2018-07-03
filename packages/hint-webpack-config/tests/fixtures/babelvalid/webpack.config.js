const path = require('path');

module.exports = {
    entry: ['entrypoint'],
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist')
    }
};
