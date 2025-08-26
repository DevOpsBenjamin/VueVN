#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';

const projectName: string = process.env.VUEVN_PROJECT!;
const verbose: boolean = process.env.VUEVN_VERBOSE! == 'true';
const projectPath: string = path.join(
  __dirname,
  '..',
  '..',
  'projects',
  projectName
);

if (!fs.existsSync(projectPath)) {
  console.error(`❌ Error: Project "${projectName}" does not exist`);
  process.exit(1);
}

if (verbose) {
  console.log(`🖨️  Copying assets for project: ${projectName}`);
}

const publicDir: string = path.join(__dirname, '..', 'public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

let assetsCopied = false;

// Copy global assets to public/global/
const globalAssetsPath = path.join(projectPath, 'global');
if (fs.existsSync(globalAssetsPath)) {
  const globalImagesPath = path.join(globalAssetsPath, 'images');
  const globalSoundsPath = path.join(globalAssetsPath, 'sounds');

  if (fs.existsSync(globalImagesPath)) {
    const destGlobalImages = path.join(publicDir, 'global', 'images');
    try {
      fsExtra.copySync(globalImagesPath, destGlobalImages, { overwrite: true });
      if (verbose) {
        console.log(`✅ Copied global images to public/global/images`);
      }
      assetsCopied = true;
    } catch (e: any) {
      console.error('❌ Failed to copy global images:', e);
    }
  }

  if (fs.existsSync(globalSoundsPath)) {
    const destGlobalSounds = path.join(publicDir, 'global', 'sounds');
    try {
      fsExtra.copySync(globalSoundsPath, destGlobalSounds, { overwrite: true });
      if (verbose) {
        console.log(`✅ Copied global sounds to public/global/sounds`);
      }
      assetsCopied = true;
    } catch (e: any) {
      console.error('❌ Failed to copy global sounds:', e);
    }
  }
}

// Copy location-specific assets to public/[location]/
const locationsPath = path.join(projectPath, 'locations');
if (fs.existsSync(locationsPath)) {
  const locations = fs
    .readdirSync(locationsPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const location of locations) {
    const locationPath = path.join(locationsPath, location);
    const locationImagesPath = path.join(locationPath, 'images');
    const locationSoundsPath = path.join(locationPath, 'sounds');

    if (fs.existsSync(locationImagesPath)) {
      const destLocationImages = path.join(publicDir, location, 'images');
      try {
        fsExtra.copySync(locationImagesPath, destLocationImages, {
          overwrite: true,
        });
        if (verbose) {
          console.log(
            `✅ Copied ${location} images to public/${location}/images`
          );
        }
        assetsCopied = true;
      } catch (e: any) {
        console.error(`❌ Failed to copy ${location} images:`, e);
      }
    }

    if (fs.existsSync(locationSoundsPath)) {
      const destLocationSounds = path.join(publicDir, location, 'sounds');
      try {
        fsExtra.copySync(locationSoundsPath, destLocationSounds, {
          overwrite: true,
        });
        if (verbose) {
          console.log(
            `✅ Copied ${location} sounds to public/${location}/sounds`
          );
        }
        assetsCopied = true;
      } catch (e: any) {
        console.error(`❌ Failed to copy ${location} sounds:`, e);
      }
    }
  }
}

if (!assetsCopied) {
  if (verbose) {
    console.log(`🟡 No assets found for project "${projectName}". Skipping.`);
  }
}
