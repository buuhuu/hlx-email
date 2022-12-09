const path = require('path');
const webpack = require('webpack');

module.exports = {
    devtool: false,
    target: 'node',
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            type: 'commonjs',
        },
    },
    resolve: {
        alias: {
            'uglify-js': false
        },
        fallback: {
            // used by jsdom to support <canvas>
            'canvas': false,
            // used by jsdom for websocket support
            'bufferutil': false,
            'utf-8-validate': false,
        }
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
    ],
};