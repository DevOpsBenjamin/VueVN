#!/usr/bin/env node

import { generateTextSystem } from '../lib/text-generator';

async function main() {
  try {
    await generateTextSystem();
  } catch (error) {
    console.error('❌ Failed to generate i18n system:', error);
    process.exit(1);
  }
}

main();
