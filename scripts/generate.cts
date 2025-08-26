// Main script to generate all index files (components, engine, events)
// Usage: tsx scripts/generate.cts [--watch] [--verbose]
import { execSync } from "child_process";
import path from "path";
import chokidar from "chokidar";

// Verify we have a project
const currentProject: string | undefined = process.env.VUEVN_PROJECT;
if (!currentProject) {
  console.error(
    "No project specified. This script should be run via npm run dev/build",
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');

function run(script: string): void {
  try {
    const verboseFlag = verbose ? ' --verbose' : '';
    execSync(`tsx ${path.join(__dirname, script)}${verboseFlag}`, {
      stdio: verbose ? "inherit" : "pipe",
      env: process.env, // Pass environment variables
    });
  } catch (error) {
    console.error(`Failed to run ${script}`);
    process.exit(1);
  }
}

// Generate project-specific tsconfig first (only once, not watched)
run("generate-tsconfig.cts");

function generate_files() {
  console.log(`📦 Generating files for project: ${currentProject}`);
  // Run all generation scripts
  run("generate-types.cts");
  run("generate-enums.cts");
  run("generate-stores.cts");
  run("generate-engine.cts");
  run("generate-components.cts");
  run("generate-locations.cts");
  run("generate-project.cts");
  run("generate-i18n.cts");
  console.log(`✅ Done`);
}

generate_files()

// Mode watch (dev)
if (process.argv.includes("--watch")) {
  // Watch paths specific to the current project
  const watchList: string[] = [
    "engine_src/**/*.vue",
    "engine_src/**/*.ts",
    `projects/${currentProject}/**/*.vue`,
    `projects/${currentProject}/**/*.ts`,
    `projects/${currentProject}/**/texts/**/*.ts`, // Watch text files for i18n
  ];

  console.log("👁️  Watching for changes...");

  const watcher = chokidar.watch(watchList, {
    ignoreInitial: true,
    cwd: path.join(__dirname, ".."),
  });

  watcher.on("all", (event: string, filePath: string) => {
    console.log(`🔄 File ${event}: ${filePath}`);
    generate_files()
  });

  watcher.on("error", (error: Error) => {
    console.error("Watcher error:", error);
  });

  // Keep process alive
  process.stdin.resume();
}