#!/usr/bin/env node

import { generateDifferentialExports } from './lib/generic-generator';

async function main() {
  await generateDifferentialExports({
    resourceType: 'components',
    emoji: '🎨',
    fileExtension: '.vue',
    exportType: 'named'
  });
}

main();