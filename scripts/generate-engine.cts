#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const projectName = process.env.VUEVN_PROJECT;

if (!projectName) {
  console.error('❌ Error: VUEVN_PROJECT environment variable is required');
  process.exit(1);
}

const projectPath = path.join(__dirname, '..', 'projects', projectName);
const engineEnginePath = path.join(__dirname, '..', 'engine_src', 'engine');
const projectEnginePath = path.join(projectPath, 'plugins', 'engine');
const generatePath = path.join(__dirname, '..', 'generate');

console.log(`🏗️  Generating engine for project: ${projectName}`);

// Function to recursively get all .vue files in a directory
function getAllEngineFiles(dir: string, basePath: string = ''): string[] {
  if (!fs.existsSync(dir)) return [];
  
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = basePath ? path.join(basePath, entry.name) : entry.name;
    
    if (entry.isDirectory()) {
      files.push(...getAllEngineFiles(fullPath, relativePath));
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.ts')) {
        const nameWithoutExt = relativePath.replace(/\.ts$/, '');
        files.push(nameWithoutExt);
      } else {
        console.warn(`⚠️  Warning: Non-TypeScript file found in engine: ${relativePath} - skipping`);
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

  // Get all engine engine
  const engineEngine = getAllEngineFiles(engineEnginePath);
  console.log(`🔧 Found ${engineEngine.length} engine engine: ${engineEngine.join(', ')}`);

  // Get all project engine
  const projectEngine = getAllEngineFiles(projectEnginePath);
  if (projectEngine.length > 0) {
    console.log(`🎯 Found ${projectEngine.length} project engine: ${projectEngine.join(', ')}`);
  } else {
    console.log('📝 No project engine found - using engine engine only');
  }

  // Create differential engine map (project engine override engine engine)
  const allEngine = new Set([...engineEngine, ...projectEngine]);
  const engineSourceMap = new Map<string, 'engine' | 'project'>();
  
  // First add engine engine
  for (const engine of engineEngine) {
    engineSourceMap.set(engine, 'engine');
  }
  
  // Then project engine (overriding engine ones if they exist)
  for (const engine of projectEngine) {
    if (engineSourceMap.has(engine)) {
      console.log(`🔄 Project overrides engine engine: ${engine}`);
    } else {
      console.log(`➕ Project adds new engine: ${engine}`);
    }
    engineSourceMap.set(engine, 'project');
  }

  // Generate imports and exports
  const imports = Array.from(allEngine)
    .sort()
    .map(engineName => {
      const source = engineSourceMap.get(engineName);
      const importPath = source === 'project' 
        ? `@projects/${projectName}/plugins/engine/${engineName}`
        : `@engine/engine/${engineName}`;
      
      const engineBaseName = path.basename(engineName);
      return `import ${engineBaseName} from '${importPath}';`;
    })
    .join('\n');

  const exports = Array.from(allEngine)
    .sort()
    .map(engineName => {
      const engineBaseName = path.basename(engineName);
      return `  ${engineBaseName}`;
    })
    .join(',\n');

  const engineFileContent = `// Generated engine index - differential engine system
// Engine engine with project overrides and additions

${imports}

export {
${exports}
};
`;

  const engineFilePath = path.join(generatePath, 'engine.ts');
  fs.writeFileSync(engineFilePath, engineFileContent);
  console.log('📄 Created generate/engine.ts');

  console.log('✅ Engine generation complete');

} catch (error: any) {
  console.error('❌ Engine generation failed:', error.message);
  process.exit(1);
}
}

main();