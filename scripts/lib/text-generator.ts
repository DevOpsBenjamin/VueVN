import fs from 'fs';
import path from 'path';
import projectsvars from './project-vars';
import { pathToFileURL } from 'url';

interface TextEntry {
  key: string;
  translations: Record<string, string | null>;
}

interface TextScope {
  path: string;
  entries: TextEntry[];
}

export async function generateTextSystem(projectName?: string) {
  if (!projectName) {
    projectName = process.env.VUEVN_PROJECT;
    if (!projectName) {
      throw new Error('No project name provided and VUEVN_PROJECT not set');
    }
  }

  const projectPath = projectsvars.projectPath;
  const generatePath = projectsvars.generatePath;
  
  // Get configured languages (only look for these)
  const languages = await getConfiguredLanguages(projectPath);
  if (languages.length === 0) {
    throw new Error('No languages configured in project config.ts');
  }

  console.log(`📝 Generating texts for languages: ${languages.join(', ')}`);

  // Create output directories
  fs.mkdirSync(path.join(generatePath, 'texts'), { recursive: true });

  // Process all text scopes
  const globalScopes = await processGlobalTexts(projectPath, languages);
  const locationScopes = await processLocationTexts(projectPath, languages);

  // Generate all output files
  generateTextFiles(generatePath, globalScopes, locationScopes, languages);
  
  console.log('✅ Text generation complete');
}

async function getConfiguredLanguages(projectPath: string): Promise<string[]> {
  try {
    const configUrl = pathToFileURL(path.join(projectPath, 'config.ts')).href;
    const mod = await import(configUrl);
    const config = typeof mod.default === 'function' ? mod.default() : mod.default;
    
    const languages = (config.languages || []).map((l: any) => l.code?.toLowerCase()).filter((lang: string) => Boolean(lang));
    
    // Put default language first
    const defaultIdx = (config.languages || []).findIndex((l: any) => l.default);
    if (defaultIdx > -1) {
      const defaultLang = languages[defaultIdx];
      return [defaultLang, ...languages.filter(lang => lang !== defaultLang)];
    }
    
    return languages;
  } catch (error) {
    throw new Error(`Failed to load project config: ${error}`);
  }
}

async function processGlobalTexts(projectPath: string, languages: string[]): Promise<TextScope[]> {
  const globalTextsPath = path.join(projectPath, 'global', 'texts');
  if (!fs.existsSync(globalTextsPath)) {
    return [];
  }

  const scopes: TextScope[] = [];
  const scopeDirs = fs.readdirSync(globalTextsPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const scopeName of scopeDirs) {
    const scopePath = path.join(globalTextsPath, scopeName);
    const scope = await processTextScope(scopePath, `global/${scopeName}`, languages);
    if (scope.entries.length > 0) {
      scopes.push(scope);
    }
  }

  return scopes;
}

async function processLocationTexts(projectPath: string, languages: string[]): Promise<TextScope[]> {
  const locationsPath = path.join(projectPath, 'locations');
  if (!fs.existsSync(locationsPath)) {
    return [];
  }

  const scopes: TextScope[] = [];
  
  // Find all locations
  const locations = fs.readdirSync(locationsPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const location of locations) {
    const locationTextsPath = path.join(locationsPath, location, 'texts');
    if (!fs.existsSync(locationTextsPath)) {
      continue;
    }

    // Recursively find all text scopes in this location
    const locationScopes = await findTextScopes(locationTextsPath, `locations/${location}`, languages);
    scopes.push(...locationScopes);
  }

  return scopes;
}

