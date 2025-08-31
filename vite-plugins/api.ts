import { Plugin } from 'vite';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra'; // Assuming fs-extra is available or will be installed

// Define basic Request, Response, NextFunction interfaces for middleware compatibility
interface Request {
  method: string;
  headers: Record<string, string>;
  url: string;
  on(event: 'data' | 'end', listener: (chunk: Buffer | string) => void): void;
  // Add other properties as needed, e.g., query, body
}

interface Response {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(data?: string | Buffer): void;
  writeHead(statusCode: number, headers: Record<string, string>): void; // For SSE
}

type NextFunction = () => void;

const viteApiPlugin = (): Plugin => {
  return {
    name: 'vite-api-plugin',
    configureServer(server) {
      const rootDir = process.cwd(); // Vite's root is usually the project root
      const currentProject = process.env.VUEVN_PROJECT || 'sample'; // Fallback to 'sample'

      const projectPath = path.join(rootDir, 'projects', currentProject);
      const assetsPath = path.join(projectPath, 'assets');

      // Helper function to handle JSON responses
      const sendJson = (res: Response, data: any, statusCode: number = 200) => {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      };

      // Helper function to read request body
      const getRequestBody = (req: Request): Promise<string> => {
        return new Promise((resolve, reject) => {
          let body = '';
          req.on('data', (chunk: string) => (body += chunk));
          req.on('end', () => resolve(body));
          req.on('error', reject);
        });
      };

      // Replicate dev_src/routes/files.ts logic
      server.middlewares.use('/api/files', async (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET') {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const requestPath = url.searchParams.get('path') || '';
          const fullPath = path.join(projectPath, requestPath);

          try {
            if (!fullPath.startsWith(projectPath)) {
              return sendJson(res, 'Access denied', 403);
            }

            if (fs.statSync(fullPath).isDirectory()) {
              const items = fs
                .readdirSync(fullPath)
                .filter((name) => !name.startsWith('.'))
                .map((name) => {
                  const itemPath = path.join(fullPath, name);
                  const stats = fs.statSync(itemPath);
                  return {
                    name,
                    type: stats.isDirectory() ? 'directory' : 'file',
                    path: path.join(requestPath, name).replace(/\\/g, '/'),
                    size: stats.size,
                    modified: stats.mtime,
                  };
                })
                .sort((a, b) => {
                  if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
                  return a.name.localeCompare(b.name);
                });
              return sendJson(res, items);
            } else {
              return sendJson(res, 'Not a directory', 400);
            }
          } catch (err: any) {
            return sendJson(res, 'Path not found', 404);
          }
        }
        next();
      });

      server.middlewares.use('/api/file', async (req: Request, res: Response, next: NextFunction) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const filePath = url.searchParams.get('path');

        if (req.method === 'GET') {
          if (!filePath) {
            return sendJson(res, 'No path specified', 400);
          }
          const fullPath = path.join(projectPath, filePath);
          if (!fullPath.startsWith(projectPath)) {
            return sendJson(res, 'Access denied', 403);
          }
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const stats = fs.statSync(fullPath);
            return sendJson(res, { content, path: filePath, modified: stats.mtime, size: stats.size });
          } catch (err: any) {
            return sendJson(res, 'File not found', 404);
          }
        } else if (req.method === 'POST') {
          try {
            const { path: filePath, content }: { path: string, content: string } = JSON.parse(await getRequestBody(req));
            const fullPath = path.join(projectPath, filePath);
            if (!fullPath.startsWith(projectPath)) {
              return sendJson(res, 'Access denied', 403);
            }
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(fullPath, content, 'utf-8');
            return sendJson(res, { success: true, path: filePath, size: Buffer.byteLength(content, 'utf-8') });
          } catch (err: any) {
            return sendJson(res, { error: err.message }, 500);
          }
        }
        next();
      });

      server.middlewares.use('/api/create', async (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'POST') {
          try {
            const { path: itemPath, type, template }: { path: string, type: string, template?: string } = JSON.parse(await getRequestBody(req));
            const fullPath = path.join(projectPath, itemPath);
            if (!fullPath.startsWith(projectPath)) {
              return sendJson(res, 'Access denied', 403);
            }
            if (fs.existsSync(fullPath)) {
              return sendJson(res, 'Already exists', 409);
            }
            if (type === 'directory') {
              fs.mkdirSync(fullPath, { recursive: true });
            } else {
              const dir = path.dirname(fullPath);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }
              const content = template || '';
              fs.writeFileSync(fullPath, content, 'utf-8');
            }
            return sendJson(res, { success: true, path: itemPath });
          } catch (err: any) {
            return sendJson(res, { error: err.message }, 500);
          }
        }
        next();
      });

      server.middlewares.use('/api/delete', async (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'DELETE') {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const itemPath = url.searchParams.get('path');
          if (!itemPath) {
            return sendJson(res, 'No path specified', 400);
          }
          const fullPath = path.join(projectPath, itemPath);
          if (!fullPath.startsWith(projectPath)) {
            return sendJson(res, 'Access denied', 403);
          }
          try {
            if (fs.statSync(fullPath).isDirectory()) {
              fs.rmSync(fullPath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(fullPath);
            }
            return sendJson(res, { success: true });
          } catch (err: any) {
            return sendJson(res, { error: err.message }, 500);
          }
        }
        next();
      });

      server.middlewares.use('/api/rename', async (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'POST') {
          try {
            const { oldPath, newPath }: { oldPath: string, newPath: string } = JSON.parse(await getRequestBody(req));
            const fullOldPath = path.join(projectPath, oldPath);
            const fullNewPath = path.join(projectPath, newPath);
            if (!fullOldPath.startsWith(projectPath) || !fullNewPath.startsWith(projectPath)) {
              return sendJson(res, 'Access denied', 403);
            }
            const newDir = path.dirname(fullNewPath);
            if (!fs.existsSync(newDir)) {
              fs.mkdirSync(newDir, { recursive: true });
            }
            fs.renameSync(fullOldPath, fullNewPath);
            return sendJson(res, { success: true });
          } catch (err: any) {
            return sendJson(res, { error: err.message }, 500);
          }
        }
        next();
      });

      // Replicate dev_src/routes/assets.ts logic
      server.middlewares.use('/api/assets/upload', async (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'POST') {
          let chunks: Buffer[] = [];
          req.on('data', (chunk: Buffer) => chunks.push(chunk));
          req.on('end', () => {
            try {
              const buffer = Buffer.concat(chunks);
              const contentTypeHeader = req.headers['content-type'];
              if (!contentTypeHeader) {
                return sendJson(res, 'Missing Content-Type header', 400);
              }
              const boundaryMatch = contentTypeHeader.match(/boundary=(.+)/);
              if (!boundaryMatch) {
                return sendJson(res, 'Missing boundary in Content-Type', 400);
              }
              const boundary = boundaryMatch[1];

              const parts = buffer.toString('binary').split(`--${boundary}`);

              // Optional destination subpath under assets category
              let destSubpath = '';
              for (const part of parts) {
                if (part.includes('name="dest"') && !part.includes('filename=')) {
                  const contentStart = part.indexOf('\r\n\r\n');
                  if (contentStart !== -1) {
                    const contentEnd = part.lastIndexOf('\r\n');
                    const raw = part.slice(contentStart + 4, contentEnd).trim();
                    destSubpath = raw.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
                    if (destSubpath.includes('..')) destSubpath = '';
                  }
                }
              }

              for (const part of parts) {
                if (part.includes('filename=')) {
                  const filenameMatch = part.match(/filename="(.+)"/);
                  const typeMatch = part.match(/Content-Type: (.+)/);

                  if (filenameMatch && typeMatch) {
                    const filename = filenameMatch[1];
                    const contentType = typeMatch[1].trim();

                    const contentStart = part.indexOf('\r\n\r\n') + 4;
                    const contentEnd = part.lastIndexOf('\r\n');
                    const content = Buffer.from(part.slice(contentStart, contentEnd), 'binary');

                    let subfolder = 'misc';
                    if (contentType.startsWith('image/')) subfolder = 'images';
                    else if (contentType.startsWith('audio/')) subfolder = 'sounds';
                    else if (contentType.startsWith('video/')) subfolder = 'videos';

                    const baseTarget = path.join(assetsPath, subfolder);
                    const targetDir = destSubpath ? path.join(baseTarget, destSubpath) : baseTarget;
                    if (!targetDir.startsWith(assetsPath)) {
                      return sendJson(res, 'Invalid destination', 400);
                    }
                    if (!fs.existsSync(targetDir)) {
                      fs.mkdirSync(targetDir, { recursive: true });
                    }

                    const targetPath = path.join(targetDir, filename);
                    fs.writeFileSync(targetPath, content);

                    const rel = path.relative(projectPath, targetPath).replace(/\\/g, '/');
                    return sendJson(res, { success: true, path: rel, size: content.length, type: contentType });
                  }
                }
              }
              return sendJson(res, 'No file found in upload', 400);
            } catch (err: any) {
              return sendJson(res, { error: err.message }, 500);
            }
          });
          return; // Important: return here to prevent next() from being called immediately
        }
        next();
      });

      server.middlewares.use('/api/assets/list', async (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET') {
          try {
            const assets: Record<string, any[]> = {
              images: [],
              sounds: [],
              videos: [],
              misc: [],
            };

            for (const category of Object.keys(assets)) {
              const categoryPath = path.join(assetsPath, category);
              if (fs.existsSync(categoryPath)) {
                assets[category] = fs
                  .readdirSync(categoryPath)
                  .filter((f) => !f.startsWith('.'))
                  .map((f) => {
                    const fullPath = path.join(categoryPath, f);
                    const stats = fs.statSync(fullPath);
                    return {
                      name: f,
                      path: `assets/${category}/${f}`,
                      size: stats.size,
                      modified: stats.mtime,
                    };
                  });
              }
            }
            return sendJson(res, assets);
          } catch (err: any) {
            return sendJson(res, { error: err.message }, 500);
          }
        }
        next();
      });

      server.middlewares.use('/api/assets/info', async (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET') {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const assetPath = url.searchParams.get('path');

          if (!assetPath) {
            return sendJson(res, 'No path specified', 400);
          }

          try {
            const fullPath = path.join(projectPath, assetPath);
            if (!fullPath.startsWith(projectPath)) {
              return sendJson(res, 'Access denied', 403);
            }

            const stats = fs.statSync(fullPath);
            const ext = path.extname(fullPath).toLowerCase();

            let type = 'unknown';
            let preview = null;

            if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
              type = 'image';
            } else if (['.mp3', '.ogg', '.wav'].includes(ext)) {
              type = 'audio';
            } else if (['.mp4', '.webm'].includes(ext)) {
              type = 'video';
            }

            return sendJson(res, { name: path.basename(fullPath), path: assetPath, type, size: stats.size, modified: stats.mtime, preview });
          } catch (err: any) {
            return sendJson(res, 'Asset not found', 404);
          }
        }
        next();
      });

      // Replicate dev_src/routes/project.ts logic
      server.middlewares.use('/api/project/info', async (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET') {
          try {
            const configPath = path.join(projectPath, 'config.json');
            let config: Record<string, any> = {};

            if (fs.existsSync(configPath)) {
              config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            }

            const stats = {
              events: countFiles(path.join(projectPath, 'events'), '.js'), // Note: still .js, will be .ts later
              plugins: countPluginFiles(projectPath),
              assets: {
                images: countFiles(path.join(projectPath, 'assets/images'), '.png', '.jpg', '.jpeg', '.gif', '.webp'),
                sounds: countFiles(path.join(projectPath, 'assets/sounds'), '.mp3', '.ogg', '.wav'),
              },
            };
            return sendJson(res, { name: currentProject, path: projectPath, config, stats });
          } catch (err: any) {
            return sendJson(res, { error: err.message }, 500);
          }
        }
        next();
      });

      server.middlewares.use('/api/project/config', async (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'POST') {
          try {
            const config: Record<string, any> = JSON.parse(await getRequestBody(req));
            const configPath = path.join(projectPath, 'config.json');
            if (fs.existsSync(configPath)) {
              fs.copyFileSync(configPath, `${configPath}.backup`);
            }
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            return sendJson(res, { success: true });
          } catch (err: any) {
            return sendJson(res, { error: err.message }, 500);
          }
        }
        next();
      });

      server.middlewares.use('/api/project/templates', async (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET') {
          const templates = {
            event: getEventTemplate(),
            component: getComponentTemplate(),
            store: getStoreTemplate(),
          };
          return sendJson(res, templates);
        }
        next();
      });

      // Replicate dev_src/routes/state.ts logic
      let gameStateSnapshot: Record<string, any> = {};
      let engineStateSnapshot: Record<string, any> = {};

      server.middlewares.use('/api/state/game', async (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET') {
          return sendJson(res, gameStateSnapshot);
        } else if (req.method === 'POST') {
          try {
            const updates: Record<string, any> = JSON.parse(await getRequestBody(req));
            Object.assign(gameStateSnapshot, updates);
            return sendJson(res, { success: true });
          } catch (err: any) {
            return sendJson(res, { error: err.message }, 500);
          }
        }
        next();
      });

      server.middlewares.use('/api/state/engine', async (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET') {
          return sendJson(res, engineStateSnapshot);
        }
        next();
      });

      server.middlewares.use('/api/state/stream', (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
          });

          res.write(`data: ${JSON.stringify({ type: 'initial', gameState: gameStateSnapshot, engineState: engineStateSnapshot })}\n\n`);

          const keepAlive = setInterval(() => {
            res.write(':ping\n\n');
          }, 30000);

          req.on('close', () => {
            clearInterval(keepAlive);
          });
          return; // Important: return here to prevent next() from being called immediately
        }
        next();
      });

      server.middlewares.use('/api/state/reset', async (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'POST') {
          gameStateSnapshot = {};
          engineStateSnapshot = {};
          return sendJson(res, { success: true });
        }
        next();
      });

      // Health check endpoint (from dev_src/index.ts)
      server.middlewares.use('/api/health', (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET') {
          return sendJson(res, { status: 'ok', project: currentProject });
        }
        next();
      });

      // Helper functions from dev_src/routes/project.ts
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
          } else if (item.endsWith('.js') || item.endsWith('.vue')) { // Still checking for .js, will be .ts later
            count++;
          }
        }
        return count;
      }

      function getEventTemplate(): string {
        return `export default {\n  id: 'unique_event_id',\n  name: 'Event Name',\n  \n  // Conditions for this event to be available\n  conditions: (state) => {\n    return true; // Replace with your conditions\n  },\n  \n  // Execute when event is triggered\n  async execute(engine, state) {\n    // Your event logic here\n    await engine.showText('Hello from new event!');\n  }\n};`;
      }

      function getComponentTemplate(): string {
        return `<template>\n  <div class="custom-component">\n    <!-- Your component template -->\n  </div>\n</template>\n\n<script setup>\n// Your component logic\n</script>\n\n<style scoped>\n.custom-component {\n  /* Your styles */\n}\n</style>`;
      }

      function getStoreTemplate(): string {
        return `import { defineStore } from 'pinia';\n\nexport default defineStore('customStore', {\n  state: () => ({\n    // Your state properties\n  }),\n  \n  getters: {\n    // Your getters\n  },\n  \n  actions: {\n    // Your actions\n  }\n});`;
      }
    },
  };
};

export default viteApiPlugin;
