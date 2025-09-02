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

export async function generateTextSystem(projectName?: string) {
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

  const locationTexts = await generateLocationTexts(projectPath, generatePath);
  const globalTexts = await generateGlobalTexts(projectPath, generatePath);
  
  generateMainTextIndex(generatePath);
}

async function generateLocationTexts(projectPath: string, generatePath: string): Promise<string[]> {
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

    // Recursively find all scope directories containing any *.ts language file
    const scopeDirs: string[] = [];
    const walk = (dir: string, rel: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      let hasLang = false;
      for (const e of entries) {
        if (e.isFile() && e.name.endsWith('.ts')) hasLang = true;
      }
      if (hasLang) scopeDirs.push(rel);
      for (const e of entries) {
        if (e.isDirectory()) walk(path.join(dir, e.name), path.join(rel, e.name));
      }
    };
    walk(locationTextsPath, '');

    const scopesForIndex: Array<{ alias: string; importPath: string }> = [];
    for (const rel of scopeDirs) {
      const abs = rel ? path.join(locationTextsPath, rel) : locationTextsPath;
      // Use a sanitized module name for index exports
      const scopeName = (rel || 'root').replace(/[^a-zA-Z0-9_]/g, '_') || 'root';
      await generateScopeTexts(abs, scopeName, generatePath, locationName, rel || '');
      const importPath = rel && rel.length > 0 ? `./${rel.replace(/\\/g, '/')}` : './root';
      scopesForIndex.push({ alias: scopeName, importPath });
    }

    // Generate location texts index (flat index of all scopes)
    generateLocationTextIndex(generatePath, locationName, scopesForIndex);
  }

  // Generate main locations index
  generateLocationMainIndex(generatePath, locations);
  
  return locations;
}

async function generateActionTexts(actionTextsPath: string, actionName: string, generatePath: string, locationName: string): Promise<string[]> {
  const textKeys: string[] = [];

  if (!fs.existsSync(actionTextsPath)) {
    return textKeys;
  }

  // Discover all language files (e.g., en.ts, fr.ts, de.ts...)
  const langFiles = fs
    .readdirSync(actionTextsPath)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => ({ file: f, lang: path.basename(f, '.ts') }));

  if (langFiles.length === 0) {
    return textKeys;
  }

  // Parse each language file
  const langMaps: Record<string, Record<string, string>> = {};
  for (const { file, lang } of langFiles) {
    const filePath = path.join(actionTextsPath, file);
    langMaps[lang] = await extractExportedTexts(filePath);
  }

  // Union of all keys across languages
  const allKeys = new Set<string>();
  Object.values(langMaps).forEach((m) => Object.keys(m).forEach((k) => allKeys.add(k)));

  // Order languages: en first if present, then others alphabetically
  const langs = Object.keys(langMaps).sort((a, b) => a.localeCompare(b));

  const textObjects: string[] = [];
  for (const key of Array.from(allKeys).sort()) {
    const lines: string[] = [];
    lines.push(`    __key: ${JSON.stringify(key)}`);
    for (const lang of langs) {
      const val = langMaps[lang][key];
      lines.push(`    ${lang}: ${val != null ? JSON.stringify(val) : 'null'}`);
    }
    textObjects.push(`  ${key}: {\n${lines.join(',\n')}\n  }`);
    textKeys.push(key);
  }

  const actionContent = `// Generated text objects for ${locationName}/${actionName}
import type { Text } from '@generate/types';

export const ${actionName}Texts = {
${textObjects.join(',\n')}
} as const;

export default ${actionName}Texts;
`;

  const locationTextPath = path.join(generatePath, 'texts/locations', locationName);
  fs.mkdirSync(locationTextPath, { recursive: true });
  fs.writeFileSync(path.join(locationTextPath, `${actionName}.ts`), actionContent);

  return textKeys;
}

