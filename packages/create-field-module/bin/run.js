#!/usr/bin/env node

/* eslint-disable no-console */

import minimist from 'minimist';
import create from './index.js';

async function run() {
  try {
    const argv = minimist(process.argv.slice(2));
    const { _: [targetDir] } = argv;
    await create(targetDir);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
