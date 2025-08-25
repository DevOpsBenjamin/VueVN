#!/usr/bin/env node

import { generateDifferentialExports } from './lib/generic-generator';

async function main() {
  await generateDifferentialExports({
    resourceType: 'stores',
    emoji: '🏪',
    fileExtension: '.ts',
    exportType: 'named'
  });
}

main();