import { setupFileRoutes } from './routes/files.ts';
import { setupProjectRoutes } from './routes/project.ts';
import { setupStateRoutes }./routes/state.ts';
import { setupAssetsRoutes } from './routes/assets.ts';

export function setupDevApi(middlewares: any) {
  // Get current project from environment
  const currentProject: string | undefined = process.env.VUEVN_PROJECT;
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
  middlewares.use('/api/health', (req: any, res: any, next: any) => {
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