async function findTextScopes(basePath: string, pathPrefix: string, languages: string[]): Promise<TextScope[]> {
  const scopes: TextScope[] = [];
  
  // Check if current directory has text files
  const hasTextFiles = languages.some(lang => 
    fs.existsSync(path.join(basePath, `${lang}.ts`))
  );

  if (hasTextFiles) {
    const scope = await processTextScope(basePath, pathPrefix, languages);
    if (scope.entries.length > 0) {
      scopes.push(scope);
    }
  }

  // Recursively check subdirectories
  const subdirs = fs.readdirSync(basePath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const subdir of subdirs) {
    const subdirPath = path.join(basePath, subdir);
    const subdirScopes = await findTextScopes(subdirPath, `${pathPrefix}/${subdir}`, languages);
    scopes.push(...subdirScopes);
  }

  return scopes;
}

async function processTextScope(scopePath: string, scopeId: string, languages: string[]): Promise<TextScope> {
  const entries: TextEntry[] = [];
  const allKeys = new Set<string>();

  // Load all configured language files
  const langData: Record<string, Record<string, string>> = {};
  
  for (const lang of languages) {
    const filePath = path.join(scopePath, `${lang}.ts`);
    if (fs.existsSync(filePath)) {
      try {
        langData[lang] = await extractTextsFromFile(filePath);
        Object.keys(langData[lang]).forEach(key => allKeys.add(key));
      } catch (error) {
        throw new Error(`Error processing ${filePath}: ${error}`);
      }
    }
  }

  // Create entries with all translations
  for (const key of Array.from(allKeys).sort()) {
    const translations: Record<string, string | null> = {};
    
    for (const lang of languages) {
      translations[lang] = langData[lang]?.[key] || null;
    }

    entries.push({ key, translations });
  }

  return { path: scopeId, entries };
}

