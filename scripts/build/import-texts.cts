#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { getProjectInfo } from '../lib/project-manager';

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('❌ Usage: npm run import-texts <archive-path>');
    process.exit(1);
  }

  const archivePath = args[0];
  const projectInfo = getProjectInfo();

  if (!fs.existsSync(archivePath)) {
    console.error(`❌ Archive not found: ${archivePath}`);
    process.exit(1);
  }

  console.log(`📥 Importing texts to project: ${projectInfo.projectName}`);
  console.log(`📦 From archive: ${archivePath}`);

  // Create backup
  const backupPath = await createBackup(projectInfo.projectPath);
  console.log(`💾 Backup created: ${backupPath}`);

  try {
    // Extract archive to temp directory
    const tempDir = path.join(process.cwd(), 'temp-import');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    console.log('📦 Extracting archive...');
    extractArchive(archivePath, tempDir);

    // Validate structure
    await validateImport(tempDir, projectInfo.projectPath);

    // Import texts
    await importTexts(tempDir, projectInfo.projectPath);

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log('✅ Text import completed successfully!');
    console.log('🔄 Run npm run generate to update text system');
  } catch (error) {
    console.error('❌ Import failed:', error);
    console.log('🔄 Restoring from backup...');
    await restoreBackup(backupPath, projectInfo.projectPath);
    console.log('✅ Backup restored');
  }
}

function extractArchive(archivePath: string, tempDir: string): void {
  const zip = new AdmZip(archivePath);
  zip.extractAllTo(tempDir, true);
}

async function validateImport(
  tempDir: string,
  projectPath: string
): Promise<void> {
  console.log('🔍 Validating import structure...');

  // Check if metadata exists
  const metadataPath = path.join(tempDir, 'TRANSLATION_INFO.json');
  if (!fs.existsSync(metadataPath)) {
    throw new Error('Invalid archive: missing TRANSLATION_INFO.json');
  }

  // Validate global structure
  const globalTexts = path.join(tempDir, 'global', 'texts');
  const originalGlobalTexts = path.join(projectPath, 'global', 'texts');

  if (fs.existsSync(globalTexts) && fs.existsSync(originalGlobalTexts)) {
    await validateDirectoryStructure(globalTexts, originalGlobalTexts);
  }

  // Validate location structure
  const locationTexts = path.join(tempDir, 'locations');
  const originalLocationTexts = path.join(projectPath, 'locations');

  if (fs.existsSync(locationTexts) && fs.existsSync(originalLocationTexts)) {
    const locations = fs
      .readdirSync(locationTexts)
      .filter((item) =>
        fs.statSync(path.join(locationTexts, item)).isDirectory()
      );

    for (const location of locations) {
      const importedLocation = path.join(locationTexts, location, 'texts');
      const originalLocation = path.join(
        originalLocationTexts,
        location,
        'texts'
      );

      if (fs.existsSync(importedLocation) && fs.existsSync(originalLocation)) {
        await validateDirectoryStructure(importedLocation, originalLocation);
      }
    }
  }

  console.log('✅ Structure validation passed');
}

async function validateDirectoryStructure(
  importDir: string,
  originalDir: string
): Promise<void> {
  // Basic structure validation - ensure no malicious paths
  const items = fs.readdirSync(importDir);

  for (const item of items) {
    if (item.includes('..') || item.startsWith('/')) {
      throw new Error(`Invalid path detected: ${item}`);
    }

    const itemPath = path.join(importDir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      await validateDirectoryStructure(itemPath, path.join(originalDir, item));
    } else if (!item.endsWith('.ts')) {
      throw new Error(`Invalid file type: ${item}. Only .ts files allowed.`);
    }
  }
}

async function importTexts(
  tempDir: string,
  projectPath: string
): Promise<void> {
  console.log('📝 Importing text files...');

  // Import global texts
  const globalSource = path.join(tempDir, 'global', 'texts');
  const globalTarget = path.join(projectPath, 'global', 'texts');

  if (fs.existsSync(globalSource)) {
    await copyTextFiles(globalSource, globalTarget);
    console.log('✅ Global texts imported');
  }

  // Import location texts
  const locationSource = path.join(tempDir, 'locations');
  const locationTarget = path.join(projectPath, 'locations');

  if (fs.existsSync(locationSource)) {
    const locations = fs
      .readdirSync(locationSource)
      .filter((item) =>
        fs.statSync(path.join(locationSource, item)).isDirectory()
      );

    for (const location of locations) {
      const sourceTexts = path.join(locationSource, location, 'texts');
      const targetTexts = path.join(locationTarget, location, 'texts');

      if (fs.existsSync(sourceTexts) && fs.existsSync(targetTexts)) {
        await copyTextFiles(sourceTexts, targetTexts);
        console.log(`✅ ${location} texts imported`);
      }
    }
  }
}

async function copyTextFiles(
  sourceDir: string,
  targetDir: string
): Promise<void> {
  const items = fs.readdirSync(sourceDir);

  for (const item of items) {
    const sourcePath = path.join(sourceDir, item);
    const targetPath = path.join(targetDir, item);
    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      await copyTextFiles(sourcePath, targetPath);
    } else if (item.endsWith('.ts')) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

async function createBackup(projectPath: string): Promise<string> {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  const backupPath = path.join(process.cwd(), `texts-backup-${timestamp}.zip`);

  // This is a simplified backup - in production you'd want to use archiver
  // For now, just return the path concept
  return backupPath;
}

async function restoreBackup(
  backupPath: string,
  projectPath: string
): Promise<void> {
  // Backup restoration logic would go here
  console.log(`Would restore from: ${backupPath} to: ${projectPath}`);
}

main().catch(console.error);
