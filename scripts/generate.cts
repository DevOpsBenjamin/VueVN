// Main script to generate all index files (components, engine, events)
// Usage: tsx scripts/generate.cts [--watch] [--verbose]
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';

// Verify we have a project
const currentProject: string = process.env.VUEVN_PROJECT!;
const verbose: boolean = process.env.VUEVN_VERBOSE! == 'true';

if (!currentProject) {
  console.error(
    'No project specified. This script should be run via npm run dev/build'
  );
  process.exit(1);
}

function run(script: string): void {
  try {
    execSync(`tsx ${path.join(__dirname, script)}`, {
      stdio: 'inherit',
      env: process.env, // Pass environment variables
    });
  } catch (error) {
    console.error(`Failed to run ${script}`);
    process.exit(1);
  }
}

// Generate project-specific tsconfig first (only once, not watched)
run('generate/generate-tsconfig.cts');

function generate_files() {
  // Clean up old generated files before regenerating
  const generatePath = path.join(process.cwd(), 'src/generate');
  if (fs.existsSync(generatePath)) {
    fs.rmSync(generatePath, { recursive: true, force: true });
    if (verbose) {
      console.log(`🗑️ Removed old generate folder: ${generatePath}`);
    }
  }
  if (verbose) {
    console.log(`📦 Generating files for project: ${currentProject}`);
  }
  // Run all generation scripts
  run('generate/generate-types.cts');
  run('generate/generate-enums.cts');
  run('generate/generate-stores.cts');
  run('generate/generate-engine.cts');
  run('generate/generate-components.cts');
  run('generate/generate-locations.cts');
  run('generate/generate-project.cts');
  run('generate/generate-i18n-v2.cts');
}

generate_files();

// Mode watch (dev)
if (process.argv.includes('--watch')) {
  // Watch paths specific to the current project
  const watchList: string[] = [
    'engine_src/**/*.vue',
    'engine_src/**/*.ts',
    `projects/${currentProject}/**/*.vue`,
    `projects/${currentProject}/**/*.ts`,
    `projects/${currentProject}/**/texts/**/*.ts`, // Watch text files for i18n
  ];

  console.log('👁️  Watching for changes...');

  const watcher = chokidar.watch(watchList, {
    ignoreInitial: true,
    cwd: path.join(__dirname, '..'),
  });

  watcher.on('all', (event: string, filePath: string) => {
    console.log(`🔄 File ${event}: ${filePath}`);
    generate_files();
    console.log(`✅ Done`);
  });

  watcher.on('error', (error: Error) => {
    console.error('Watcher error:', error);
  });

  // Keep process alive
  process.stdin.resume();
}
