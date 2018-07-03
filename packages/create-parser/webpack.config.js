const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = () => {
    return {
        entry: { 'new-parser': './src/index' },
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
            new ForkTsCheckerWebpackPlugin(),
            new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
            // We set process.env.webpack becase there are different code paths if we are bundling around loading resources
            new webpack.DefinePlugin({ 'process.env.webpack': JSON.stringify(true) }),
            new webpack.ProgressPlugin()
        ],
        resolve: {
            alias: { handlebars: 'handlebars/dist/handlebars.min.js' },
            extensions: ['.ts', '.js', '.json']
        },
        target: 'node'
    };
};
