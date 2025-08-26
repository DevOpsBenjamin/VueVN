#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Verify we have a project
const projectName: string = process.env.VUEVN_PROJECT!;
const verbose: boolean = process.env.VUEVN_VERBOSE! == 'true';
const generatePath = path.join(__dirname, '..');

if (verbose) {
  console.log(`🏗️  Generating tsconfig.json for project: ${projectName}`);
}

async function main() {
  try {
    // Create generate directory if it doesn't exist
    if (!fs.existsSync(generatePath)) {
      fs.mkdirSync(generatePath, { recursive: true });
      console.log('📁 Created generate directory');
    }

    const projectTsconfig = {
      compilerOptions: {
        target: 'ESNext',
        useDefineForClassFields: true,
        module: 'ESNext',
        moduleResolution: 'Node',
        strict: true,
        jsx: 'preserve',
        esModuleInterop: true,
        forceConsistentCasingInFileNames: true,
        isolatedModules: true,
        resolveJsonModule: true,
        types: ['vite/client'],
        baseUrl: '.',
        paths: {
          '@engine/*': ['engine_src/*'],
          '@editor/*': ['editor_src/*'],
          '@project/*': [`projects/${projectName}/*`],
          '@generate/*': ['generate/*'],
        },
      },
      include: [
        'engine_src/**/*.ts',
        'engine_src/**/*.vue',
        'editor_src/**/*.ts',
        'editor_src/**/*.vue',
        `projects/${projectName}/**/*.ts`,
        `projects/${projectName}/**/*.vue`,
        'generate/**/*.ts',
      ],
      exclude: ['node_modules', 'dist'],
    };

    const tsconfigPath = path.join(generatePath, 'tsconfig.json');
    fs.writeFileSync(tsconfigPath, JSON.stringify(projectTsconfig, null, 2));
    if (verbose) {
      console.log('📄 Created generate/tsconfig.json');
      console.log('✅ Tsconfig generation complete');
    }
  } catch (error: any) {
    console.error('❌ Tsconfig generation failed:', error.message);
    process.exit(1);
  }
}

main();
