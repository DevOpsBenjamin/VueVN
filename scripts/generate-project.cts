#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const projectName = process.env.VUEVN_PROJECT;

if (!projectName) {
  console.error('❌ Error: VUEVN_PROJECT environment variable is required');
  process.exit(1);
}

const generatePath = path.join(__dirname, '..', 'generate');
const generateLocationsPath = path.join(generatePath, 'locations');

console.log(`🏗️  Generating project data for project: ${projectName}`);

async function main() {
  try {
    // Create src/generate directory if it doesn't exist
    if (!fs.existsSync(generatePath)) {
      fs.mkdirSync(generatePath, { recursive: true });
      console.log('📁 Created generate directory');
    }

    // Get all location folders
    let locationFolders: string[] = [];
    if (fs.existsSync(generateLocationsPath)) {
      locationFolders = fs.readdirSync(generateLocationsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    }

    // Generate imports for locations
    const locationImports = locationFolders
      .map(locationName => `import ${locationName} from './locations/${locationName}';`)
      .join('\n');

    // Generate global import
    const globalImport = "import global from './global';";

    // Generate locations record
    const locationsItems = locationFolders
      .map(locationName => `  "${locationName}": ${locationName}`)
      .join(',\n');

    const projectContent = `// Generated project data index
import type { LocationData, ProjectData } from '@generate/types';
${locationImports}${globalImport ? '\n' + globalImport : ''}

const locations: Record<string, LocationData> = {
${locationsItems}
};


const projectData: ProjectData = {
  project_id: "${projectName}",
  locations: locations,
  global: global
};

export type { LocationData };
export default projectData;
`;

    const projectFilePath = path.join(generatePath, 'project.ts');
    fs.writeFileSync(projectFilePath, projectContent);
    console.log('📄 Created generate/project.ts');

    console.log('✅ Project generation complete');

  } catch (error: any) {
    console.error('❌ Project generation failed:', error.message);
    process.exit(1);
  }
}

main();