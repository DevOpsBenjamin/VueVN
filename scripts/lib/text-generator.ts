#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { getProjectInfo } from './project-manager';

interface TextFile {
  path: string;
  lang: string;
  content: Record<string, any>;
}

interface TextStructure {
  global: Record<string, Record<string, any>>;
  locations: Record<string, Record<string, any>>;
}

export async function generateTextSystem() {
  const projectInfo = getProjectInfo();
  
  console.log(`🌐 Generating i18n system for project: ${projectInfo.projectName}`);
  
  // Scan for text files
  const textFiles = await scanTextFiles(projectInfo.projectPath);
  const textStructure = buildTextStructure(textFiles);
  const availableLanguages = getAvailableLanguages(textFiles);
  
  // Generate text tree
  const textTreeContent = generateTextTree(textStructure, availableLanguages);
  await writeTextTree(projectInfo.generatePath, textTreeContent);
  
  // Generate text provider
  const textProviderContent = generateTextProvider(availableLanguages);
  await writeTextProvider(projectInfo.generatePath, textProviderContent);
  
  console.log(`✅ i18n system generation complete`);
  console.log(`📊 Found ${availableLanguages.length} languages: ${availableLanguages.join(', ')}`);
  console.log(`📁 Found ${textFiles.length} text files`);
}

async function scanTextFiles(projectPath: string): Promise<TextFile[]> {
  const textFiles: TextFile[] = [];
  
  // Scan global texts
  const globalTextsPath = path.join(projectPath, 'global', 'texts');
  if (fs.existsSync(globalTextsPath)) {
    await scanDirectory(globalTextsPath, 'global', textFiles);
  }
  
  // Scan location texts
  const locationsPath = path.join(projectPath, 'locations');
  if (fs.existsSync(locationsPath)) {
    const locations = fs.readdirSync(locationsPath)
      .filter(item => fs.statSync(path.join(locationsPath, item)).isDirectory());
    
    for (const location of locations) {
      const locationTextsPath = path.join(locationsPath, location, 'texts');
      if (fs.existsSync(locationTextsPath)) {
        await scanDirectory(locationTextsPath, `locations.${location}`, textFiles);
      }
    }
  }
  
  return textFiles;
}

async function scanDirectory(dirPath: string, prefix: string, textFiles: TextFile[]) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      await scanDirectory(itemPath, `${prefix}.${item}`, textFiles);
    } else if (item.endsWith('.ts')) {
      const lang = path.basename(item, '.ts');
      try {
        // Dynamic import to get the text content
        const modulePath = path.resolve(itemPath);
        delete require.cache[modulePath]; // Clear cache for fresh import
        const module = require(modulePath);
        const content = module.default || module;
        
        textFiles.push({
          path: prefix,
          lang,
          content
        });
      } catch (error) {
        console.warn(`⚠️  Failed to load text file: ${itemPath}`, error);
      }
    }
  }
}

function buildTextStructure(textFiles: TextFile[]): TextStructure {
  const structure: TextStructure = {
    global: {},
    locations: {}
  };
  
  for (const textFile of textFiles) {
    const pathParts = textFile.path.split('.');
    let current: any;
    
    if (pathParts[0] === 'global') {
      current = structure.global;
      pathParts.shift(); // Remove 'global'
    } else if (pathParts[0] === 'locations') {
      current = structure.locations;
      pathParts.shift(); // Remove 'locations'
    }
    
    // Navigate/create the nested structure
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Set the language content
    current[textFile.lang] = textFile.content;
  }
  
  return structure;
}

function getAvailableLanguages(textFiles: TextFile[]): string[] {
  const languages = new Set<string>();
  textFiles.forEach(file => languages.add(file.lang));
  return Array.from(languages).sort();
}

