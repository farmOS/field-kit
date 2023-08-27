#!/usr/bin/env node

/* eslint-disable no-console */

import create from './index.js';

async function run() {
  const args = process.argv.slice(2);
  try {
    const targetDir = args[0];
    await create(targetDir);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
