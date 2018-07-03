const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = () => {
    return {
        entry: { 'new-hint': './src/index' },
        mode: 'production',
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [{
                        loader: 'ts-loader',
                        options: { configFile: 'tsconfig-webpack.json' }
                    }]
                }
            ]
        },
        node: {
            __dirname: false,
            __filename: false,
            path: true,
            process: false
        },
        output: { filename: 'src/[name].js' },
        plugins: [
            new webpack.ProgressPlugin(),
            new ForkTsCheckerWebpackPlugin(),
            new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })
        ],
        resolve: {
            alias: { handlebars: 'handlebars/dist/handlebars.min.js' },
            extensions: ['.ts', '.js', '.json']
        },
        target: 'node'
    };
};
