// Génère src/generate/engine.ts avec tous les fichiers .ts du moteur (project files > core)
const fs = require('fs');
const path = require('path');

// Get current project from environment
const currentProject = process.env.VUEVN_PROJECT;
if (!currentProject) {
  console.error(
    'No project specified. This script should be run via npm run dev/build'
  );
  process.exit(1);
}

// Scan engine and project folders
const outDir = path.join(__dirname, '../src/generate');
if (fs.existsSync(outDir)) {
  fs.rmdirSync(outDir, { recursive: true });
  console.log(
    `Deleted existing generated files for project: ${currentProject}`
  );
}
