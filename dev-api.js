import fs from 'fs';
import path from 'path';

function setupDevApi(middlewares) {
  // Liste les projets
  middlewares.use('/api/projects', (req, res, next) => {
    if (req.method === 'GET') {
      const projectsDir = path.join(__dirname, 'projects');
      if (!fs.existsSync(projectsDir)) fs.mkdirSync(projectsDir);
      const projects = fs
        .readdirSync(projectsDir)
        .filter((f) => fs.statSync(path.join(projectsDir, f)).isDirectory());
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(projects));
      return;
    }
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        const { name } = JSON.parse(body);
        const dir = path.join(__dirname, 'projects', name);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ ok: true }));
      });
      return;
    }
    next();
  });
  // Tu pourras ajouter d'autres routes ici (save, load, etc)
}

export { setupDevApi };
