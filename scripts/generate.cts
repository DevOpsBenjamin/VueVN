// Script unique pour générer tous les index (components, engine, events)
// Usage: tsx scripts/generate.cts [--watch]

import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import chokidar from "chokidar";

// Verify we have a project
const currentProject: string | undefined = process.env.VUEVN_PROJECT;
if (!currentProject) {
  console.error(
    "No project specified. This script should be run via npm run dev/build",
  );
  process.exit(1);
}

console.log(`📦 Generating files for project: ${currentProject}`);

function run(script: string): void {
  try {
    execSync(`tsx ${path.join(__dirname, script)}`, {
      stdio: "inherit",
      env: process.env, // Pass environment variables
    });
  } catch (error) {
    console.error(`Failed to run ${script}`);
    process.exit(1);
  }
}

// Run all generation scripts
run("generate-types-index.cts");
run("generate-components-index.cts");
run("generate-engine-index.cts");
run("generate-events-index.cts");

// Mode watch (dev)
if (process.argv.includes("--watch")) {

  // Watch paths specific to the current project
  const watchList: string[] = [
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

  watcher.on("all", (event: string, filePath: string) => {
    console.log(`🔄 File ${event}: ${filePath}`);

    run("generate-types-index.cts");
    run("generate-components-index.cts");
    run("generate-engine-index.cts");
    run("generate-events-index.cts");
  });

  watcher.on("error", (error: Error) => {
    console.error("Watcher error:", error);
  });

  // Keep process alive
  process.stdin.resume();
}