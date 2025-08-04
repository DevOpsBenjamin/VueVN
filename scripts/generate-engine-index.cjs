// Génère src/generate/engine.js avec tous les .js du moteur (project/plugins > core)
const fs = require('fs');
const path = require('path');

// Get current project from environment
const currentProject = process.env.VUEVN_PROJECT;
if (!currentProject) {
  console.error(
    'No project specified. This script should be run via npm run dev/build'
  );
  process.exit(1);
}

function walk(dir, base = '', files = {}) {
  if (!fs.existsSync(dir)) return files;
  fs.readdirSync(dir).forEach((file) => {
    const abs = path.join(dir, file);
    const rel = path.join(base, file);
    if (fs.statSync(abs).isDirectory()) {
      walk(abs, rel, files);
    } else if (file.endsWith('.js')) {
      files[rel.replace(/\\/g, '/')] = abs;
    }
  });
  return files;
}

// Helper: recursively walk a directory, collecting .js files, skipping any 'events' folder
function walkJsFiles(dir, base = '', files = {}) {
  if (!fs.existsSync(dir)) return files;
  fs.readdirSync(dir).forEach((file) => {
    const abs = path.join(dir, file);
    const rel = path.join(base, file);
    if (fs.statSync(abs).isDirectory()) {
      if (file === 'events') return; // skip events folder
      walkJsFiles(abs, rel, files);
    } else if (file.endsWith('.js')) {
      files[rel.replace(/\\/g, '/')] = abs;
    }
  });
  return files;
}

// Scan engine and project folders
const engineRoot = path.join(__dirname, '../src/engine');
const projectRoot = path.join(__dirname, `../projects/${currentProject}`);
const engineFiles = walkJsFiles(engineRoot);
const projectFiles = walkJsFiles(projectRoot);

// Collect all unique relPaths from both engine and project
const allRelPaths = new Set([
  ...Object.keys(engineFiles),
  ...Object.keys(projectFiles),
]);

// Group relPaths by top-level folder (e.g., runtime/Engine.js => runtime)
const groups = {};
for (const relPath of allRelPaths) {
  const [topLevel] = relPath.split('/');
  if (!groups[topLevel]) groups[topLevel] = [];
  groups[topLevel].push(relPath);
}

const outDir = path.join(__dirname, '../src/generate');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

Object.entries(groups).forEach(([group, relPaths]) => {
  let imports = '';
  let exportsBlock = 'export {\n';
  const usedNames = new Set();
  relPaths.forEach((rel) => {
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
    let abs, importPath;
    if (projectFiles[rel]) {
      abs = projectFiles[rel];
      // Path relative to outDir
      const relPath = path.relative(outDir, abs).replace(/\\/g, '/');
      importPath = relPath.startsWith('.') ? relPath : './' + relPath;
    } else {
      abs = engineFiles[rel];
      // Path relative to outDir
      const relPath = path.relative(outDir, abs).replace(/\\/g, '/');
      importPath = relPath.startsWith('.') ? relPath : './' + relPath;
    }
    imports += `import ${finalVarName} from '${importPath}';\n`;
    exportsBlock += `  ${finalVarName},\n`;
  });
  exportsBlock += '}\n';
  fs.writeFileSync(
    path.join(outDir, `${group}.js`),
    imports + '\n' + exportsBlock
  );
  console.log(`${group}.js generated for project: ${currentProject}`);
});
