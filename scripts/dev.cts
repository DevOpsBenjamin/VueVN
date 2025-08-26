#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const projectName: string | undefined = process.argv[2];

if (!projectName) {
  console.error('❌ Error: Please provide a project name');
  console.error('Usage: npm run dev <project-name>');
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

// Run concurrently with the project name in environment
spawn(
  'npx',
  [
    'concurrently',
    '-k',
    '-n',
    'GEN,VITE',
    '-c',
    'green,cyan',
    `"tsx scripts/generate.cts --watch"`,
    '"vite"',
  ],
  {
    stdio: 'inherit',
    shell: true,
    env,
  }
);