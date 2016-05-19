var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'start.js'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'main.js'
  },
  resolve: {
    root: __dirname,
    alias: {
      'TweenLite': 'gsap/src/uncompressed/TweenLite'
    }
  },
  watchOptions: {
    poll: 100
  },
  eslint: {
    configFile: __dirname + '/.eslintrc'
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: "eslint-loader",
        include: [
          path.resolve(__dirname, 'ui')
        ]
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: [
          path.resolve(__dirname, 'ui')
        ],
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css-loader?sourceMap', 'sass-loader?sourceMap']
      },
      {
        test: /\.json$/,
        include: path.join(__dirname, 'node_modules'),
        loader: 'json',
      },
    ]
  },
  devtool: 'source-map'
}
