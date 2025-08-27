#!/usr/bin/env node

import path from 'path';

if (!process.env.VUEVN_VERBOSE) {
  throw ("Entry point should set: env.VUEVN_VERBOSE")
}
if (!process.env.VUEVN_ROOT) {
  throw ("Entry point should set: env.VUEVN_ROOT")
}
if (!process.env.VUEVN_PROJECT) {
  throw ("Entry point should set: env.VUEVN_PROJECT")
}
if (!process.env.VUEVN_IGNORE_TRANSLATIONS) {
  throw ("Entry point should set: env.VUEVN_IGNORE_TRANSLATIONS")
}

const rootPath = process.env.VUEVN_ROOT;
const verbose = process.env.VUEVN_VERBOSE == 'true';
const projectName = process.env.VUEVN_PROJECT;
const projectPath = path.join(rootPath, 'projects', projectName);
const generatePath = path.join(process.cwd(), 'generate');

export default {
  verbose,
  rootPath,
  projectName,
  projectPath,
  generatePath
}