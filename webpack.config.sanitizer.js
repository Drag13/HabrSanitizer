const path = require('path');

module.exports = {
    entry: ['./src/sanitizer.js'],
    output: {
        filename: 'sanitizer.js',
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
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        chrome: '55',
                                        firefox: '53', // chrome.storage.sync works from 53
                                    },
                                },
                            ],
                        ],
                    },
                },
            },
        ],
    },
    plugins: [],
};
