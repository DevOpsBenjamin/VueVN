#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const args = process.argv.slice(2);
const projectName: string | undefined = args[0];
const ignoreTranslations = args.includes('--ignore-translations');

if (!projectName) {
  console.error('❌ Error: Please provide a project name');
  console.error('Usage: npm run build <project-name> [--ignore-translations]');
  process.exit(1);
}

const projectPath: string = path.join(__dirname, '..', 'projects', projectName);

if (!fs.existsSync(projectPath)) {
  console.error(`❌ Error: Project "${projectName}" does not exist`);
  process.exit(1);
}

console.log(`🏗️  Building project: ${projectName}`);

// Set environment variable and run commands
const env = { ...process.env, VUEVN_PROJECT: projectName };

try {
  // Step 1: Verify project before building
  console.log('🔍 Verifying project quality...');
  const verifyCommand = `tsx scripts/verify-project.cts ${projectName}${ignoreTranslations ? ' --ignore-translations' : ''}`;
  execSync(verifyCommand, { stdio: 'inherit', env });
  
  // Step 2: Generate files
  execSync('tsx scripts/generate.cts', { stdio: 'inherit', env });

  // Build with Vite using game config
  execSync('vite build --config vite.config.game.js', { stdio: 'inherit', env });

  // Copy assets
  execSync('tsx scripts/copy-assets.cts', { stdio: 'inherit', env });

  console.log(`✅ Build complete for: ${projectName}`);
} catch (error: any) {
  console.error('❌ Build failed');
  process.exit(1);
}