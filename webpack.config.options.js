const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: {
        options: './src/options.js',
    },
    output: {
        filename: 'options.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-env', { targets: { esmodules: true } }]],
                    },
                },
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: 'options.html',
            template: 'src/options.html',
            title: 'HabroSanitizer',
            chunks: [],
            minify: {
                minifyJS: false,
                minifyCSS: false,
            },
        }),
        new CopyPlugin({
            patterns: [
                { from: './src/styles', to: './styles' },
                { from: './src/asset', to: './asset' },
                { from: './src/manifest.json', to: './manifest.json' },
            ],
        }),
    ],
};
