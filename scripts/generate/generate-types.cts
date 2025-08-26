#!/usr/bin/env node

import { generateDifferentialExports } from '../lib/generic-generator';

async function main() {
  await generateDifferentialExports({
    resourceType: 'types',
    emoji: '🔧',
    fileExtension: '.ts',
    exportType: 'type',
  });
}

main();
