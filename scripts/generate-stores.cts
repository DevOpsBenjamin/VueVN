#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const projectName = process.env.VUEVN_PROJECT;

if (!projectName) {
  console.error('❌ Error: VUEVN_PROJECT environment variable is required');
  process.exit(1);
}

const projectPath = path.join(__dirname, '..', 'projects', projectName);
const engineStoresPath = path.join(__dirname, '..', 'engine_src', 'stores');
const projectStoresPath = path.join(projectPath, 'plugins', 'stores');
const generatePath = path.join(__dirname, '..', 'generate');

console.log(`🏗️  Generating stores for project: ${projectName}`);

// Function to recursively get all .vue files in a directory
function getAllStoreFiles(dir: string, basePath: string = ''): string[] {
  if (!fs.existsSync(dir)) return [];
  
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = basePath ? path.join(basePath, entry.name) : entry.name;
    
    if (entry.isDirectory()) {
      files.push(...getAllStoreFiles(fullPath, relativePath));
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.ts')) {
        const nameWithoutExt = relativePath.replace(/\.ts$/, '');
        files.push(nameWithoutExt);
      } else {
        console.warn(`⚠️  Warning: Non-TypeScript file found in stores: ${relativePath} - skipping`);
      }
    }
  }
  
  return files;
}

async function main() {
try {
  // Create engine_src/generate directory if it doesn't exist
  if (!fs.existsSync(generatePath)) {
    fs.mkdirSync(generatePath, { recursive: true });
    console.log('📁 Created generate directory');
  }

  // Get all engine stores
  const engineStores = getAllStoreFiles(engineStoresPath);
  console.log(`🔧 Found ${engineStores.length} engine stores: ${engineStores.join(', ')}`);

  // Get all project stores
  const projectStores = getAllStoreFiles(projectStoresPath);
  if (projectStores.length > 0) {
    console.log(`🎯 Found ${projectStores.length} project stores: ${projectStores.join(', ')}`);
  } else {
    console.log('📝 No project stores found - using engine stores only');
  }

  // Create differential store map (project stores override engine stores)
  const allStores = new Set([...engineStores, ...projectStores]);
  const storeSourceMap = new Map<string, 'engine' | 'project'>();
  
  // First add engine stores
  for (const store of engineStores) {
    storeSourceMap.set(store, 'engine');
  }
  
  // Then project stores (overriding engine ones if they exist)
  for (const store of projectStores) {
    if (storeSourceMap.has(store)) {
      console.log(`🔄 Project overrides engine store: ${store}`);
    } else {
      console.log(`➕ Project adds new store: ${store}`);
    }
    storeSourceMap.set(store, 'project');
  }

  // Generate imports and exports
  const imports = Array.from(allStores)
    .sort()
    .map(storeName => {
      const source = storeSourceMap.get(storeName);
      const importPath = source === 'project' 
        ? `@projects/${projectName}/plugins/stores/${storeName}`
        : `@engine/stores/${storeName}`;
      
      const storeBaseName = path.basename(storeName);
      return `import ${storeBaseName} from '${importPath}';`;
    })
    .join('\n');

  const exports = Array.from(allStores)
    .sort()
    .map(storeName => {
      const storeBaseName = path.basename(storeName);
      return `  ${storeBaseName}`;
    })
    .join(',\n');

  const storesFileContent = `// Generated stores index - differential store system
// Engine stores with project overrides and additions

${imports}

export {
${exports}
};
`;

  const storesFilePath = path.join(generatePath, 'stores.ts');
  fs.writeFileSync(storesFilePath, storesFileContent);
  console.log('📄 Created generate/stores.ts');

  console.log('✅ Store generation complete');

} catch (error: any) {
  console.error('❌ Store generation failed:', error.message);
  process.exit(1);
}
}

main();