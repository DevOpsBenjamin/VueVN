// Script unique pour générer tous les index (components, engine, events)
// Usage: node scripts/generate.cjs [--watch]
const { execSync } = require('child_process');
const path = require('path');

function run(script) {
  execSync(`node ${path.join(__dirname, script)}`, { stdio: 'inherit' });
}

run('generate-components-index.cjs');
run('generate-engine-index.cjs');
run('generate-events-index.cjs');

// Mode watch (dev)
if (process.argv.includes('--watch')) {
  const chokidar = require('chokidar');
  const watchList = [
    'src/engine/core/**/*.vue',
    'src/engine/plugins/**/*.vue',
    'src/engine/core/**/*.js',
    'src/engine/plugins/**/*.js',
    'projects/**/*.js',
  ];
  chokidar.watch(watchList, { ignoreInitial: true })
    .on('all', () => {
      run('generate-components-index.cjs');
      run('generate-engine-index.cjs');
      run('generate-events-index.cjs');
    });
  console.log('[generate.cjs] Watching for changes...');
}
