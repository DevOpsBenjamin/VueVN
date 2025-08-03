#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');

const projectName = process.argv[2];

if (!projectName) {
  console.error('❌ Error: Please provide a project name');
  console.error('Usage: npm run build <project-name>');
  process.exit(1);
}

const projectPath = path.join(__dirname, '..', 'projects', projectName);

if (!fs.existsSync(projectPath)) {
  console.error(`❌ Error: Project "${projectName}" does not exist`);
  process.exit(1);
}

console.log(`🏗️  Building project: ${projectName}`);

// Set environment variable and run commands
const env = { ...process.env, VUEVN_PROJECT: projectName };

try {
  // Generate files
  execSync('node scripts/generate.cjs', { stdio: 'inherit', env });

  // Build with Vite
  execSync('vite build', { stdio: 'inherit', env });

  // Copy assets to dist/assets (inline logic)
  const src = path.join(__dirname, '..', 'projects', projectName, 'assets');
  const dest = path.join(__dirname, '..', 'dist', 'assets');
  try {
    fsExtra.copySync(src, dest, { overwrite: true });
    console.log(`✅ Copied assets for ${projectName} to dist/assets`);
  } catch (e) {
    console.error('❌ Failed to copy assets:', e);
    process.exit(1);
  }

  console.log(`✅ Build complete for: ${projectName}`);
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}
