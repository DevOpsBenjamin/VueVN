#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';

const projectName: string | undefined = process.env.VUEVN_PROJECT;

if (!projectName) {
  console.error('❌ Error: Project name not found in environment variables. This script should be called from another script that sets VUEVN_PROJECT.');
  process.exit(1);
}

const projectPath: string = path.join(__dirname, '..', 'projects', projectName);

if (!fs.existsSync(projectPath)) {
  console.error(`❌ Error: Project "${projectName}" does not exist`);
  process.exit(1);
}

console.log(`🖨️  Copying assets for project: ${projectName}`);

const src: string = path.join(projectPath, 'assets');
const dest: string = path.join(__dirname, '..', 'dist', 'assets');

if (!fs.existsSync(src)) {
    console.log(`🟡 No assets directory found for project "${projectName}". Skipping.`);
    process.exit(0);
}

try {
  fsExtra.copySync(src, dest, { overwrite: true });
  console.log(`✅ Copied assets for ${projectName} to dist/assets`);
} catch (e: any) {
  console.error('❌ Failed to copy assets:', e);
  process.exit(1);
}
