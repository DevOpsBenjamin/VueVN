// Génère src/generate/engine.js avec tous les .js du moteur (plugins > core, chemin réel)
const fs = require('fs');
const path = require('path');

function walk(dir, base = '', files = {}) {
  if (!fs.existsSync(dir)) return files;
  fs.readdirSync(dir).forEach((file) => {
    const abs = path.join(dir, file);
    const rel = path.join(base, file);
    if (fs.statSync(abs).isDirectory()) {
      walk(abs, rel, files);
    } else if (file.endsWith('.js')) {
      // On stocke le nom sans la racine (ex: stores/gameState.js)
      files[rel.replace(/\\/g, '/')] = abs;
    }
  });
  return files;
}

const coreFiles = walk(path.join(__dirname, '../src/engine/core'));
const pluginFiles = walk(path.join(__dirname, '../src/engine/plugins'));
// On fusionne, plugin prioritaire
const allFiles = { ...coreFiles, ...pluginFiles, ...pluginFiles };
Object.keys(pluginFiles).forEach((k) => { allFiles[k] = pluginFiles[k]; });

let imports = '';
let exportsBlock = 'export {\n';
Object.entries(allFiles).forEach(([rel, abs]) => {
  const varName = path.basename(rel, path.extname(rel));
  // Chemin d'import relatif à src/generate
  let importPath;
  if (pluginFiles[rel]) {
    importPath = `../engine/plugins/${rel}`;
  } else {
    importPath = `../engine/core/${rel}`;
  }
  imports += `import ${varName} from '${importPath}';\n`;
  exportsBlock += `  ${varName},\n`;
});
exportsBlock += '}\n';

const outDir = path.join(__dirname, '../src/generate');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
fs.writeFileSync(path.join(outDir, 'engine.js'), imports + '\n' + exportsBlock);
console.log('engine.js generated!');
