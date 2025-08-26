#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import {
  generateActionsFile,
  generateEventsFile,
  generateLocationIndex,
  generateGlobalIndex,
} from './lib/location-generator';

const projectName = process.env.VUEVN_PROJECT;

if (!projectName) {
  console.error('❌ Error: VUEVN_PROJECT environment variable is required');
  process.exit(1);
}

const projectPath = path.join(__dirname, '..', 'projects', projectName);
const locationsPath = path.join(projectPath, 'locations');
const generatePath = path.join(__dirname, '..', 'generate');
const generateLocationsPath = path.join(generatePath, 'locations');
const generateGlobalPath = path.join(generatePath, 'global');

console.log(`🏗️  Generating locations and global for project: ${projectName}`);

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

    // Create src/generate/global directory if it doesn't exist
    if (!fs.existsSync(generateGlobalPath)) {
      fs.mkdirSync(generateGlobalPath, { recursive: true });
      console.log('📁 Created generate/global directory');
    }

    // Process locations
    if (fs.existsSync(locationsPath)) {
      // Get all location folders
      const locationFolders = fs
        .readdirSync(locationsPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      console.log(
        `📍 Found ${locationFolders.length} locations: ${locationFolders.join(
          ', '
        )}`
      );

      // Create folder and index.ts for each location
      for (const locationName of locationFolders) {
        const locationGeneratePath = path.join(
          generateLocationsPath,
          locationName
        );

        // Create location folder in generate/locations
        if (!fs.existsSync(locationGeneratePath)) {
          fs.mkdirSync(locationGeneratePath, { recursive: true });
          console.log(`📁 Created generate/locations/${locationName}`);
        }

        // Generate actions.ts for the location
        await generateActionsFile(
          projectName!,
          projectPath,
          locationName,
          locationGeneratePath,
          false
        );

        // Generate events.ts for the location
        await generateEventsFile(
          projectName!,
          projectPath,
          locationName,
          locationGeneratePath,
          false
        );

        // Generate index.ts for the location (after actions/events are created)
        await generateLocationIndex(
          projectName!,
          projectPath,
          locationName,
          locationGeneratePath
        );
      }
    } else {
      console.log(
        '⚠️  No locations folder found in project, skipping location processing'
      );
    }

    // Process global (always generate, even if empty)
    console.log(`🌍 Processing global location`);

    // Generate actions.ts for the global
    await generateActionsFile(
      projectName!,
      projectPath,
      'global',
      generateGlobalPath,
      true
    );

    // Generate events.ts for the global
    await generateEventsFile(
      projectName!,
      projectPath,
      'global',
      generateGlobalPath,
      true
    );

    // Generate index.ts for the global (after actions/events are created)
    await generateGlobalIndex(projectName!, projectPath, generateGlobalPath);

    console.log('📄 Created generate/global/index.ts');

    console.log('✅ Locations and global generation complete');
  } catch (error: any) {
    console.error('❌ Locations and global generation failed:', error.message);
    process.exit(1);
  }
}

main();
