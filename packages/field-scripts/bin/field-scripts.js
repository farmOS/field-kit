#!/usr/bin/env node
/* eslint-disable no-console */
import path from 'path';

const parseOptions = (args = []) => {
  const [head, ...tail] = args;
  if (!head || tail.length === 0) return {};
  if (head === '--config' && typeof tail[0] === 'string') {
    const config = path.resolve(process.cwd(), tail[0]);
    return { config };
  }
  return parseOptions(tail);
};

const printResults = ({
  info, install, lib,
}) => console.log(`
info: ${info.location}
install: ${install.location}
lib: ${lib.location}
`.trim());

async function run() {
  const args = process.argv.slice(2);
  const [script, ...rest] = args;
  if (script === 'build-module') {
    const { default: build } = await import('../build-module/index.js');
    try {
      const options = parseOptions(rest);
      const results = await build(options);
      printResults(results);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
  if (script === 'develop-module') {
    const { default: develop } = await import('../develop-module/index.js');
    try {
      const options = parseOptions(rest);
      await develop(options);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}

run();
