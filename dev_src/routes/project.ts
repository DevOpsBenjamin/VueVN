import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface Request {
  method: string;
  headers: Record<string, string>;
  url: string;
  on(event: 'data' | 'end', listener: (chunk: string) => void): void;
  searchParams: URLSearchParams; // Added for GET requests
}

interface Response {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(data?: string | Buffer): void;
}

type NextFunction = () => void;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

export function setupProjectRoutes(middlewares: any, { currentProject }: { currentProject: string }) {
  const projectPath = path.join(rootDir, 'projects', currentProject);

  // Get project info and config
  middlewares.use('/api/project/info', (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      try {
        const configPath = path.join(projectPath, 'config.json');
        let config: Record<string, any> = {};

        if (fs.existsSync(configPath)) {
          config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }

        // Get project statistics
        const stats = {
          events: countFiles(path.join(projectPath, 'events'), '.js'),
          plugins: countPluginFiles(projectPath),
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
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }
    next();
  });

  // Update project config
  middlewares.use('/api/project/config', (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: string) => (body += chunk));
      req.on('end', () => {
        try {
          const config: Record<string, any> = JSON.parse(body);
          const configPath = path.join(projectPath, 'config.json');

          // Backup existing config
          if (fs.existsSync(configPath)) {
            fs.copyFileSync(configPath, `${configPath}.backup`);
          }

          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
    next();
  });

  // Get event templates
  middlewares.use('/api/project/templates', (req: Request, res: Response, next: NextFunction) => {
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

function countFiles(dir: string, ...extensions: string[]): number {
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

function countPluginFiles(dir: string): number {
  if (!fs.existsSync(dir)) return 0;

  let count = 0;
  const items = fs.readdirSync(dir);

  for (const item of items) {
    if (['events', 'assets'].includes(item)) continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      count += countPluginFiles(fullPath);
    } else if (item.endsWith('.js') || item.endsWith('.vue')) {
      count++;
    }
  }

  return count;
}

function getEventTemplate(): string {
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

function getComponentTemplate(): string {
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

function getStoreTemplate(): string {
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