function generateTextTree(structure: TextStructure, languages: string[]): string {
  // Generate individual language tree files first
  generateLanguageFiles(structure, languages);
  
  return `// Generated text tree - i18n system
// Auto-generated from text files in project

${languages.map(lang => `import ${lang}Global from './texts/global/${lang}';`).join('\n')}
${languages.map(lang => `import ${lang}Locations from './texts/locations/${lang}';`).join('\n')}

export type TextTree = {
  global: Record<string, any>;
  locations: Record<string, any>;
};

export const textTree: Record<string, TextTree> = {
${languages.map(lang => `  ${lang}: {
    global: ${lang}Global,
    locations: ${lang}Locations
  }`).join(',\n')}
};

export const availableLanguages = [${languages.map(lang => `'${lang}'`).join(', ')}];
`;
}

function generateLanguageFiles(structure: TextStructure, languages: string[]) {
  const projectInfo = getProjectInfo();
  
  for (const lang of languages) {
    // Generate global language file
    const globalData = extractLanguageData(structure.global, lang);
    const globalContent = `// Generated global texts for ${lang}
export default ${JSON.stringify(globalData, null, 2)};
`;
    
    const globalDir = path.join(projectInfo.generatePath, 'texts', 'global');
    if (!fs.existsSync(globalDir)) {
      fs.mkdirSync(globalDir, { recursive: true });
    }
    fs.writeFileSync(path.join(globalDir, `${lang}.ts`), globalContent, 'utf8');
    
    // Generate locations language file
    const locationsData = extractLanguageData(structure.locations, lang);
    const locationsContent = `// Generated location texts for ${lang}
export default ${JSON.stringify(locationsData, null, 2)};
`;
    
    const locationsDir = path.join(projectInfo.generatePath, 'texts', 'locations');
    if (!fs.existsSync(locationsDir)) {
      fs.mkdirSync(locationsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(locationsDir, `${lang}.ts`), locationsContent, 'utf8');
  }
}

function extractLanguageData(structure: any, language: string): any {
  const result: any = {};
  
  for (const [key, value] of Object.entries(structure)) {
    if (value && typeof value === 'object') {
      if (language in value) {
        // This level has language data
        result[key] = value[language];
      } else {
        // Recurse deeper
        const nested = extractLanguageData(value, language);
        if (Object.keys(nested).length > 0) {
          result[key] = nested;
        }
      }
    }
  }
  
  return result;
}

function generateTextProvider(languages: string[]): string {
  return `// Generated text provider - i18n system
import { engineState as useEngineState } from '@generate/stores';
import { textTree, availableLanguages, type TextTree } from './textTree';

class TextProvider {
  private engineState = useEngineState();
  
  getText(path: string): string {
    const currentLang = this.engineState.settings.language;
    const fallbackLang = 'en';
    
    // Split path (e.g., 'global.ui.save' or 'locations.bedroom.morning.wake_up')
    const pathParts = path.split('.');
    
    // Try current language first
    let text = this.getTextFromTree(currentLang, pathParts);
    
    // Fallback to English if not found
    if (text === null && currentLang !== fallbackLang) {
      text = this.getTextFromTree(fallbackLang, pathParts);
    }
    
    // Return key if no translation found
    return text || path;
  }
  
  private getTextFromTree(language: string, pathParts: string[]): string | null {
    const langTree: TextTree | undefined = (textTree as any)[language];
    if (!langTree) return null;
    
    let current: any = langTree;
    
    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return typeof current === 'string' ? current : null;
  }
  
  getCurrentLanguage(): string {
    return this.engineState.settings.language;
  }
  
  setLanguage(language: string): void {
    if (availableLanguages.includes(language)) {
      this.engineState.settings.language = language;
    }
  }
  
  getAvailableLanguages(): string[] {
    return [...availableLanguages];
  }
}

// Global text provider instance
export const t = new TextProvider();

// Helper function for current context
export function createContextHelper(basePath: string) {
  return new Proxy({}, {
    get(target, prop) {
      if (typeof prop === 'string') {
        return t.getText(\`\${basePath}.\${prop}\`);
      }
      return undefined;
    }
  });
}
`;
}

async function writeTextTree(generatePath: string, content: string) {
  const filePath = path.join(generatePath, 'textTree.ts');
  fs.writeFileSync(filePath, content, 'utf8');
}

async function writeTextProvider(generatePath: string, content: string) {
  const filePath = path.join(generatePath, 'textProvider.ts');
  fs.writeFileSync(filePath, content, 'utf8');
}