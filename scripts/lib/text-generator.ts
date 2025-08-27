#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { getProjectInfo } from './project-manager';

const verbose: boolean = process.env.VUEVN_VERBOSE! == 'true';

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

  if (verbose) {
    console.log(
      `🌐 Generating i18n system for project: ${projectInfo.projectName}`
    );
  }

  // Scan for text files
  const textFiles = await scanTextFiles(projectInfo.projectPath);
  const availableLanguages = getAvailableLanguages(textFiles);

  // Generate direct import-based text system
  await generateImportBasedTextSystem(projectInfo, textFiles, availableLanguages);

  if (verbose) {
    console.log(`✅ i18n system generation complete`);
    console.log(
      `📊 Found ${
        availableLanguages.length
      } languages: ${availableLanguages.join(', ')}`
    );
    console.log(`📁 Found ${textFiles.length} text files`);
  }
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
    const locations = fs
      .readdirSync(locationsPath)
      .filter((item) =>
        fs.statSync(path.join(locationsPath, item)).isDirectory()
      );

    for (const location of locations) {
      const locationTextsPath = path.join(locationsPath, location, 'texts');
      if (fs.existsSync(locationTextsPath)) {
        await scanDirectory(
          locationTextsPath,
          `locations.${location}`,
          textFiles
        );
      }
    }
  }

  return textFiles;
}

async function scanDirectory(
  dirPath: string,
  prefix: string,
  textFiles: TextFile[]
) {
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
          content,
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
    locations: {},
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
  textFiles.forEach((file) => languages.add(file.lang));
  return Array.from(languages).sort();
}

async function generateImportBasedTextSystem(
  projectInfo: any,
  textFiles: TextFile[],
  availableLanguages: string[]
) {
  // Group text files by location and event
  const textStructure = buildTextStructure(textFiles);
  
  // Create generate/texts directory structure
  const generateTextsPath = path.join(projectInfo.generatePath, 'texts');
  if (!fs.existsSync(generateTextsPath)) {
    fs.mkdirSync(generateTextsPath, { recursive: true });
  }

  // Generate global texts
  await generateGlobalTexts(projectInfo, textStructure.global, availableLanguages);

  // Generate location texts
  await generateLocationTexts(projectInfo, textStructure.locations, availableLanguages);

  // Generate main text provider with direct imports
  await generateImportBasedTextProvider(projectInfo, textStructure, availableLanguages);
}

async function generateGlobalTexts(
  projectInfo: any,
  globalStructure: any,
  availableLanguages: string[]
) {
  const generateGlobalTextsPath = path.join(projectInfo.generatePath, 'texts', 'global');
  if (!fs.existsSync(generateGlobalTextsPath)) {
    fs.mkdirSync(generateGlobalTextsPath, { recursive: true });
  }

  // Generate each category (intro, ui, etc.)
  for (const [category, categoryData] of Object.entries(globalStructure)) {
    const categoryPath = path.join(generateGlobalTextsPath, category);
    if (!fs.existsSync(categoryPath)) {
      fs.mkdirSync(categoryPath, { recursive: true });
    }

    // Generate index.ts with imports for each language
    const imports = availableLanguages.map(lang => {
      return `import ${lang}_${category} from '@project/global/texts/${category}/${lang}';`;
    }).join('\n');

    const exports = availableLanguages.map(lang => {
      return `  ${lang}: ${lang}_${category}`;
    }).join(',\n');

    const content = `// Generated global texts for ${category}
${imports}

export const ${category}Texts = {
${exports}
};

// Default export uses base language (English)
export default ${category}Texts.en;
`;

    fs.writeFileSync(path.join(categoryPath, 'index.ts'), content);
  }

  // Generate global index.ts
  const categories = Object.keys(globalStructure);
  const categoryImports = categories.map(category => {
    return `import { ${category}Texts } from './${category}';`;
  }).join('\n');

  const categoryExports = categories.map(category => {
    return `  ${category}: ${category}Texts`;
  }).join(',\n');

  const globalIndexContent = `// Generated global texts index
${categoryImports}

export const globalTexts = {
${categoryExports}
};

export default globalTexts;
`;

  fs.writeFileSync(path.join(generateGlobalTextsPath, 'index.ts'), globalIndexContent);
}

