#!/usr/bin/env -S node --loader tsx
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

const rootDir = path.join(__dirname, '..');
const templateDir = path.join(rootDir, 'projects', '0-template');
const templatePath = path.join(rootDir, 'template', 'template.zip');

console.log('📦 Updating project template from 0-template...');

// Check if template project exists
if (!fs.existsSync(templateDir)) {
  console.error('❌ Error: Sample project not found at projects/0-template');
  process.exit(1);
}

function createTemplate() {
  try {
    // Remove existing template if it exists
    if (fs.existsSync(templatePath)) {
      fs.unlinkSync(templatePath);
      console.log('🗑️  Removed existing template.zip');
    }

    // Create zip of template project using adm-zip
    console.log('🔄 Zipping template project...');

    const zip = new AdmZip();

    // Add template directory to zip, excluding unwanted files
    const addDirectory = (dirPath: string, zipPath: string) => {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const zipItemPath = path.join(zipPath, item).replace(/\\/g, '/');

        // Skip unwanted files/directories
        if (
          item === 'node_modules' ||
          item === '.git' ||
          item === 'dist' ||
          item === '.DS_Store' ||
          item === 'Thumbs.db' ||
          item.endsWith('.log')
        ) {
          continue;
        }

        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          addDirectory(fullPath, zipItemPath);
        } else {
          zip.addLocalFile(
            fullPath,
            path.dirname(zipItemPath),
            path.basename(zipItemPath)
          );
        }
      }
    };

    addDirectory(templateDir, '0-template');

    // Write zip file
    zip.writeZip(templatePath);

    const stats = fs.statSync(templatePath);
    console.log(`✅ Template updated successfully!`);
    console.log(`📁 File: template.zip (${Math.round(stats.size / 1024)}KB)`);
    console.log(`🎯 Template based on: projects/template/`);
    console.log(`\n💡 You can now create new projects with:`);
    console.log(`   npm run add-project <project-name>`);
  } catch (error) {
    console.error(
      '❌ Error creating template:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

try {
  createTemplate();
} catch (error) {
  console.error(
    '❌ Error creating template:',
    error instanceof Error ? error.message : error
  );
  process.exit(1);
}
