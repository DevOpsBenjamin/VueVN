// Génère src/generate/events.ts pour le projet courant (events[location] = [eventObj, ...])
const fs = require("fs");
const path = require("path");

// Get project from environment variable
const currentProject = process.env.VUEVN_PROJECT;
if (!currentProject) {
  console.error(
    "No project specified. This script should be run via npm run dev/build",
  );
  process.exit(1);
}

const eventsDir = path.join(__dirname, `../projects/${currentProject}/events`);
if (!fs.existsSync(eventsDir)) {
  const outDir = path.join(__dirname, "../src/generate");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  fs.writeFileSync(
    path.join(outDir, "events.ts"),
    "export const events = {};\n",
  );
  console.log("No events directory found, created empty events.ts");
  return;
}

function walk(dir, base = "", files = {}) {
  fs.readdirSync(dir).forEach((file) => {
    const abs = path.join(dir, file);
    const rel = path.join(base, file);
    if (fs.statSync(abs).isDirectory()) {
      walk(abs, rel, files);
    } else if (file.endsWith(".ts")) {
      // location = premier dossier après events/
      const parts = rel.replace(/\\/g, "/").split("/");
      const location = parts[0];
      if (!files[location]) files[location] = [];
      files[location].push(abs);
    }
  });
  return files;
}

const filesByLoc = walk(eventsDir);
let imports = "import type { VNEvent } from '@/generate/types';\n";
let eventsBlock = "export const events: Record<string, VNEvent[]> = {\n";
let importCount = 0;
Object.entries(filesByLoc).forEach(([location, files]) => {
  eventsBlock += `  '${location}': [`;
  files.forEach((f) => {
    const varName = `event${importCount++}`;
    const relPath = path
      .relative(path.join(__dirname, "../src/generate"), f)
      .replace(/\\/g, "/");
    imports += `import ${varName} from '${
      relPath.startsWith(".") ? relPath : "../" + relPath
    }';\n`;
    eventsBlock += `${varName},`;
  });
  eventsBlock += "],\n";
});
eventsBlock += "};\n";

const outDir = path.join(__dirname, "../src/generate");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
fs.writeFileSync(path.join(outDir, "events.ts"), imports + "\n" + eventsBlock);
console.log("🎭 events.ts generated for project", currentProject);
