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

// Scan engine and project types folders
const engineTypesDir: string = path.join(__dirname, "../src/engine/types");
const projectTypesDir: string = path.join(__dirname, `../projects/${currentProject}/types`);

const engineTypes: Record<string, string> = {};
const projectTypes: Record<string, string> = {};

// Scan engine types
if (fs.existsSync(engineTypesDir)) {
  fs.readdirSync(engineTypesDir).forEach((file) => {
    if (file.endsWith(".ts")) {
      const typeName = path.basename(file, ".ts");
      engineTypes[typeName] = path.join(engineTypesDir, file);
    }
  });
}

// Scan project types
if (fs.existsSync(projectTypesDir)) {
  fs.readdirSync(projectTypesDir).forEach((file) => {
    if (file.endsWith(".ts")) {
      const typeName = path.basename(file, ".ts");
      projectTypes[typeName] = path.join(projectTypesDir, file);
    }
  });
}

// Collect all unique type names
const allTypeNames: Set<string> = new Set([
  ...Object.keys(engineTypes),
  ...Object.keys(projectTypes),
]);

const outDir: string = path.join(__dirname, "../src/generate");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

let imports: string = "";
let exportsBlock: string = "export {\n";

allTypeNames.forEach((typeName) => {
  let importPath: string;
  
  // Prefer project type if exists, else engine type
  if (projectTypes[typeName]) {
    const relPath = path.relative(outDir, projectTypes[typeName]).replace(/\\/g, "/").replace(/\.ts$/, "");
    importPath = relPath.startsWith(".") ? relPath : "./" + relPath;
  } else {
    const relPath = path.relative(outDir, engineTypes[typeName]).replace(/\\/g, "/").replace(/\.ts$/, "");
    importPath = relPath.startsWith(".") ? relPath : "./" + relPath;
  }
  
  imports += `import ${typeName} from '${importPath}';\n`;
  exportsBlock += `  ${typeName},\n`;
});

exportsBlock += "}\n";

fs.writeFileSync(
  path.join(outDir, "types.ts"),
  imports + "\n" + exportsBlock,
);

console.log(`📝 types.ts generated for project: ${currentProject}`);