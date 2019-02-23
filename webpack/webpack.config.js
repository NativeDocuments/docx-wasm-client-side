const webpack = require('webpack');
const path = require('path');
const env=require('./webpack.env.js');

module.exports = function (params) {
  return {
    entry: {
      "worker": "./worker/worker.js",
      "host": "./host/host.js",
    },
    output: {
      pathinfo: params.pathinfo,
      path: params.path,
      publicPath: "/",
      devtoolModuleFilenameTemplate: info =>
        path.resolve(info.absoluteResourcePath)
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: "string-replace-loader",
          options: {
            multiple: [
              { // Module['ENVIRONMENT'] => 'WORKER'
                search: "Module\\['ENVIRONMENT'\\]|Module\\[\"ENVIRONMENT\"\\]",
                replace: "'WORKER'",
                flags: 'g'
              },
              { // var ENVIRONMENT_IS_WEB = false; => 
                // ENVIRONMENT_IS_WEB = true; => 
                search: "(var)? *ENVIRONMENT_IS_(NODE|WEB|SHELL|WORKER) *=.*;",
                replace: "",
                flags: 'g'
              },
              { // ENVIRONMENT_IS_WEB => false
                search: "ENVIRONMENT_IS_(NODE|WEB|SHELL)",
                replace: "false",
                flags: 'g'
              },
              { // ENVIRONMENT_IS_WORKER => true
                search: "ENVIRONMENT_IS_WORKER",
                replace: "true",
                flags: 'g'
              }
            ]
          }
        },
        { // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
          test: /\.tsx?$/,
          loader: "awesome-typescript-loader"
        },
        {
          test: /\.svg$/,
          loader: "url-loader"
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.js$/,
          use: ["source-map-loader"],
          enforce: "pre"
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          query: {
            presets: ['@babel/preset-env', '@babel/react']
          }
        }
      ]
    },
    performance: {
      assetFilter: function (assetFilename) {
        return !assetFilename.endsWith('.ttf') && !assetFilename.endsWith('/.fontdata') && !assetFilename.endsWith('/noox_worker.wasm');
      }
    },
    "externals": {
    }
  };
};