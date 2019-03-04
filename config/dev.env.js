'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./web.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  PLATFORM: '"dev"'
})
