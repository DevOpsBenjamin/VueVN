import { setupFileRoutes } from './routes/files.js';
import { setupProjectRoutes } from './routes/project.js';
import { setupStateRoutes } from './routes/state.js';
import { setupAssetsRoutes } from './routes/assets.js';

export function setupDevApi(middlewares) {
  // Get current project from environment
  const currentProject = process.env.VUEVN_PROJECT;
  if (!currentProject) {
    console.error('❌ No project specified for dev API');
    return;
  }

  console.log(`📡 Dev API starting for project: ${currentProject}`);

  // Setup all route modules
  const context = { currentProject };

  setupFileRoutes(middlewares, context);
  setupProjectRoutes(middlewares, context);
  setupStateRoutes(middlewares, context);
  setupAssetsRoutes(middlewares, context);

  // Health check endpoint
  middlewares.use('/api/health', (req, res, next) => {
    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          status: 'ok',
          project: currentProject,
        })
      );
      return;
    }
    next();
  });

  console.log(`✅ Dev API ready with modules: files, project, state, assets`);
}
