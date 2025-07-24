import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

export function setupProjectRoutes(middlewares, { currentProject }) {
  const projectPath = path.join(rootDir, 'projects', currentProject);

  // Get project info and config
  middlewares.use('/api/project/info', (req, res, next) => {
    if (req.method === 'GET') {
      try {
        const configPath = path.join(projectPath, 'config.json');
        let config = {};

        if (fs.existsSync(configPath)) {
          config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }

        // Get project statistics
        const stats = {
          events: countFiles(path.join(projectPath, 'events'), '.js'),
          plugins: countFiles(path.join(projectPath, 'plugins'), '.js', '.vue'),
          assets: {
            images: countFiles(
              path.join(projectPath, 'assets/images'),
              '.png',
              '.jpg',
              '.jpeg',
              '.gif',
              '.webp'
            ),
            sounds: countFiles(
              path.join(projectPath, 'assets/sounds'),
              '.mp3',
              '.ogg',
              '.wav'
            ),
          },
        };

        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            name: currentProject,
            path: projectPath,
            config,
            stats,
          })
        );
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }
    next();
  });

  // Update project config
  middlewares.use('/api/project/config', (req, res, next) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const config = JSON.parse(body);
          const configPath = path.join(projectPath, 'config.json');

          // Backup existing config
          if (fs.existsSync(configPath)) {
            fs.copyFileSync(configPath, `${configPath}.backup`);
          }

          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
    next();
  });

  // Get event templates
  middlewares.use('/api/project/templates', (req, res, next) => {
    if (req.method === 'GET') {
      const templates = {
        event: getEventTemplate(),
        component: getComponentTemplate(),
        store: getStoreTemplate(),
      };

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(templates));
      return;
    }
    next();
  });
}

function countFiles(dir, ...extensions) {
  if (!fs.existsSync(dir)) return 0;

  let count = 0;
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      count += countFiles(fullPath, ...extensions);
    } else if (extensions.some((ext) => item.endsWith(ext))) {
      count++;
    }
  }

  return count;
}

function getEventTemplate() {
  return `export default {
  id: 'unique_event_id',
  name: 'Event Name',
  
  // Conditions for this event to be available
  conditions: (state) => {
    return true; // Replace with your conditions
  },
  
  // Execute when event is triggered
  async execute(engine, state) {
    // Your event logic here
    await engine.showText('Hello from new event!');
  }
};`;
}

function getComponentTemplate() {
  return `<template>
  <div class="custom-component">
    <!-- Your component template -->
  </div>
</template>

<script setup>
// Your component logic
</script>

<style scoped>
.custom-component {
  /* Your styles */
}
</style>`;
}

function getStoreTemplate() {
  return `import { defineStore } from 'pinia';

export default defineStore('customStore', {
  state: () => ({
    // Your state properties
  }),
  
  getters: {
    // Your getters
  },
  
  actions: {
    // Your actions
  }
});`;
}
