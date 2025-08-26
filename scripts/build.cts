#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

//const ignoreTranslations: boolean =
//process.env.VUEVN_IGNORE_TRANSLATIONS! == 'true';

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

console.log(`🏗️  Building project: ${projectName}`);

try {
  // Step 1: Generate files
  console.log('📦 Generating project files...');
  execSync('tsx scripts/generate.cts', { stdio: 'inherit', env });

  // Step 2: Verify project before building
  console.log('🔍 Verifying project quality...');
  execSync('tsx scripts/build/verify-project.cts', { stdio: 'inherit', env });

  // Step 3: Build with Vite
  console.log('🏗️  Building with Vite...');
  execSync('npx vite build --config vite.config.game.js', {
    stdio: verbose ? 'inherit' : 'ignore',
    env,
  });

  console.log('🖨️  Copying assets...');
  // Step 4: Copy assets
  execSync('tsx scripts/build/copy-assets.cts', { stdio: 'inherit', env });

  console.log(`✅ Build complete for: ${projectName}`);
} catch (error: any) {
  console.error('❌ Build failed');
  if (!verbose) {
    console.error('   → Use  [/verbose] flag for detailed error output');
    console.error(
      'Usage: npm run build <project> [/ignore-translations] [/verbose]'
    );
  }
  process.exit(1);
}
