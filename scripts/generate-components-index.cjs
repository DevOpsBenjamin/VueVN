// Génère src/generate/components.js avec tous les .vue (project/plugins > core)
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
    } else if (file.endsWith('.vue')) {
      files[rel.replace(/\\/g, '/')] = abs;
    }
  });
  return files;
}

// Get files from engine and project plugins
const engineFiles = walk(path.join(__dirname, '../src/engine'));
const projectPluginFiles = walk(
  path.join(__dirname, `../projects/${currentProject}/plugins`)
);

console.log(`Found ${Object.keys(engineFiles).length} engine component files`);
console.log(
  `Found ${
    Object.keys(projectPluginFiles).length
  } project plugin component files`
);

// Merge with project plugins taking priority
const allFiles = { ...engineFiles, ...projectPluginFiles };

let imports = '';
let exportsBlock = 'export {\n';
const usedNames = new Set();

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
  let importPath;
  if (projectPluginFiles[rel]) {
    // Project plugin file - need to go up 2 levels from src/generate
    const relPath = path
      .relative(path.join(__dirname, '../src/generate'), abs)
      .replace(/\\/g, '/');
    importPath = relPath.startsWith('.') ? relPath : './' + relPath;
  } else {
    // Engine file
    importPath = `../engine/${rel}`;
  }

  imports += `import ${finalVarName} from '${importPath}';\n`;
  exportsBlock += `  ${finalVarName},\n`;
});
exportsBlock += '}\n';

const outDir = path.join(__dirname, '../src/generate');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'components.js'),
  imports + '\n' + exportsBlock
);
console.log(`components.js generated for project: ${currentProject}`);
