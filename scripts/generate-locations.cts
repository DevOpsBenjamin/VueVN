#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const projectName = process.env.VUEVN_PROJECT;

if (!projectName) {
  console.error('❌ Error: VUEVN_PROJECT environment variable is required');
  process.exit(1);
}

const projectPath = path.join(__dirname, '..', 'projects', projectName);
const locationsPath = path.join(projectPath, 'locations');
const generatePath = path.join(__dirname, '..', 'generate');
const generateLocationsPath = path.join(generatePath, 'locations');

// Generic function to generate resource files (actions, events, etc.)
async function generateResourceFile(
  projectPath: string, 
  locationName: string, 
  locationGeneratePath: string,
  resourceType: string,
  emoji: string,
  typeName: string
) {
  const resourcePath = path.join(projectPath, 'locations', locationName, resourceType);
  
  let resourceFiles: string[] = [];
  let imports = '';
  let resourceListItems = '';

  // Check if resource folder exists and get resource files
  if (fs.existsSync(resourcePath)) {
    const allFiles = fs.readdirSync(resourcePath);
    
    // Warn about non-TypeScript files
    const nonTsFiles = allFiles.filter(file => !file.endsWith('.ts'));
    nonTsFiles.forEach(file => {
      console.warn(`⚠️  Warning: Non-TypeScript file found in ${locationName}/${resourceType}: ${file} - skipping`);
    });
    
    resourceFiles = allFiles
      .filter(file => file.endsWith('.ts'))
      .map(file => path.basename(file, '.ts'));

    if (resourceFiles.length > 0) {
      // Check for invalid filenames with dashes
      const invalidFiles = resourceFiles.filter(name => name.includes('-'));
      if (invalidFiles.length > 0) {
        console.error(`❌ Error: Invalid filenames with dashes found in ${locationName}/${resourceType}:`);
        invalidFiles.forEach(file => console.error(`  - ${file}.ts`));
        console.error('Please rename files to use underscores instead of dashes for valid TypeScript identifiers.');
        process.exit(1);
      }

      console.log(`${emoji} Found ${resourceFiles.length} ${resourceType} in ${locationName}: ${resourceFiles.join(', ')}`);
      
      // Generate imports with @projects alias
      imports = resourceFiles
        .map(resourceName => `import ${resourceName} from '@projects/${projectName}/locations/${locationName}/${resourceType}/${resourceName}';`)
        .join('\n');

      // Generate resourceList object
      resourceListItems = resourceFiles
        .map(resourceName => `  "${resourceName}": ${resourceName}`)
        .join(',\n');
    } else {
      console.log(`📝 No ${resourceType} files found in ${locationName}/${resourceType} - creating empty ${resourceType}`);
    }
  } else {
    console.log(`📝 No ${resourceType} folder found for ${locationName} - creating empty ${resourceType}`);
  }

  const resourceFileContent = `// Generated ${resourceType} for location: ${locationName}
import type { ${typeName} } from '@generate/types';
${imports ? '\n' + imports + '\n' : ''}
export const ${resourceType}List: Record<string, ${typeName}> = {${resourceListItems ? '\n' + resourceListItems + '\n' : ''}};

export default ${resourceType}List;
`;

  const resourceFilePath = path.join(locationGeneratePath, `${resourceType}.ts`);
  fs.writeFileSync(resourceFilePath, resourceFileContent);
}

// Function to generate actions.ts file for a location
async function generateActionsFile(projectPath: string, locationName: string, locationGeneratePath: string) {
  return generateResourceFile(projectPath, locationName, locationGeneratePath, 'actions', '🎯', 'Action');
}

// Function to generate events.ts file for a location
async function generateEventsFile(projectPath: string, locationName: string, locationGeneratePath: string) {
  return generateResourceFile(projectPath, locationName, locationGeneratePath, 'events', '🎭', 'VNEvent');
}

// Function to generate index.ts file for a location
async function generateLocationIndex(projectPath: string, locationName: string, locationGeneratePath: string) {
  const infoPath = path.join(projectPath, 'locations', locationName, 'info.ts');
  
  // Check if info.ts exists
  if (!fs.existsSync(infoPath)) {
    console.error(`❌ Error: Missing info.ts file for location: ${locationName}`);
    console.error(`Expected path: ${infoPath}`);
    console.error('Each location must have an info.ts file defining its metadata.');
    process.exit(1);
  }

  const locationIndexContent = `// Generated index for location: ${locationName}
import type { LocationData } from '@engine/types/engine/LocationData';
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

// Function to generate main locations index.ts
async function generateMainLocationsIndex(generateLocationsPath: string, locationFolders: string[]) {
  // Generate imports
  const imports = locationFolders
    .map(locationName => `import ${locationName} from './${locationName}';`)
    .join('\n');

  // Generate locations record
  const locationsItems = locationFolders
    .map(locationName => `  "${locationName}": ${locationName}`)
    .join(',\n');

  const mainIndexContent = `// Generated locations index
import type { LocationData } from '@engine/types/engine/LocationData';

${imports}

export const locations: Record<string, LocationData> = {
${locationsItems}
};

export default locations;
`;

  const mainIndexPath = path.join(generateLocationsPath, 'index.ts');
  fs.writeFileSync(mainIndexPath, mainIndexContent);
  console.log('📄 Created generate/locations/index.ts');
}

console.log(`🏗️  Generating locations for project: ${projectName}`);

async function main() {
try {
  // Create src/generate directory if it doesn't exist
  if (!fs.existsSync(generatePath)) {
    fs.mkdirSync(generatePath, { recursive: true });
    console.log('📁 Created generate directory');
  }

  // Create src/generate/locations directory if it doesn't exist
  if (!fs.existsSync(generateLocationsPath)) {
    fs.mkdirSync(generateLocationsPath, { recursive: true });
    console.log('📁 Created generate/locations directory');
  }

  // Will create main index.ts after processing all locations

  // Check if project locations folder exists
  if (!fs.existsSync(locationsPath)) {
    console.log('⚠️  No locations folder found in project, skipping location processing');
    process.exit(0);
  }

  // Get all location folders
  const locationFolders = fs.readdirSync(locationsPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`📍 Found ${locationFolders.length} locations: ${locationFolders.join(', ')}`);

  // Create folder and index.ts for each location
  for (const locationName of locationFolders) {
    const locationGeneratePath = path.join(generateLocationsPath, locationName);
    
    // Create location folder in generate/locations
    if (!fs.existsSync(locationGeneratePath)) {
      fs.mkdirSync(locationGeneratePath, { recursive: true });
      console.log(`📁 Created src/generate/locations/${locationName}`);
    }

    // Generate actions.ts for the location
    await generateActionsFile(projectPath, locationName, locationGeneratePath);

    // Generate events.ts for the location
    await generateEventsFile(projectPath, locationName, locationGeneratePath);

    // Generate index.ts for the location (after actions/events are created)
    await generateLocationIndex(projectPath, locationName, locationGeneratePath);
  }

  // Generate main locations index after all locations are processed
  await generateMainLocationsIndex(generateLocationsPath, locationFolders);

  console.log('✅ Location generation complete');

} catch (error: any) {
  console.error('❌ Location generation failed:', error.message);
  process.exit(1);
}
}

main();