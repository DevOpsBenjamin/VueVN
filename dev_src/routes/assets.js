import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

export function setupAssetsRoutes(middlewares, { currentProject }) {
  const projectPath = path.join(rootDir, 'projects', currentProject);
  const assetsPath = path.join(projectPath, 'assets');

  // Upload asset
  middlewares.use('/api/assets/upload', (req, res, next) => {
    if (req.method === 'POST') {
      let chunks = [];

      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        try {
          const buffer = Buffer.concat(chunks);
          const boundary = req.headers['content-type'].split('boundary=')[1];

          // Parse multipart form data (simplified)
          const parts = buffer.toString('binary').split(`--${boundary}`);

          for (const part of parts) {
            if (part.includes('filename=')) {
              const filenameMatch = part.match(/filename="(.+)"/);
              const typeMatch = part.match(/Content-Type: (.+)/);

              if (filenameMatch && typeMatch) {
                const filename = filenameMatch[1];
                const contentType = typeMatch[1].trim();

                // Extract file content
                const contentStart = part.indexOf('\r\n\r\n') + 4;
                const contentEnd = part.lastIndexOf('\r\n');
                const content = Buffer.from(
                  part.slice(contentStart, contentEnd),
                  'binary'
                );

                // Determine subfolder based on content type
                let subfolder = 'misc';
                if (contentType.startsWith('image/')) subfolder = 'images';
                else if (contentType.startsWith('audio/')) subfolder = 'sounds';
                else if (contentType.startsWith('video/')) subfolder = 'videos';

                const targetDir = path.join(assetsPath, subfolder);
                if (!fs.existsSync(targetDir)) {
                  fs.mkdirSync(targetDir, { recursive: true });
                }

                const targetPath = path.join(targetDir, filename);
                fs.writeFileSync(targetPath, content);

                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    success: true,
                    path: `assets/${subfolder}/${filename}`,
                    size: content.length,
                    type: contentType,
                  })
                );
                return;
              }
            }
          }

          res.statusCode = 400;
          res.end('No file found in upload');
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
    next();
  });

  // List assets
  middlewares.use('/api/assets/list', (req, res, next) => {
    if (req.method === 'GET') {
      try {
        const assets = {
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

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(assets));
      } catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }
    next();
  });

  // Get asset info/preview
  middlewares.use('/api/assets/info', (req, res, next) => {
    if (req.method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const assetPath = url.searchParams.get('path');

      if (!assetPath) {
        res.statusCode = 400;
        res.end('No path specified');
        return;
      }

      try {
        const fullPath = path.join(projectPath, assetPath);

        if (!fullPath.startsWith(projectPath)) {
          res.statusCode = 403;
          res.end('Access denied');
          return;
        }

        const stats = fs.statSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase();

        let type = 'unknown';
        let preview = null;

        if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
          type = 'image';
          // Could generate base64 preview for small images
        } else if (['.mp3', '.ogg', '.wav'].includes(ext)) {
          type = 'audio';
        } else if (['.mp4', '.webm'].includes(ext)) {
          type = 'video';
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(
          JSON.stringify({
            name: path.basename(fullPath),
            path: assetPath,
            type,
            size: stats.size,
            modified: stats.mtime,
            preview,
          })
        );
      } catch (err) {
        res.statusCode = 404;
        res.end('Asset not found');
      }
      return;
    }
    next();
  });
}
