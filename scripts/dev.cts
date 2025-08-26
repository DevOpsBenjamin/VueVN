#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const args = process.argv.slice(2);
const projectName: string | undefined = args[0];
const verbose = args.includes('--verbose');

if (!projectName) {
  console.error('❌ Error: Please provide a project name');
  console.error('Usage: npm run dev <project-name> [--verbose]');
  process.exit(1);
}

const projectPath: string = path.join(__dirname, '..', 'projects', projectName);

if (!fs.existsSync(projectPath)) {
  console.error(`❌ Error: Project "${projectName}" does not exist`);
  process.exit(1);
}

console.log(`🎮 Starting dev server for: ${projectName}`);

// Set environment variable and run the dev command
const env = { ...process.env, VUEVN_PROJECT: projectName };

// Configure concurrently options based on verbose flag
const concurrentlyArgs = [
  'concurrently',
  '-k',
  '-n',
  'AUTO_GEN,VITE',
  '-c',
  'green,cyan'
];

if (!verbose) {
  concurrentlyArgs.push(`"tsx scripts/generate.cts --watch"`,);
}
else {  
  concurrentlyArgs.push(`"tsx scripts/generate.cts --watch -- --verbose"`,);
}
concurrentlyArgs.push('"vite"');

// Run concurrently with the project name in environment
spawn('npx', concurrentlyArgs, {
  stdio: 'inherit',
  shell: true,
  env,
});