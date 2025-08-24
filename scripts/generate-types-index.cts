// Génère src/generate/types.ts avec tous les types (project types > engine types)
import fs from "fs";
import path from "path";

// Get current project from environment
const currentProject: string | undefined = process.env.VUEVN_PROJECT;
if (!currentProject) {
  console.error(
    "No project specified. This script should be run via npm run dev/build",
  );
  process.exit(1);
}

const engineTypesDir: string = path.join(__dirname, "../src/engine/types");
const projectTypesDir: string = path.join(__dirname, `../projects/${currentProject}/types`);

// Recursively walk a dir and map { typeName -> absolutePath }
// - Skips index.ts to avoid duplicate re-exports
// - If duplicate typeNames appear, keeps the first seen and logs a warning
function walkTypeNames(
  dir: string,
  files: Record<string, string> = {},
): Record<string, string> {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir)) {
    const abs = path.join(dir, entry);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) {
      walkTypeNames(abs, files);
    } else if (entry.endsWith(".ts") && entry !== "index.ts") {
      const typeName = path.basename(entry, ".ts");
      if (files[typeName] && files[typeName] !== abs) {
        // Non-fatal: just let the first one win (project will still override engine later)
        console.warn(`[types.ts] Duplicate type name "${typeName}" at:
  - ${files[typeName]}
  - ${abs}
Keeping the first occurrence.`);
      } else {
        files[typeName] = abs;
      }
    }
  }
  return files;
}

const engineTypes: Record<string, string> = walkTypeNames(engineTypesDir);
const projectTypes: Record<string, string> = walkTypeNames(projectTypesDir);

// Collect all unique type names
const allTypeNames: Set<string> = new Set([
  ...Object.keys(engineTypes),
  ...Object.keys(projectTypes),
]);

const outDir: string = path.join(__dirname, "../src/generate");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

let imports = "";
let exportsBlock = "export type {\n";

for (const typeName of allTypeNames) {
  let abs: string | undefined;
  // Prefer project type if it exists
  if (projectTypes[typeName]) abs = projectTypes[typeName];
  else abs = engineTypes[typeName];

  if (!abs) continue; // safety

  // Path relative to outDir without .ts
  const relPath = path
    .relative(outDir, abs)
    .replace(/\\/g, "/")
    .replace(/\.ts$/, "");
  const importPath = relPath.startsWith(".") ? relPath : "./" + relPath;

  imports += `import type { ${typeName} } from '${importPath}';\n`;
  exportsBlock += `  ${typeName},\n`;
}

exportsBlock += "}\n";

fs.writeFileSync(path.join(outDir, "types.ts"), `${imports}\n${exportsBlock}`);

console.log(`🔷 types.ts generated for project: ${currentProject}`);