import fs from 'fs';
import path from 'path';

// Generic function to generate resource files (actions, events, etc.) for locations or global
export async function generateResourceFile(
  projectName: string,
  projectPath: string, 
  locationName: string, 
  locationGeneratePath: string,
  resourceType: string,
  emoji: string,
  typeName: string,
  isGlobal: boolean = false
) {
  const resourcePath = path.join(projectPath, isGlobal ? 'global' : 'locations', isGlobal ? resourceType : `${locationName}/${resourceType}`);
  
  let resourceFiles: string[] = [];
  let imports = '';
  let resourceListItems = '';

  // Check if resource folder exists and get resource files
  if (fs.existsSync(resourcePath)) {
    const allFiles = fs.readdirSync(resourcePath);
    
    // Warn about non-TypeScript files
    const nonTsFiles = allFiles.filter(file => !file.endsWith('.ts'));
    nonTsFiles.forEach(file => {
      const locationPath = isGlobal ? 'global' : locationName;
      console.warn(`⚠️  Warning: Non-TypeScript file found in ${locationPath}/${resourceType}: ${file} - skipping`);
    });
    
    resourceFiles = allFiles
      .filter(file => file.endsWith('.ts'))
      .map(file => path.basename(file, '.ts'));

    if (resourceFiles.length > 0) {
      // Check for invalid filenames with dashes
      const invalidFiles = resourceFiles.filter(name => name.includes('-'));
      if (invalidFiles.length > 0) {
        const locationPath = isGlobal ? 'global' : locationName;
        console.error(`❌ Error: Invalid filenames with dashes found in ${locationPath}/${resourceType}:`);
        invalidFiles.forEach(file => console.error(`  - ${file}.ts`));
        console.error('Please rename files to use underscores instead of dashes for valid TypeScript identifiers.');
        process.exit(1);
      }

      const locationPath = isGlobal ? 'global' : locationName;
      console.log(`${emoji} Found ${resourceFiles.length} ${resourceType} in ${locationPath}: ${resourceFiles.join(', ')}`);
      
      // Generate imports with @projects alias
      const importPath = isGlobal 
        ? `@projects/${projectName}/global/${resourceType}`
        : `@projects/${projectName}/locations/${locationName}/${resourceType}`;
      
      imports = resourceFiles
        .map(resourceName => `import ${resourceName} from '${importPath}/${resourceName}';`)
        .join('\n');

      // Generate resourceList object
      resourceListItems = resourceFiles
        .map(resourceName => `  "${resourceName}": ${resourceName}`)
        .join(',\n');
    } else {
      const locationPath = isGlobal ? 'global' : locationName;
      console.log(`📝 No ${resourceType} files found in ${locationPath}/${resourceType} - creating empty ${resourceType}`);
    }
  } else {
    const locationPath = isGlobal ? 'global' : locationName;
    console.log(`📝 No ${resourceType} folder found for ${locationPath} - creating empty ${resourceType}`);
  }

  const locationDisplayName = isGlobal ? 'global location' : `location: ${locationName}`;
  const resourceFileContent = `// Generated ${resourceType} for ${locationDisplayName}
import type { ${typeName} } from '@generate/types';
${imports ? '\n' + imports + '\n' : ''}
export const ${resourceType}List: Record<string, ${typeName}> = {${resourceListItems ? '\n' + resourceListItems + '\n' : ''}};

export default ${resourceType}List;
`;

  const resourceFilePath = path.join(locationGeneratePath, `${resourceType}.ts`);
  fs.writeFileSync(resourceFilePath, resourceFileContent);
}

// Function to generate actions.ts file for a location or global
export async function generateActionsFile(projectName: string, projectPath: string, locationName: string, locationGeneratePath: string, isGlobal: boolean = false) {
  return generateResourceFile(projectName, projectPath, locationName, locationGeneratePath, 'actions', '🎯', 'Action', isGlobal);
}

// Function to generate events.ts file for a location or global
export async function generateEventsFile(projectName: string, projectPath: string, locationName: string, locationGeneratePath: string, isGlobal: boolean = false) {
  return generateResourceFile(projectName, projectPath, locationName, locationGeneratePath, 'events', '🎭', 'VNEvent', isGlobal);
}

// Function to generate index.ts file for a location
export async function generateLocationIndex(projectName: string, projectPath: string, locationName: string, locationGeneratePath: string) {
  const infoPath = path.join(projectPath, 'locations', locationName, 'info.ts');
  
  // Check if info.ts exists
  if (!fs.existsSync(infoPath)) {
    console.error(`❌ Error: Missing info.ts file for location: ${locationName}`);
    console.error(`Expected path: ${infoPath}`);
    console.error('Each location must have an info.ts file defining its metadata.');
    process.exit(1);
  }

  const locationIndexContent = `// Generated index for location: ${locationName}
import type { LocationData } from '@generate/types';
import info from '@projects/${projectName}/locations/${locationName}/info';
import { actionsList } from './actions';
import { eventsList } from './events';

const ${locationName}: LocationData = {
  id: "${locationName}",
  info,
  actions: actionsList,
  events: eventsList
};

export default ${locationName};
`;

  const locationIndexPath = path.join(locationGeneratePath, 'index.ts');
  fs.writeFileSync(locationIndexPath, locationIndexContent);
}

// Function to generate index.ts file for global
export async function generateGlobalIndex(projectName: string, projectPath: string, locationGeneratePath: string) {
  const globalIndexContent = `// Generated index for global location
import type { LocationData } from '@generate/types';
import { actionsList } from './actions';
import { eventsList } from './events';

const global: LocationData = {
  id: "global",
  info: {
    name: "Global",
    description: "Global events and actions available everywhere"
  },
  actions: actionsList,
  events: eventsList
};

export default global;
`;

  const globalIndexPath = path.join(locationGeneratePath, 'index.ts');
  fs.writeFileSync(globalIndexPath, globalIndexContent);
}