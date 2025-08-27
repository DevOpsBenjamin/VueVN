#!/usr/bin/env node

import { generateTextSystemV2 } from '../lib/text-generator-v2';

async function main() {
  try {
    generateTextSystemV2();
    console.log('✅ Generated i18n system v2 successfully');
  } catch (error) {
    console.error('❌ Failed to generate i18n system v2:', error);
    process.exit(1);
  }
}

main();