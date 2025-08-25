#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const projectName = process.env.VUEVN_PROJECT;

if (!projectName) {
  console.error('❌ Error: VUEVN_PROJECT environment variable is required');
  process.exit(1);
}

const projectPath = path.join(__dirname, '..', 'projects', projectName);
const engineComponentsPath = path.join(__dirname, '..', 'engine_src', 'components');
const projectComponentsPath = path.join(projectPath, 'plugins', 'components');
const generatePath = path.join(__dirname, '..', 'generate');

console.log(`🏗️  Generating components for project: ${projectName}`);

// Function to recursively get all .vue files in a directory
function getAllComponentFiles(dir: string, basePath: string = ''): string[] {
  if (!fs.existsSync(dir)) return [];
  
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = basePath ? path.join(basePath, entry.name) : entry.name;
    
    if (entry.isDirectory()) {
      files.push(...getAllComponentFiles(fullPath, relativePath));
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.vue')) {
        const nameWithoutExt = relativePath.replace(/\.vue$/, '');
        files.push(nameWithoutExt);
      } else {
        console.warn(`⚠️  Warning: Non-Vue file found in components: ${relativePath} - skipping`);
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

  // Get all engine components
  const engineComponents = getAllComponentFiles(engineComponentsPath);
  console.log(`🔧 Found ${engineComponents.length} engine components: ${engineComponents.join(', ')}`);

  // Get all project components
  const projectComponents = getAllComponentFiles(projectComponentsPath);
  if (projectComponents.length > 0) {
    console.log(`🎯 Found ${projectComponents.length} project components: ${projectComponents.join(', ')}`);
  } else {
    console.log('📝 No project components found - using engine components only');
  }

  // Create differential component map (project components override engine components)
  const allComponents = new Set([...engineComponents, ...projectComponents]);
  const componentSourceMap = new Map<string, 'engine' | 'project'>();
  
  // First add engine components
  for (const component of engineComponents) {
    componentSourceMap.set(component, 'engine');
  }
  
  // Then project components (overriding engine ones if they exist)
  for (const component of projectComponents) {
    if (componentSourceMap.has(component)) {
      console.log(`🔄 Project overrides engine component: ${component}`);
    } else {
      console.log(`➕ Project adds new component: ${component}`);
    }
    componentSourceMap.set(component, 'project');
  }

  // Generate imports and exports
  const imports = Array.from(allComponents)
    .sort()
    .map(componentName => {
      const source = componentSourceMap.get(componentName);
      const importPath = source === 'project' 
        ? `@projects/${projectName}/plugins/components/${componentName}.vue`
        : `@engine/components/${componentName}.vue`;
      
      const componentBaseName = path.basename(componentName);
      return `import ${componentBaseName} from '${importPath}';`;
    })
    .join('\n');

  const exports = Array.from(allComponents)
    .sort()
    .map(componentName => {
      const componentBaseName = path.basename(componentName);
      return `  ${componentBaseName}`;
    })
    .join(',\n');

  const componentsFileContent = `// Generated components index - differential component system
// Engine components with project overrides and additions

${imports}

export {
${exports}
};
`;

  const componentsFilePath = path.join(generatePath, 'components.ts');
  fs.writeFileSync(componentsFilePath, componentsFileContent);
  console.log('📄 Created generate/components.ts');

  console.log('✅ Component generation complete');

} catch (error: any) {
  console.error('❌ Component generation failed:', error.message);
  process.exit(1);
}
}

main();