async function extractExportedTexts(filePath: string): Promise<Record<string, string>> {
  const ts = await import('typescript');
  
  // Read and parse the TypeScript file
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Parse TypeScript source
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );
  
  // Find the default export
  const texts: Record<string, string> = {};
  let found = false;
  
  function visit(node: any) {
    // Only handle export default { } as const pattern - require as const
    if (node.kind === ts.SyntaxKind.ExportAssignment) {
      let objExpr = node.expression;
      
      // Require `export default { ... } as const` pattern
      if (objExpr && objExpr.kind === ts.SyntaxKind.AsExpression) {
        // Verify it's actually `as const`
        if (objExpr.type && objExpr.type.kind === ts.SyntaxKind.TypeReference) {
          const typeName = objExpr.type.typeName;
          if (typeName && typeName.kind === ts.SyntaxKind.Identifier && typeName.text === 'const') {
            objExpr = objExpr.expression;
          } else {
            throw new Error(`File ${filePath} must use 'as const' assertion, found different type assertion`);
          }
        }
      } else {
        // No as const found
        throw new Error(`File ${filePath} must use 'export default { ... } as const' pattern. Found export without 'as const' assertion.`);
      }
      
      if (objExpr && objExpr.kind === ts.SyntaxKind.ObjectLiteralExpression) {
        found = true;
        // Extract properties from the object literal
        for (const prop of objExpr.properties) {
          if (prop.kind === ts.SyntaxKind.PropertyAssignment && prop.name && prop.name.kind === ts.SyntaxKind.Identifier) {
            const key = prop.name.text;
            const value = extractStringValue(prop.initializer, ts);
            if (value !== null) {
              texts[key] = value;
            } else {
              throw new Error(`Property '${key}' in ${filePath} must be a string literal or template literal`);
            }
          }
        }
      }
    }
    // Also handle variable declarations followed by export default
    else if (node.kind === ts.SyntaxKind.VariableStatement) {
      // Check if this is followed by export default
      for (const decl of node.declarationList.declarations) {
        if (decl.initializer && decl.initializer.kind === ts.SyntaxKind.ObjectLiteralExpression) {
          // Look for export default that references this variable
          // For now, we'll handle the direct case
        }
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  
  if (!found || Object.keys(texts).length === 0) {
    throw new Error(`No valid default export object found in ${filePath}`);
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
    // Handle template expressions - reconstruct the string
    let result = node.head.text;
    for (const span of node.templateSpans) {
      // For now, we only support simple template literals without variables
      if (span.expression.kind === ts.SyntaxKind.StringLiteral) {
        result += span.expression.text;
      } else {
        // Template has variables - can't statically evaluate
        return null;
      }
      result += span.literal.text;
    }
    return result;
  }
  
  return null;
}

function generateLocationTextIndex(generatePath: string, locationName: string, scopes: Array<{ alias: string; importPath: string }>) {
  const locationDir = path.join(generatePath, 'texts/locations', locationName);
  fs.mkdirSync(locationDir, { recursive: true });

  const imports = scopes.map((s, i) => 
    `import texts_${i} from '${s.importPath}';`
  ).join('\n');

  const exports = scopes.map((s, i) => 
    `  ${s.alias}: texts_${i}`
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

async function generateScopeTexts(scopePath: string, _scopeName: string, generatePath: string, locationName: string, relPath: string): Promise<void> {
  // Discover all language files in scopePath
  const langFiles = fs
    .readdirSync(scopePath)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => ({ file: f, lang: path.basename(f, '.ts') }));
  if (langFiles.length === 0) return;

  const langMaps: Record<string, Record<string, string>> = {};
  for (const { file, lang } of langFiles) {
    const filePath = path.join(scopePath, file);
    langMaps[lang] = await extractExportedTexts(filePath);
  }
  const allKeys = new Set<string>();
  Object.values(langMaps).forEach((m) => Object.keys(m).forEach((k) => allKeys.add(k)));
  const langs = Object.keys(langMaps).sort((a, b) => a.localeCompare(b));

  const textObjects: string[] = [];
  for (const key of Array.from(allKeys).sort()) {
    const lines: string[] = [];
    lines.push(`    __key: ${JSON.stringify(key)}`);
    for (const lang of langs) {
      const val = langMaps[lang][key];
      lines.push(`    ${lang}: ${val != null ? JSON.stringify(val) : 'null'}`);
    }
    textObjects.push(`  ${key}: {\n${lines.join(',\n')}\n  }`);
  }

  const moduleContent = `// Generated text objects for ${locationName}/${relPath}
export const texts = {
  __path: ${JSON.stringify(relPath)},
${textObjects.join(',\n')}
} as const;

export default texts;
`;

  const baseDir = path.join(generatePath, 'texts/locations', locationName);
  if (!relPath) {
    // Root scope: write to root.ts to avoid clashing with location index
    fs.mkdirSync(baseDir, { recursive: true });
    fs.writeFileSync(path.join(baseDir, `root.ts`), moduleContent);
  } else {
    const outDir = path.join(baseDir, relPath);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.ts'), moduleContent);
  }
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

async function generateGlobalTexts(projectPath: string, generatePath: string): Promise<string[]> {
  const globalTextsPath = path.join(projectPath, 'global', 'texts');

  if (!fs.existsSync(globalTextsPath)) {
    const content = `// Generated global texts (empty)
export const globalTexts = {} as const;

export default globalTexts;
`;
    fs.mkdirSync(path.join(generatePath, 'texts/global'), { recursive: true });
    fs.writeFileSync(path.join(generatePath, 'texts/global/index.ts'), content);
    return [];
  }

  const scopes = fs
    .readdirSync(globalTextsPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const imports: string[] = [];
  const exportLines: string[] = [];
  fs.mkdirSync(path.join(generatePath, 'texts/global'), { recursive: true });

  for (const scope of scopes) {
    const scopePath = path.join(globalTextsPath, scope);
    const out = await generateGenericScopeTexts(scopePath, scope, path.join(generatePath, 'texts/global'));
    if (out) {
      imports.push(`import { ${scope}Texts } from './${scope}';`);
      exportLines.push(`  ${scope}: ${scope}Texts`);
    }
  }

  const indexContent = `// Generated global texts index
${imports.join('\n')}

export const globalTexts = {
${exportLines.join(',\n')}
} as const;

export default globalTexts;
`;
  fs.writeFileSync(path.join(generatePath, 'texts/global/index.ts'), indexContent);
  return scopes;
}

async function generateGenericScopeTexts(scopePath: string, scopeName: string, outDir: string): Promise<boolean> {
  if (!fs.existsSync(scopePath)) return false;
  const langFiles = fs
    .readdirSync(scopePath)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => ({ file: f, lang: path.basename(f, '.ts') }));
  if (langFiles.length === 0) return false;

  const langMaps: Record<string, Record<string, string>> = {};
  for (const { file, lang } of langFiles) {
    const filePath = path.join(scopePath, file);
    langMaps[lang] = await extractExportedTexts(filePath);
  }
  const allKeys = new Set<string>();
  Object.values(langMaps).forEach((m) => Object.keys(m).forEach((k) => allKeys.add(k)));
  const langs = Object.keys(langMaps).sort((a, b) => a.localeCompare(b));

  const textObjects: string[] = [];
  for (const key of Array.from(allKeys).sort()) {
    const lines: string[] = [];
    lines.push(`    __key: ${JSON.stringify(key)}`);
    for (const lang of langs) {
      const val = langMaps[lang][key];
      lines.push(`    ${lang}: ${val != null ? JSON.stringify(val) : 'null'}`);
    }
    textObjects.push(`  ${key}: {\n${lines.join(',\n')}\n  }`);
  }

  const content = `// Generated global text objects for ${scopeName}
export const ${scopeName}Texts = {
${textObjects.join(',\n')}
} as const;

export default ${scopeName}Texts;
`;
  fs.writeFileSync(path.join(outDir, `${scopeName}.ts`), content);
  return true;
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
