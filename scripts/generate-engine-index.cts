// Génère src/generate/engine.ts avec tous les fichiers .ts du moteur (project files > core)
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

// Helper: recursively walk a directory, collecting .ts files, skipping any 'events' folder
function walkTsFiles(
    dir: string,
    base: string = "",
    files: Record<string, string> = {}
  ): Record<string, string> {
  if (!fs.existsSync(dir)) return files;
  fs.readdirSync(dir).forEach((file) => {
    const abs = path.join(dir, file);
    const rel = path.join(base, file);
    if (fs.statSync(abs).isDirectory()) {
      if (file === "events") return; // skip events folder
      walkTsFiles(abs, rel, files);
    } else if (file.endsWith(".ts") && file !== "types.ts") {
      files[rel.replace(/\\/g, "/")] = abs;
    }
  });
  return files;
}

// Scan engine and project folders
const engineRoot: string = path.join(__dirname, "../src/engine");
const projectRoot: string = path.join(__dirname, `../projects/${currentProject}`);
const engineFiles: Record<string, string> = walkTsFiles(engineRoot);
const projectFiles: Record<string, string> = walkTsFiles(projectRoot);

// Collect all unique relPaths from both engine and project
const allRelPaths: Set<string> = new Set([
  ...Object.keys(engineFiles),
  ...Object.keys(projectFiles),
]);

// Group relPaths by top-level folder (e.g., runtime/Engine.js => runtime)
const groups: Record<string, string[]> = {};
for (const relPath of allRelPaths) {
  const [topLevel] = relPath.split("/");
  if (!groups[topLevel]) groups[topLevel] = [];
  groups[topLevel].push(relPath);
}

const outDir: string = path.join(__dirname, "../src/generate");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

Object.entries(groups).forEach(([group, relPaths]) => {
  let imports: string = "";
  let exportsBlock: string = "export {\n";
  const usedNames: Set<string> = new Set();
  relPaths.forEach((rel: string) => {
    let varName = path.basename(rel, path.extname(rel));
    // Handle duplicate names
    let finalVarName = varName;
    let counter = 1;
    while (usedNames.has(finalVarName)) {
      finalVarName = `${varName}_${counter}`;
      counter++;
    }
    usedNames.add(finalVarName);

    // Prefer project file if exists, else engine
    let abs: string, importPath: string;
    if (projectFiles[rel]) {
      abs = projectFiles[rel];
      // Path relative to outDir
      const relPath = path.relative(outDir, abs).replace(/\\/g, "/");
      importPath = relPath.startsWith(".") ? relPath : "./" + relPath;
    } else {
      abs = engineFiles[rel];
      // Path relative to outDir
      const relPath = path.relative(outDir, abs).replace(/\\/g, "/");
      importPath = relPath.startsWith(".") ? relPath : "./" + relPath;
    }
    imports += `import ${finalVarName} from '${importPath}';\n`;
    exportsBlock += `  ${finalVarName},
`;
  });
  exportsBlock += "}\n";
  fs.writeFileSync(
    path.join(outDir, `${group}.ts`),
    imports + "\n" + exportsBlock,
  );
  console.log(`${group}.ts generated for project: ${currentProject}`);
});