async function generateLocationTexts(
  projectInfo: any,
  locationsStructure: any,
  availableLanguages: string[]
) {
  const generateLocationTextsPath = path.join(projectInfo.generatePath, 'texts', 'locations');
  if (!fs.existsSync(generateLocationTextsPath)) {
    fs.mkdirSync(generateLocationTextsPath, { recursive: true });
  }

  // Generate each location
  for (const [locationName, locationData] of Object.entries(locationsStructure)) {
    const locationPath = path.join(generateLocationTextsPath, locationName);
    if (!fs.existsSync(locationPath)) {
      fs.mkdirSync(locationPath, { recursive: true });
    }

    // Generate each event in the location
    for (const [eventName, eventData] of Object.entries(locationData as any)) {
      const eventPath = path.join(locationPath, eventName);
      if (!fs.existsSync(eventPath)) {
        fs.mkdirSync(eventPath, { recursive: true });
      }

      // Generate index.ts with imports for each language
      const imports = availableLanguages.map(lang => {
        return `import ${lang}_${eventName} from '@project/locations/${locationName}/texts/${eventName}/${lang}';`;
      }).join('\n');

      const exports = availableLanguages.map(lang => {
        return `  ${lang}: ${lang}_${eventName}`;
      }).join(',\n');

      const content = `// Generated location texts for ${locationName}/${eventName}
${imports}

export const ${eventName}Texts = {
${exports}
};

// Default export uses base language (English)
export default ${eventName}Texts.en;
`;

      fs.writeFileSync(path.join(eventPath, 'index.ts'), content);
    }

    // Generate location index.ts
    const events = Object.keys(locationData as any);
    const eventImports = events.map(eventName => {
      return `import { ${eventName}Texts } from './${eventName}';`;
    }).join('\n');

    const eventExports = events.map(eventName => {
      return `  ${eventName}: ${eventName}Texts`;
    }).join(',\n');

    const locationIndexContent = `// Generated location texts index for ${locationName}
${eventImports}

export const ${locationName}Texts = {
${eventExports}
};

export default ${locationName}Texts;
`;

    fs.writeFileSync(path.join(locationPath, 'index.ts'), locationIndexContent);
  }

  // Generate locations index.ts
  const locations = Object.keys(locationsStructure);
  const locationImports = locations.map(locationName => {
    return `import { ${locationName}Texts } from './${locationName}';`;
  }).join('\n');

  const locationExports = locations.map(locationName => {
    return `  ${locationName}: ${locationName}Texts`;
  }).join(',\n');

  const locationsIndexContent = `// Generated locations texts index
${locationImports}

export const locationTexts = {
${locationExports}
};

export default locationTexts;
`;

  fs.writeFileSync(path.join(generateLocationTextsPath, 'index.ts'), locationsIndexContent);
}

async function generateImportBasedTextProvider(
  projectInfo: any,
  textStructure: any,
  availableLanguages: string[]
) {
  const content = `// Generated text provider with direct imports
import { engineState as useEngineState } from '@generate/stores';
import { gameState } from '@generate/stores';
import { globalTexts } from './texts/global';
import { locationTexts } from './texts/locations';

class TextProvider {
  private engineState = useEngineState();
  
  getCurrentLanguage(): string {
    const gameConfig = gameState.config;
    const currentLang = this.engineState.settings.language;
    const defaultLang = gameConfig?.defaultLanguage || 'en';
    return currentLang || defaultLang;
  }
  
  setLanguage(language: string): void {
    const availableLanguages = ${JSON.stringify(availableLanguages)};
    if (availableLanguages.includes(language)) {
      this.engineState.settings.language = language;
    }
  }
  
  getAvailableLanguages(): string[] {
    return ${JSON.stringify(availableLanguages)};
  }

  // Main method: gets text in current language using English reference
  get(englishText: string): string {
    const currentLang = this.getCurrentLanguage();
    if (currentLang === 'en') {
      return englishText; // Already English
    }
    
    // For now, simple fallback - you can enhance this with path mapping
    return englishText; // Fallback to English until we implement mapping
  }
}

// Global text provider instance
export const t = new TextProvider();

// Direct import text access - always English, type-safe, Ctrl+click navigation
export const text = {
  global: globalTexts,
  locations: locationTexts
} as const;

// Helper function for variable interpolation
export function interpolate(text: string, variables: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp('{' + key + '}', 'g'), value);
  }
  return result;
}

export const availableLanguages = ${JSON.stringify(availableLanguages)};
`;

  fs.writeFileSync(path.join(projectInfo.generatePath, 'textProvider.ts'), content);
}