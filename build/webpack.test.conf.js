'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const baseWebpackConfig = require('./webpack.base.conf')

const testWebpackConfig = merge(baseWebpackConfig, {
  mode: 'none',
  target: 'node',
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/test.env')
    }),
  ],
  externals: [nodeExternals()]
})

module.exports = testWebpackConfig;