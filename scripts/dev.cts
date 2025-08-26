#!/usr/bin/env node
import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const argv = process.argv.slice(2);
const slashOpts = argv.filter((a) => a.startsWith('/'));
const Opts = argv.filter((a) => !a.startsWith('/'));
const rootFolder = path.join(__dirname, '..');

const ignoreTranslations = slashOpts.includes('/ignore-translations');
const verbose = slashOpts.includes('/verbose');

if (Opts.length !== 1) {
  console.error('❌ Error: Please provide a project name');
  console.error(
    '❌ Usage: npm run build <project> [/ignore-translations] [/verbose]'
  );
  process.exit(1);
}
const projectName = Opts[0];
const projectPath: string = path.join(rootFolder, 'projects', projectName);

if (!fs.existsSync(projectPath)) {
  console.error(`❌ Error: Project "${projectName}" does not exist`);
  process.exit(1);
}

// Set environment variable and run commands
const env = {
  ...process.env,
  VUEVN_PROJECT: projectName,
  VUEVN_IGNORE_TRANSLATIONS: ignoreTranslations ? 'true' : 'false',
  VUEVN_VERBOSE: verbose ? 'true' : 'false',
  VUEVN_ROOT: rootFolder,
};

// Step 3: Copy assets
console.log('🖨️  Copying assets...');
execSync('tsx scripts/build/copy-assets.cts', { stdio: 'inherit', env });
console.log(`✅ Done`);

console.log(`🎮 Starting dev server for: ${projectName}`);

// Run concurrently with the project name in environment
spawn('npx', [
  'concurrently', 
  '-k', 
  '-n', 
  'AUTO_GEN,VITE', 
  '-c', 
  'green,cyan', 
  '"tsx scripts/generate.cts --watch"', 
  'vite'
], {
  stdio: 'inherit',
  shell: true,
  env,
});
