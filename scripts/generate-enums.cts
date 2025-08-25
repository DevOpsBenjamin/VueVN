#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const projectName = process.env.VUEVN_PROJECT;

if (!projectName) {
  console.error('❌ Error: VUEVN_PROJECT environment variable is required');
  process.exit(1);
}

const projectPath = path.join(__dirname, '..', 'projects', projectName);
const engineEnumsPath = path.join(__dirname, '..', 'engine_src', 'enums');
const projectEnumsPath = path.join(projectPath, 'plugins', 'enums');
const generatePath = path.join(__dirname, '..', 'generate');

console.log(`🏗️  Generating enums for project: ${projectName}`);

// Function to recursively get all .vue files in a directory
function getAllEnumFiles(dir: string, basePath: string = ''): string[] {
  if (!fs.existsSync(dir)) return [];
  
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = basePath ? path.join(basePath, entry.name) : entry.name;
    
    if (entry.isDirectory()) {
      files.push(...getAllEnumFiles(fullPath, relativePath));
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.ts')) {
        const nameWithoutExt = relativePath.replace(/\.ts$/, '');
        files.push(nameWithoutExt);
      } else {
        console.warn(`⚠️  Warning: Non-TypeScript file found in enums: ${relativePath} - skipping`);
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

  // Get all engine enums
  const engineEnums = getAllEnumFiles(engineEnumsPath);
  console.log(`🔧 Found ${engineEnums.length} engine enums: ${engineEnums.join(', ')}`);

  // Get all project enums
  const projectEnums = getAllEnumFiles(projectEnumsPath);
  if (projectEnums.length > 0) {
    console.log(`🎯 Found ${projectEnums.length} project enums: ${projectEnums.join(', ')}`);
  } else {
    console.log('📝 No project enums found - using engine enums only');
  }

  // Create differential enumFile map (project enums override engine enums)
  const allEnums = new Set([...engineEnums, ...projectEnums]);
  const enumFileSourceMap = new Map<string, 'engine' | 'project'>();
  
  // First add engine enums
  for (const enumFile of engineEnums) {
    enumFileSourceMap.set(enumFile, 'engine');
  }
  
  // Then project enums (overriding engine ones if they exist)
  for (const enumFile of projectEnums) {
    if (enumFileSourceMap.has(enumFile)) {
      console.log(`🔄 Project overrides engine enumFile: ${enumFile}`);
    } else {
      console.log(`➕ Project adds new enumFile: ${enumFile}`);
    }
    enumFileSourceMap.set(enumFile, 'project');
  }

  // Generate imports and exports
  const imports = Array.from(allEnums)
    .sort()
    .map(enumFileName => {
      const source = enumFileSourceMap.get(enumFileName);
      const importPath = source === 'project' 
        ? `@projects/${projectName}/plugins/enums/${enumFileName}`
        : `@engine/enums/${enumFileName}`;
      
      const enumFileBaseName = path.basename(enumFileName);
      return `import ${enumFileBaseName} from '${importPath}';`;
    })
    .join('\n');

  const exports = Array.from(allEnums)
    .sort()
    .map(enumFileName => {
      const enumFileBaseName = path.basename(enumFileName);
      return `  ${enumFileBaseName}`;
    })
    .join(',\n');

  const enumsFileContent = `// Generated enums index - differential enumFile system
// Engine enums with project overrides and additions

${imports}

export {
${exports}
};
`;

  const enumsFilePath = path.join(generatePath, 'enums.ts');
  fs.writeFileSync(enumsFilePath, enumsFileContent);
  console.log('📄 Created generate/enums.ts');

  console.log('✅ Enum generation complete');

} catch (error: any) {
  console.error('❌ Enum generation failed:', error.message);
  process.exit(1);
}
}

main();