import fs from 'fs';
import path from 'path';
import projectsvars from './project-vars'

interface TextFile {
  en: string;
  fr?: string;
}

interface LocationTexts {
  [actionName: string]: {
    [key: string]: TextFile;
  };
}

interface GlobalTexts {
  [key: string]: TextFile;
}

export function generateTextSystemV2(projectName?: string) {
  if (!projectName) {
    projectName = process.env.VUEVN_PROJECT;
    if (!projectName) {
      throw new Error('No project name provided and VUEVN_PROJECT not set');
    }
  }
  const projectPath = projectsvars.projectPath;
  const generatePath = projectsvars.generatePath;
  
  // Ensure generate directories exist
  fs.mkdirSync(path.join(generatePath, 'texts'), { recursive: true });
  fs.mkdirSync(path.join(generatePath, 'texts/locations'), { recursive: true });
  fs.mkdirSync(path.join(generatePath, 'texts/global'), { recursive: true });

  const locationTexts = generateLocationTexts(projectPath, generatePath);
  const globalTexts = generateGlobalTexts(projectPath, generatePath);
  
  generateMainTextIndex(generatePath);
}

function generateLocationTexts(projectPath: string, generatePath: string): string[] {
  const locationsPath = path.join(projectPath, 'locations');
  const locations: string[] = [];
  
  if (!fs.existsSync(locationsPath)) {
    return locations;
  }

  const locationNames = fs.readdirSync(locationsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const locationName of locationNames) {
    const locationTextsPath = path.join(locationsPath, locationName, 'texts');
    
    if (!fs.existsSync(locationTextsPath)) {
      continue;
    }

    locations.push(locationName);
    
    // Generate texts for each action in this location
    const actionNames = fs.readdirSync(locationTextsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const actionTexts: string[] = [];
    
    for (const actionName of actionNames) {
      const actionTextsPath = path.join(locationTextsPath, actionName);
      const textFiles = generateActionTexts(actionTextsPath, actionName, generatePath, locationName);
      actionTexts.push(...textFiles);
    }

    // Generate location texts index
    generateLocationTextIndex(generatePath, locationName, actionNames);
  }

  // Generate main locations index
  generateLocationMainIndex(generatePath, locations);
  
  return locations;
}

function generateActionTexts(actionTextsPath: string, actionName: string, generatePath: string, locationName: string): string[] {
  const textKeys: string[] = [];
  
  // Look for language files
  const enFile = path.join(actionTextsPath, 'en.ts');
  const frFile = path.join(actionTextsPath, 'fr.ts');
  
  if (!fs.existsSync(enFile)) {
    return textKeys;
  }

  // Read and parse English texts to get all keys
  const enContent = fs.readFileSync(enFile, 'utf-8');
  const enExport = extractExportedTexts(enContent);
  
  // Read French texts if available
  let frExport: Record<string, string> = {};
  if (fs.existsSync(frFile)) {
    const frContent = fs.readFileSync(frFile, 'utf-8');
    frExport = extractExportedTexts(frContent);
  }
  
  // Generate Text objects for each text key
  const textObjects: string[] = [];
  
  for (const [key, enText] of Object.entries(enExport)) {
    const frText = frExport[key] || null;
    
    textObjects.push(`  ${key}: {
    en: ${JSON.stringify(enText)},
    fr: ${frText ? JSON.stringify(frText) : 'null'}
  } as Text`);
    
    textKeys.push(key);
  }
  
  // Create the action text file
  const actionContent = `// Generated text objects for ${locationName}/${actionName}
import type { Text } from '@generate/types';

export const ${actionName}Texts = {
${textObjects.join(',\n')}
} as const;

export default ${actionName}Texts;
`;
  
  // Ensure location directory exists
  const locationTextPath = path.join(generatePath, 'texts/locations', locationName);
  fs.mkdirSync(locationTextPath, { recursive: true });
  
  // Write the action text file directly in the location directory
  fs.writeFileSync(path.join(locationTextPath, `${actionName}.ts`), actionContent);
  
  return textKeys;
}

function extractExportedTexts(content: string): Record<string, string> {
  const texts: Record<string, string> = {};
  
  // Handle default export object (main pattern we expect)
  const defaultExportMatch = content.match(/export\s+default\s+\{([^}]+)\}\s*as\s+const;?/s);
  if (defaultExportMatch) {
    const objContent = defaultExportMatch[1];
    // Improved regex to handle multiline strings and various quote types
    const propRegex = /(\w+):\s*["'`]([^"'`]*(?:\n[^"'`]*)*?)["'`]/gs;
    let propMatch;
    
    while ((propMatch = propRegex.exec(objContent)) !== null) {
      // Clean up the text content (remove extra whitespace, handle escapes)
      const cleanText = propMatch[2]
        .replace(/\\n/g, '\n')
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .trim();
      texts[propMatch[1]] = cleanText;
    }
  }
  
  return texts;
}

function generateLocationTextIndex(generatePath: string, locationName: string, actionNames: string[]) {
  const locationDir = path.join(generatePath, 'texts/locations', locationName);
  fs.mkdirSync(locationDir, { recursive: true });

  const imports = actionNames.map(actionName => 
    `import { ${actionName}Texts } from './${actionName}';`
  ).join('\n');

  const exports = actionNames.map(actionName => 
    `  ${actionName}: ${actionName}Texts`
  ).join(',\n');

  const content = `// Generated location texts index for ${locationName}
${imports}

export const ${locationName}Texts = {
${exports}
} as const;

export default ${locationName}Texts;
`;

  fs.writeFileSync(path.join(locationDir, 'index.ts'), content);
}

function generateLocationMainIndex(generatePath: string, locations: string[]) {
  const imports = locations.map(location => 
    `import { ${location}Texts } from './${location}';`
  ).join('\n');

  const exports = locations.map(location => 
    `  ${location}: ${location}Texts`
  ).join(',\n');

  const content = `// Generated location texts main index
${imports}

export const locationTexts = {
${exports}
} as const;

export default locationTexts;
`;

  fs.writeFileSync(path.join(generatePath, 'texts/locations/index.ts'), content);
}

function generateGlobalTexts(projectPath: string, generatePath: string): string[] {
  const globalTextsPath = path.join(projectPath, 'texts/global');
  
  if (!fs.existsSync(globalTextsPath)) {
    // Create empty global texts
    const content = `// Generated global texts (empty)
export const globalTexts = {} as const;

export default globalTexts;
`;
    fs.writeFileSync(path.join(generatePath, 'texts/global/index.ts'), content);
    return [];
  }

  // TODO: Implement global texts generation similar to locations
  return [];
}

function generateMainTextIndex(generatePath: string) {
  const content = `// Generated text system v2 main index
import { globalTexts } from './global';
import { locationTexts } from './locations';

// Direct import text access - returns Text objects for type safety
export const texts = {
  global: globalTexts,
  locations: locationTexts
} as const;

export default texts;
`;

  fs.writeFileSync(path.join(generatePath, 'texts/index.ts'), content);
}