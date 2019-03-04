'use strict'
require('./check-versions')()

process.env.NODE_ENV = 'production'

const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const commander = require('commander')
const webpack = require('webpack')
const config = require('../config')

/** Accept a flag argument for the 'build:watch' npm script and
  * set the appropriate environment configurations for the build.
**/
commander
  .option('-n, --native', 'Build the native www folder')
  .parse(process.argv)
let webpackConfig, assetsRoot, assetsSubDirectory, spinner
if (commander.native) {
  webpackConfig = require('./webpack.prod-mobile.conf')
  assetsRoot = config.mobile.assetsRoot
  assetsSubDirectory = config.mobile.assetsSubDirectory
  spinner = ora('building for native production...')
} else {
  webpackConfig = require('./webpack.prod.conf')
  assetsRoot = config.build.assetsRoot
  assetsSubDirectory = config.build.assetsSubDirectory
  spinner = ora('building for web production...')
}
spinner.start()

rm(path.join(assetsRoot, assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, (err, stats) => {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      process.exit(1)
    }

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})
