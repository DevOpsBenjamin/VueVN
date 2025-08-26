#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { getProjectInfo } from '../lib/project-manager';

interface MissingTranslation {
  path: string;
  key: string;
  missingLanguages: string[];
  availableLanguages: string[];
}

async function main() {
  const projectInfo = getProjectInfo();

  console.log(
    `🔍 Checking i18n completeness for project: ${projectInfo.projectName}`
  );

  const missingTranslations: MissingTranslation[] = [];

  // Check global texts
  const globalTextsPath = path.join(projectInfo.projectPath, 'global', 'texts');
  if (fs.existsSync(globalTextsPath)) {
    await checkTextsDirectory(globalTextsPath, 'global', missingTranslations);
  }

  // Check location texts
  const locationsPath = path.join(projectInfo.projectPath, 'locations');
  if (fs.existsSync(locationsPath)) {
    const locations = fs
      .readdirSync(locationsPath)
      .filter((item) =>
        fs.statSync(path.join(locationsPath, item)).isDirectory()
      );

    for (const location of locations) {
      const locationTextsPath = path.join(locationsPath, location, 'texts');
      if (fs.existsSync(locationTextsPath)) {
        await checkTextsDirectory(
          locationTextsPath,
          `locations.${location}`,
          missingTranslations
        );
      }
    }
  }

  // Report results
  if (missingTranslations.length === 0) {
    console.log('✅ All translations are complete!');
  } else {
    console.log(`❌ Found ${missingTranslations.length} translation issues:`);
    console.log('');

    for (const missing of missingTranslations) {
      console.log(`📁 ${missing.path}`);
      console.log(`  🔑 Key: ${missing.key}`);
      console.log(`  ✅ Available: ${missing.availableLanguages.join(', ')}`);
      console.log(`  ❌ Missing: ${missing.missingLanguages.join(', ')}`);
      console.log('');
    }

    // Summary by language
    const languageMissingCount = new Map<string, number>();
    for (const missing of missingTranslations) {
      for (const lang of missing.missingLanguages) {
        languageMissingCount.set(
          lang,
          (languageMissingCount.get(lang) || 0) + 1
        );
      }
    }

    console.log('📊 Missing translations by language:');
    for (const [lang, count] of languageMissingCount.entries()) {
      console.log(`  ${lang}: ${count} missing keys`);
    }

    process.exit(1);
  }
}

async function checkTextsDirectory(
  dirPath: string,
  basePath: string,
  missingTranslations: MissingTranslation[]
): Promise<void> {
  const items = fs.readdirSync(dirPath);

  // Group by directory (each directory should have language files)
  const directories = items.filter((item) =>
    fs.statSync(path.join(dirPath, item)).isDirectory()
  );

  for (const dir of directories) {
    const subDirPath = path.join(dirPath, dir);
    const currentPath = `${basePath}.${dir}`;

    // Check if this directory has language files or subdirectories
    const subItems = fs.readdirSync(subDirPath);
    const languageFiles = subItems.filter((item) => item.endsWith('.ts'));
    const subDirectories = subItems.filter((item) =>
      fs.statSync(path.join(subDirPath, item)).isDirectory()
    );

    if (languageFiles.length > 0) {
      // This directory contains language files
      await checkLanguageFiles(
        subDirPath,
        currentPath,
        languageFiles,
        missingTranslations
      );
    }

    if (subDirectories.length > 0) {
      // Recursively check subdirectories
      await checkTextsDirectory(subDirPath, currentPath, missingTranslations);
    }
  }
}

async function checkLanguageFiles(
  dirPath: string,
  textPath: string,
  languageFiles: string[],
  missingTranslations: MissingTranslation[]
): Promise<void> {
  // Load all language files and their keys
  const languageData = new Map<string, Set<string>>();

  for (const file of languageFiles) {
    const lang = path.basename(file, '.ts');
    const filePath = path.join(dirPath, file);

    try {
      // Load the file and extract keys
      const modulePath = path.resolve(filePath);
      delete require.cache[modulePath]; // Clear cache
      const module = require(modulePath);
      const content = module.default || module;

      const keys = extractKeys(content);
      languageData.set(lang, keys);
    } catch (error) {
      console.warn(`⚠️  Failed to load ${filePath}:`, error);
    }
  }

  if (languageData.size === 0) return;

  // Find all unique keys across all languages
  const allKeys = new Set<string>();
  for (const keys of languageData.values()) {
    for (const key of keys) {
      allKeys.add(key);
    }
  }

  // Check each key exists in all languages
  for (const key of allKeys) {
    const availableLanguages: string[] = [];
    const missingLanguages: string[] = [];

    for (const [lang, keys] of languageData.entries()) {
      if (keys.has(key)) {
        availableLanguages.push(lang);
      } else {
        missingLanguages.push(lang);
      }
    }

    if (missingLanguages.length > 0) {
      missingTranslations.push({
        path: textPath,
        key,
        missingLanguages,
        availableLanguages,
      });
    }
  }
}

function extractKeys(obj: any, prefix: string = ''): Set<string> {
  const keys = new Set<string>();

  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        keys.add(fullKey);
      } else if (typeof value === 'object') {
        const nestedKeys = extractKeys(value, fullKey);
        for (const nestedKey of nestedKeys) {
          keys.add(nestedKey);
        }
      }
    }
  }

  return keys;
}

main().catch(console.error);
