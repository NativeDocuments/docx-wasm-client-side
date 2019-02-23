const merge = require('webpack-merge');
const params={
    pathinfo: true,
    path:"/"
};
const config = require('./webpack.config.js')(params);
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const env=require('./webpack.env.js');
const copy=require('./webpack.copy.js')(params);

module.exports = merge(config, {
    devServer: {
        host: '127.0.0.1',
        port: 8080,
        https: false,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        },
        historyApiFallback: {
            index: 'host.html',
            disableDotRule: true
        }
    },
    mode: "development",
    plugins: [
        new webpack.DefinePlugin(Object.assign({
            'process.env.NODE_ENV': JSON.stringify("development"),
        }, env['process.env'])),
        new CopyWebpackPlugin(copy)
    ]
});
