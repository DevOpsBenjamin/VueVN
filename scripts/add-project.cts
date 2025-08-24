#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import AdmZip from 'adm-zip';

const rootDir = path.join(__dirname, '..');
const templatePath = path.join(rootDir, 'template.zip');

// Get project name from command line
const projectName: string | undefined = process.argv[2];

if (!projectName) {
  console.error('❌ Error: Please provide a project name');
  console.error('Usage: npm run add-project <project-name>');
  process.exit(1);
}

// Validate project name
if (!/^[a-zA-Z0-9-_]+$/.test(projectName)) {
  console.error(
    '❌ Error: Project name should only contain letters, numbers, hyphens and underscores'
  );
  process.exit(1);
}

const projectPath: string = path.join(__dirname, '..', 'projects', projectName);

// Check if project already exists
if (fs.existsSync(projectPath)) {
  console.error(`❌ Error: Project "${projectName}" already exists`);
  process.exit(1);
}

console.log(`🚀 Creating project "${projectName}" from template...`);

try {
  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    console.error('❌ Error: Template not found. Please run "npm run update-template" first');
    console.error('💡 This will create a template.zip from the current sample project');
    process.exit(1);
  }

  // Create projects directory if it doesn't exist
  const projectsDir = path.join(rootDir, 'projects');
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
  }

  // Extract template using adm-zip directly to project name
  console.log('📦 Extracting template...');
  const zip = new AdmZip(templatePath);
  const entries = zip.getEntries();
  
  // Extract each file, changing 'sample/' prefix to project name
  for (const entry of entries) {
    if (entry.entryName.startsWith('sample/')) {
      const newPath = entry.entryName.replace(/^sample\//, `${projectName}/`);
      const fullPath = path.join(projectsDir, newPath);
      
      if (entry.isDirectory) {
        fs.mkdirSync(fullPath, { recursive: true });
      } else {
        // Ensure directory exists
        const dir = path.dirname(fullPath);
        fs.mkdirSync(dir, { recursive: true });
        // Write file
        fs.writeFileSync(fullPath, entry.getData());
      }
    }
  }
  console.log(`📁 Extracted template → ${projectName}`);

  // Update config.json with new project name
  const configPath = path.join(projectPath, 'config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.name = projectName;
    config.settings.gameTitle = projectName;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`📝 Updated config.json with project name`);
  }

  // Update README.md title
  const readmePath = path.join(projectPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    readme = readme.replace(/^# Sample VueVN Project$/m, `# ${projectName}`);
    readme = readme.replace(/npm run dev sample/g, `npm run dev ${projectName}`);
    readme = readme.replace(/npm run build sample/g, `npm run build ${projectName}`);
    readme = readme.replace(/A demonstration visual novel showcasing all VueVN engine features/, `${projectName} - A visual novel created with VueVN`);
    fs.writeFileSync(readmePath, readme);
    console.log(`📝 Updated README.md with project name`);
  }

  console.log(`
✅ Project "${projectName}" created successfully!

📋 Your project includes:
   • All current sample project features (events, assets, components)
   • TimingGame.vue minigame component
   • Complete test events demonstrating engine capabilities
   • Up-to-date with latest VueVN architecture

📝 Next steps:
   1. Start development: "npm run dev ${projectName}"
   2. Open your browser to http://localhost:5173/
   3. Customize your visual novel by editing files in projects/${projectName}/
   4. The sample events show you how to use all engine features!

💡 To update the template with latest sample changes:
   npm run update-template`);

} catch (error) {
  console.error('❌ Error creating project:', error instanceof Error ? error.message : error);
  
  // Cleanup failed extraction
  if (fs.existsSync(projectPath)) {
    fs.rmSync(projectPath, { recursive: true, force: true });
  }
  const failedSample = path.join(rootDir, 'projects', 'sample');
  if (fs.existsSync(failedSample) && failedSample !== path.join(rootDir, 'projects', 'sample')) {
    fs.rmSync(failedSample, { recursive: true, force: true });
  }
  
  process.exit(1);
}