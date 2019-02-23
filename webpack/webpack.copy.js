const env = require('./webpack.env.js');
const path = require('path');

module.exports = function (params) {
    return [
        {
            context: path.resolve(__dirname, '..'),
            from: 'host.html',
            to: 'host.html'
        },
        {
            context: path.join(path.resolve(__dirname, '../node_modules'), '@nativedocuments', 'docx-wasm'),
            from: 'noox_worker.wasm',
            to: env.docxwasmURL
        },
        {
            context: path.join(path.resolve(__dirname, '../node_modules'), '@nativedocuments', 'fontpool'),
            from: '.*',
            to: env.fontpoolURL
        },
        {
            context: path.join(path.resolve(__dirname, '../node_modules'), '@nativedocuments', 'fontpool'),
            from: '*.ttf',
            to: env.fontpoolURL
        }
    ];
};