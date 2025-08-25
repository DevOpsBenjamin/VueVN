#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const projectName = process.env.VUEVN_PROJECT;

if (!projectName) {
  console.error('❌ Error: VUEVN_PROJECT environment variable is required');
  process.exit(1);
}

const projectPath = path.join(__dirname, '..', 'projects', projectName);
const engineTypesPath = path.join(__dirname, '..', 'engine_src', 'types');
const projectTypesPath = path.join(projectPath, 'plugins', 'types');
const generatePath = path.join(__dirname, '..', 'generate');

console.log(`🏗️  Generating types for project: ${projectName}`);

// Function to recursively get all .ts files in a directory
function getAllTypeFiles(dir: string, basePath: string = ''): string[] {
  if (!fs.existsSync(dir)) return [];
  
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = basePath ? path.join(basePath, entry.name) : entry.name;
    
    if (entry.isDirectory()) {
      files.push(...getAllTypeFiles(fullPath, relativePath));
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.ts')) {
        const nameWithoutExt = relativePath.replace(/\.ts$/, '');
        files.push(nameWithoutExt);
      } else {
        console.warn(`⚠️  Warning: Non-TypeScript file found in types: ${relativePath} - skipping`);
      }
    }
  }
  
  return files;
}

async function main() {
try {
  // Create src/generate directory if it doesn't exist
  if (!fs.existsSync(generatePath)) {
    fs.mkdirSync(generatePath, { recursive: true });
    console.log('📁 Created generate directory');
  }


  // Get all engine types
  const engineTypes = getAllTypeFiles(engineTypesPath);
  console.log(`🔧 Found ${engineTypes.length} engine types: ${engineTypes.join(', ')}`);

  // Get all project types
  const projectTypes = getAllTypeFiles(projectTypesPath);
  if (projectTypes.length > 0) {
    console.log(`🎯 Found ${projectTypes.length} project types: ${projectTypes.join(', ')}`);
  } else {
    console.log('📝 No project types found - using engine types only');
  }

  // Create differential type map (project types override engine types)
  const allTypes = new Set([...engineTypes, ...projectTypes]);
  const typeSourceMap = new Map<string, 'engine' | 'project'>();
  
  // First add engine types
  for (const type of engineTypes) {
    typeSourceMap.set(type, 'engine');
  }
  
  // Then project types (overriding engine ones if they exist)
  for (const type of projectTypes) {
    if (typeSourceMap.has(type)) {
      console.log(`🔄 Project overrides engine type: ${type}`);
    } else {
      console.log(`➕ Project adds new type: ${type}`);
    }
    typeSourceMap.set(type, 'project');
  }

  // Generate imports
  const imports = Array.from(allTypes)
    .sort()
    .map(typeName => {
      const source = typeSourceMap.get(typeName);
      const importPath = source === 'project' 
        ? `@projects/${projectName}/plugins/types/${typeName}`
        : `@engine/types/${typeName}`;
      
      return `export type { ${path.basename(typeName)} } from '${importPath}';`;
    })
    .join('\n');

  const typesFileContent = `// Generated types index - differential type system
// Engine types with project overrides and additions

${imports}
`;

  const typesFilePath = path.join(generatePath, 'types.ts');
  fs.writeFileSync(typesFilePath, typesFileContent);
  console.log('📄 Created generate/types.ts');

  console.log('✅ Type generation complete');

} catch (error: any) {
  console.error('❌ Type generation failed:', error.message);
  process.exit(1);
}
}

main();