// Génère src/generate/components.ts avec tous les .vue (project files > core)
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

function walkVueFiles(
    dir: string,
    base: string = "",
    files: Record<string, string> = {},
    skipEvents: boolean = false
  ): Record<string, string> {
  if (!fs.existsSync(dir)) return files;
  fs.readdirSync(dir).forEach((file) => {
    const abs = path.join(dir, file);
    const rel = path.join(base, file);
    if (fs.statSync(abs).isDirectory()) {
      if (skipEvents && file === "events") return;
      walkVueFiles(abs, rel, files, skipEvents);
    } else if (file.endsWith(".vue")) {
      files[rel.replace(/\\/g, "/")] = abs;
    }
  });
  return files;
}

// Get files from engine and project
const engineFiles: Record<string, string> = walkVueFiles(path.join(__dirname, "../src/engine"));
const projectFiles: Record<string, string> = walkVueFiles(
  path.join(__dirname, `../projects/${currentProject}`),
  "",
  {},
  true,
);

console.log(`Found ${Object.keys(engineFiles).length} engine component files`);
console.log(
  `Found ${Object.keys(projectFiles).length} project component files`,
);

// Merge with project files taking priority
const allFiles: Record<string, string> = { ...engineFiles, ...projectFiles };

let imports: string = "";
const usedNames: Set<string> = new Set();
const exportNames: string[] = [];

Object.entries(allFiles).forEach(([rel, abs]) => {
  let varName = path.basename(rel, path.extname(rel));
  // Handle duplicate names
  let finalVarName = varName;
  let counter = 1;
  while (usedNames.has(finalVarName)) {
    finalVarName = `${varName}_${counter}`;
    counter++;
  }
  usedNames.add(finalVarName);

  // Determine import path relative to src/generate
  let importPath: string;
  if (projectFiles[rel]) {
    // Project file - need to go up 2 levels from src/generate
    const relPath = path
      .relative(path.join(__dirname, "../src/generate"), abs)
      .replace(/\\/g, "/");
    importPath = relPath.startsWith(".") ? relPath : "./" + relPath;
  } else {
    // Engine file
    importPath = `../engine/${rel}`;
  }

  imports += `import ${finalVarName} from '${importPath}';\n`;
  exportNames.push(finalVarName);
});

const outDir: string = path.join(__dirname, "../src/generate");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const projectIdDecl: string = `const PROJECT_ID = '${currentProject}';\n`;
let exportsBlock: string = "export {\n  PROJECT_ID,";
for (const name of exportNames) {
  exportsBlock += `\n  ${name},`;
}
exportsBlock += "\n}\n";

fs.writeFileSync(
  path.join(outDir, "components.ts"),
  imports + "\n" + projectIdDecl + "\n" + exportsBlock,
);
console.log(`🧩 components.ts generated for project: ${currentProject}`);