async function extractTextsFromFile(filePath: string): Promise<Record<string, string>> {
  const ts = await import('typescript');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const texts: Record<string, string> = {};
  let found = false;

  function visit(node: any) {
    if (node.kind === ts.SyntaxKind.ExportAssignment) {
      let objExpr = node.expression;
      
      // Require 'as const'
      if (objExpr?.kind === ts.SyntaxKind.AsExpression) {
        if (objExpr.type?.typeName?.text === 'const') {
          objExpr = objExpr.expression;
        } else {
          throw new Error(`File must use 'as const', found different assertion in ${filePath}`);
        }
      } else {
        throw new Error(`File must use 'export default { ... } as const' pattern in ${filePath}`);
      }
      
      if (objExpr?.kind === ts.SyntaxKind.ObjectLiteralExpression) {
        found = true;
        for (const prop of objExpr.properties) {
          if (prop.kind === ts.SyntaxKind.PropertyAssignment && 
              prop.name?.kind === ts.SyntaxKind.Identifier) {
            const key = prop.name.text;
            const value = extractStringValue(prop.initializer, ts);
            if (value !== null) {
              texts[key] = value;
            } else {
              throw new Error(`Property '${key}' must be a string literal in ${filePath}`);
            }
          }
        }
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  
  if (!found) {
    throw new Error(`No valid export default object found in ${filePath}`);
  }
  
  return texts;
}

function extractStringValue(node: any, ts: any): string | null {
  if (node.kind === ts.SyntaxKind.StringLiteral) {
    return node.text;
  }
  if (node.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
    return node.text;
  }
  if (node.kind === ts.SyntaxKind.TemplateExpression) {
    // Reconstruct template literal
    let result = node.head.text;
    for (const span of node.templateSpans) {
      if (span.expression.kind === ts.SyntaxKind.StringLiteral) {
        result += span.expression.text;
      } else {
        return null; // Has variables, can't evaluate
      }
      result += span.literal.text;
    }
    return result;
  }
  return null;
}

function generateTextFiles(generatePath: string, globalScopes: TextScope[], locationScopes: TextScope[], languages: string[]) {
  // Generate individual scope files
  for (const scope of [...globalScopes, ...locationScopes]) {
    generateScopeFile(generatePath, scope, languages);
  }

  // Generate hierarchical indexes
  generateGlobalIndex(generatePath, globalScopes);
  generateLocationIndexes(generatePath, locationScopes);
  generateMainIndex(generatePath);
}

function generateScopeFile(generatePath: string, scope: TextScope, languages: string[]) {
  const textObjects: string[] = [];
  
  for (const entry of scope.entries) {
    const lines = [`    __key: ${JSON.stringify(entry.key)}`];
    
    for (const lang of languages) {
      const value = entry.translations[lang];
      lines.push(`    ${lang}: ${value !== null ? JSON.stringify(value) : 'null'}`);
    }
    
    textObjects.push(`  ${entry.key}: {\n${lines.join(',\n')}\n  }`);
  }

  const content = `// Generated texts for ${scope.path}
export const texts = {
${textObjects.join(',\n')}
} as const;

export default texts;
`;

  // Use hierarchical path structure instead of flat
  const outputPath = path.join(generatePath, 'texts', scope.path, 'index.ts');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content);
}

function generateGlobalIndex(generatePath: string, globalScopes: TextScope[]) {
  const imports: string[] = [];
  const exports: string[] = [];

  for (const scope of globalScopes) {
    const scopeName = scope.path.replace('global/', '');
    const importName = `${scopeName}Texts`;
    imports.push(`import ${importName} from './${scopeName}';`);
    exports.push(`  ${scopeName}: ${importName}`);
  }

  const content = `// Generated global texts index
${imports.join('\n')}

export const globalTexts = {
${exports.join(',\n')}
} as const;

export default globalTexts;
`;

  const globalDir = path.join(generatePath, 'texts/global');
  fs.mkdirSync(globalDir, { recursive: true });
  fs.writeFileSync(path.join(globalDir, 'index.ts'), content);
}

function generateLocationIndexes(generatePath: string, locationScopes: TextScope[]) {
  // Group by location
  const locationGroups: Record<string, TextScope[]> = {};
  for (const scope of locationScopes) {
    const [, location] = scope.path.split('/');
    if (!locationGroups[location]) locationGroups[location] = [];
    locationGroups[location].push(scope);
  }

  // Generate index for each location
  for (const [location, scopes] of Object.entries(locationGroups)) {
    const imports: string[] = [];
    const exports: string[] = [];

    for (const scope of scopes) {
      const [, , ...rest] = scope.path.split('/');
      const scopePath = rest.join('/');
      const scopeName = rest.join('_') || 'root';
      const importName = `${scopeName}Texts`;
      
      imports.push(`import ${importName} from './${scopePath}';`);
      exports.push(`  ${scopeName}: ${importName}`);
    }

    const content = `// Generated location texts index for ${location}
${imports.join('\n')}

export const ${location}Texts = {
${exports.join(',\n')}
} as const;

export default ${location}Texts;
`;

    const locationDir = path.join(generatePath, 'texts/locations', location);
    fs.mkdirSync(locationDir, { recursive: true });
    fs.writeFileSync(path.join(locationDir, 'index.ts'), content);
  }

  // Generate main locations index
  const locationNames = Object.keys(locationGroups);
  const locationImports = locationNames.map(loc => `import { ${loc}Texts } from './${loc}';`);
  const locationExports = locationNames.map(loc => `  ${loc}: ${loc}Texts`);

  const locationsContent = `// Generated locations main index
${locationImports.join('\n')}

export const locationTexts = {
${locationExports.join(',\n')}
} as const;

export default locationTexts;
`;

  const locationsDir = path.join(generatePath, 'texts/locations');
  fs.mkdirSync(locationsDir, { recursive: true });
  fs.writeFileSync(path.join(locationsDir, 'index.ts'), locationsContent);
}

function generateMainIndex(generatePath: string) {
  const content = `// Generated text system main index
import { globalTexts } from './global';
import { locationTexts } from './locations';

export const texts = {
  global: globalTexts,
  locations: locationTexts
} as const;

export default texts;
`;

  fs.writeFileSync(path.join(generatePath, 'texts/index.ts'), content);
}