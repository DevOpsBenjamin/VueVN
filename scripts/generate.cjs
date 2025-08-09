// Script unique pour générer tous les index (components, engine, events)
// Usage: node scripts/generate.cjs [--watch]
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Verify we have a project
const currentProject = process.env.VUEVN_PROJECT;
if (!currentProject) {
  console.error(
    "No project specified. This script should be run via npm run dev/build",
  );
  process.exit(1);
}

console.log(`📦 Generating files for project: ${currentProject}`);

function run(script) {
  try {
    execSync(`node ${path.join(__dirname, script)}`, {
      stdio: "inherit",
      env: process.env, // Pass environment variables
    });
  } catch (error) {
    console.error(`Failed to run ${script}`);
    process.exit(1);
  }
}

// Run all generation scripts
run("generate-components-index.cjs");
run("generate-engine-index.cjs");
run("generate-events-index.cjs");

// Mode watch (dev)
if (process.argv.includes("--watch")) {
  const chokidar = require("chokidar");

  // Watch paths specific to the current project
  const watchList = [
    "src/engine/**/*.vue",
    "src/engine/**/*.ts",
    `projects/${currentProject}/**/*.vue`,
    `projects/${currentProject}/**/*.ts`,
  ];

  console.log("👁️  Watching for changes...");

  const watcher = chokidar.watch(watchList, {
    ignoreInitial: true,
    cwd: path.join(__dirname, ".."),
  });

  watcher.on("all", (event, filePath) => {
    console.log(`🔄 File ${event}: ${filePath}`);

    run("generate-components-index.cjs");
    run("generate-engine-index.cjs");
    run("generate-events-index.cjs");
  });

  watcher.on("error", (error) => {
    console.error("Watcher error:", error);
  });

  // Keep process alive
  process.stdin.resume();
}
