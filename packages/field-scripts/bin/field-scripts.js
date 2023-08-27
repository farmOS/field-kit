#!/usr/bin/env node

/* eslint-disable no-console */

import minimist from 'minimist';

const printResults = ({
  info, install, lib,
}) => console.log(`
info: ${info.location}
install: ${install.location}
lib: ${lib.location}
`.trim());

async function run() {
  const args = minimist(process.argv.slice(2));
  const { _: [command], ...options } = args;
  if (command === 'build-module') {
    const { default: build } = await import('../build-module/index.js');
    try {
      const results = await build(options);
      printResults(results);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
  if (command === 'develop-module') {
    const { default: develop } = await import('../develop-module/index.js');
    try {
      await develop(options);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}

run();
