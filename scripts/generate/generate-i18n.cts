#!/usr/bin/env node

import { generateTextSystem } from '../lib/text-generator';

async function main() {
  try {
    generateTextSystem();
    console.log('✅ Generated i18n system v2 successfully');
  } catch (error) {
    console.error('❌ Failed to generate i18n system v2:', error);
    process.exit(1);
  }
}

main();