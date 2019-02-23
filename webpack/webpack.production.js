const merge = require('webpack-merge');
const env=require('./webpack.env.js');
const path = require('path');
const params= {
    pathinfo: false,
    path: path.resolve("dist")
};
const config = require('./webpack.config.js')(params);
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const copy=require('./webpack.copy.js')(params);

module.exports = merge(config, {
    mode: 'production',
    plugins: [
        new webpack.DefinePlugin(Object.assign({
            'process.env.NODE_ENV': JSON.stringify("production"),
        }, env['process.env'])),
        new CopyWebpackPlugin(copy)
    ],
    optimization: {
        minimizer: [
          new UglifyJSPlugin({
            uglifyOptions: {
              compress: {
                warnings: false,
                drop_console: false,
                // This feature has been reported as buggy a few times, such as:
                // https://github.com/mishoo/UglifyJS2/issues/1964
                // We'll wait with enabling it by default until it is more solid.
                // reduce_vars: false,
              },
              output: {
                comments: false,
              },
              sourceMap: false,
            }
          })
        ]
      } 
});
