#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { getProjectInfo } from './lib/project-manager';

async function main() {
  const projectInfo = getProjectInfo();
  
  console.log(`📤 Exporting texts for project: ${projectInfo.projectName}`);
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  const archiveName = `${projectInfo.projectName}-texts-${timestamp}.zip`;
  const archivePath = path.join(process.cwd(), archiveName);
  
  // Create archive using adm-zip
  const zip = new AdmZip();
  
  // Add global texts
  const globalTextsPath = path.join(projectInfo.projectPath, 'global', 'texts');
  if (fs.existsSync(globalTextsPath)) {
    console.log('📁 Adding global texts...');
    addDirectoryToZip(zip, globalTextsPath, 'global/texts');
  }
  
  // Add location texts
  const locationsPath = path.join(projectInfo.projectPath, 'locations');
  if (fs.existsSync(locationsPath)) {
    const locations = fs.readdirSync(locationsPath)
      .filter(item => fs.statSync(path.join(locationsPath, item)).isDirectory());
    
    for (const location of locations) {
      const locationTextsPath = path.join(locationsPath, location, 'texts');
      if (fs.existsSync(locationTextsPath)) {
        console.log(`📁 Adding ${location} texts...`);
        addDirectoryToZip(zip, locationTextsPath, `locations/${location}/texts`);
      }
    }
  }
  
  // Create metadata file
  const metadata = {
    project: projectInfo.projectName,
    exportDate: new Date().toISOString(),
    structure: await getTextStructure(projectInfo.projectPath),
    instructions: {
      'en': 'Translate the text values while keeping the keys unchanged. Preserve the file structure.',
      'fr': 'Traduisez les valeurs de texte en gardant les clés inchangées. Préservez la structure des fichiers.',
      'es': 'Traduce los valores de texto manteniendo las claves sin cambios. Conserva la estructura de archivos.',
      'de': 'Übersetzen Sie die Textwerte, während Sie die Schlüssel unverändert lassen. Bewahren Sie die Dateistruktur.',
      'ja': 'キーを変更せずにテキスト値を翻訳してください。ファイル構造を保持してください。',
      'ko': '키는 변경하지 않고 텍스트 값만 번역하세요. 파일 구조를 유지하세요.',
      'zh': '翻译文本值，保持键不变。保持文件结构。'
    }
  };
  
  zip.addFile('TRANSLATION_INFO.json', Buffer.from(JSON.stringify(metadata, null, 2)));
  
  // Write archive
  zip.writeZip(archivePath);
  
  const stats = fs.statSync(archivePath);
  console.log(`✅ Text archive created: ${archiveName}`);
  console.log(`📊 Total size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📁 Ready for translation team!`);
}

function addDirectoryToZip(zip: AdmZip, dirPath: string, zipPath: string) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      addDirectoryToZip(zip, itemPath, `${zipPath}/${item}`);
    } else {
      zip.addLocalFile(itemPath, zipPath);
    }
  }
}

async function getTextStructure(projectPath: string) {
  const structure: any = {};
  
  // Scan global
  const globalTextsPath = path.join(projectPath, 'global', 'texts');
  if (fs.existsSync(globalTextsPath)) {
    structure.global = await scanTextStructure(globalTextsPath);
  }
  
  // Scan locations
  const locationsPath = path.join(projectPath, 'locations');
  if (fs.existsSync(locationsPath)) {
    structure.locations = {};
    const locations = fs.readdirSync(locationsPath)
      .filter(item => fs.statSync(path.join(locationsPath, item)).isDirectory());
    
    for (const location of locations) {
      const locationTextsPath = path.join(locationsPath, location, 'texts');
      if (fs.existsSync(locationTextsPath)) {
        structure.locations[location] = await scanTextStructure(locationTextsPath);
      }
    }
  }
  
  return structure;
}

async function scanTextStructure(dirPath: string): Promise<any> {
  const structure: any = {};
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      structure[item] = await scanTextStructure(itemPath);
    } else if (item.endsWith('.ts')) {
      const lang = path.basename(item, '.ts');
      if (!structure._languages) {
        structure._languages = [];
      }
      if (!structure._languages.includes(lang)) {
        structure._languages.push(lang);
      }
    }
  }
  
  return structure;
}

main().catch(console.error);