export function setupStateRoutes(middlewares: any, { currentProject }: { currentProject: string }) {
  let gameStateSnapshot: Record<string, any> = {};
  let engineStateSnapshot: Record<string, any> = {};

  // Get current game state
  middlewares.use('/api/state/game', (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(gameStateSnapshot));
      return;
    }

    // Update game state (from editor)
    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: string) => (body += chunk));
      req.on('end', () => {
        try {
          const updates: Record<string, any> = JSON.parse(body);
          // Here you would emit events to update the actual Pinia store
          // For now, just update our snapshot
          Object.assign(gameStateSnapshot, updates);

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

  // Get engine state
  middlewares.use('/api/state/engine', (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(engineStateSnapshot));
      return;
    }
    next();
  });

  // SSE endpoint for real-time state updates
  middlewares.use('/api/state/stream', (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      // Send initial state
      res.write(
        `data: ${JSON.stringify({
          type: 'initial',
          gameState: gameStateSnapshot,
          engineState: engineStateSnapshot,
        })}\n\n`
      );

      // Keep connection alive
      const keepAlive = setInterval(() => {
        res.write(':ping\n\n');
      }, 30000);

      // Cleanup on close
      req.on('close', () => {
        clearInterval(keepAlive);
      });

      return;
    }
    next();
  });

  // Reset states
  middlewares.use('/api/state/reset', (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST') {
      gameStateSnapshot = {};
      engineStateSnapshot = {};

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true }));
      return;
    }
    next();
  });
}