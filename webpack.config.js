const webpack = require('webpack');
const debug = process.env.NODE_ENV !== 'production';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');

// Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser/');
var phaser = path.join(phaserModule, 'build/custom/phaser-split.js');
var pixi = path.join(phaserModule, 'build/custom/pixi.js');
var p2 = path.join(phaserModule, 'build/custom/p2.js');

module.exports = {
  entry: {
    './game/game': './game/index',
  },
  output: {
    path: __dirname,
    filename: "[name].min.js"
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [
      { test: /pixi\.js/, loader: 'expose?PIXI' },
      { test: /phaser-split\.js$/, loader: 'expose?Phaser' },
      { test: /p2\.js/, loader: 'expose?p2' },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  resolve: {
    extensions: ['', '.js'],
    alias: {
      'phaser': phaser,
      'pixi': pixi,
      'p2': p2,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      DEBUG: debug
    })
  ]
};