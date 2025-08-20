import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
// Ensure file operations target the repository root instead of dev_src
const rootDir = path.join(__dirname, "..", "..");

export function setupFileRoutes(middlewares: any, { currentProject }: { currentProject: string }) {
  const projectPath = path.join(rootDir, "projects", currentProject);

  // List files in directory
  middlewares.use("/api/files", (req: Request, res: Response, next: NextFunction) => {
    if (req.method === "GET") {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const requestPath = url.searchParams.get("path") || "";
      const fullPath = path.join(projectPath, requestPath);

      try {
        if (!fullPath.startsWith(projectPath)) {
          res.statusCode = 403;
          res.end("Access denied");
          return;
        }

        if (fs.statSync(fullPath).isDirectory()) {
          const items = fs
            .readdirSync(fullPath)
            .filter((name) => !name.startsWith(".")) // Hide hidden files
            .map((name) => {
              const itemPath = path.join(fullPath, name);
              const stats = fs.statSync(itemPath);
              return {
                name,
                type: stats.isDirectory() ? "directory" : "file",
                path: path.join(requestPath, name).replace(/\\/g, "/"),
                size: stats.size,
                modified: stats.mtime,
              };
            })
            .sort((a, b) => {
              // Directories first, then files
              if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
              return a.name.localeCompare(b.name);
            });

          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(items));
        } else {
          res.statusCode = 400;
          res.end("Not a directory");
        }
      } catch (err: any) {
        res.statusCode = 404;
        res.end("Path not found");
      }
      return;
    }
    next();
  });

  // Read file content
  middlewares.use("/api/file", (req: Request, res: Response, next: NextFunction) => {
    if (req.method === "GET") {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const filePath = url.searchParams.get("path");
      if (!filePath) {
        res.statusCode = 400;
        res.end("No path specified");
        return;
      }

      const fullPath = path.join(projectPath, filePath);

      if (!fullPath.startsWith(projectPath)) {
        res.statusCode = 403;
        res.end("Access denied");
        return;
      }

      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        const stats = fs.statSync(fullPath);

        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            content,
            path: filePath,
            modified: stats.mtime,
            size: stats.size,
          }),
        );
      } catch (err: any) {
        res.statusCode = 404;
        res.end("File not found");
      }
      return;
    }

    // Save file
    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk: string) => (body += chunk));
      req.on("end", () => {
        try {
          const { path: filePath, content }: { path: string, content: string } = JSON.parse(body);
          const fullPath = path.join(projectPath, filePath);

          if (!fullPath.startsWith(projectPath)) {
            res.statusCode = 403;
            res.end("Access denied");
            return;
          }

          // Create directory if needed
          const dir = path.dirname(fullPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(fullPath, content, "utf-8");

          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: true,
              path: filePath,
              size: Buffer.byteLength(content, "utf-8"),
            }),
          );
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    next();
  });

  // Create new file/folder
  middlewares.use("/api/create", (req: Request, res: Response, next: NextFunction) => {
    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk: string) => (body += chunk));
      req.on("end", () => {
        try {
          const { path: itemPath, type, template }: { path: string, type: string, template?: string } = JSON.parse(body);
          const fullPath = path.join(projectPath, itemPath);

          if (!fullPath.startsWith(projectPath)) {
            res.statusCode = 403;
            res.end("Access denied");
            return;
          }

          if (fs.existsSync(fullPath)) {
            res.statusCode = 409;
            res.end("Already exists");
            return;
          }

          if (type === "directory") {
            fs.mkdirSync(fullPath, { recursive: true });
          } else {
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }

            // Use template if provided
            const content = template || "";
            fs.writeFileSync(fullPath, content, "utf-8");
          }

          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ success: true, path: itemPath }));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
    next();
  });

  // Delete file/folder
  middlewares.use("/api/delete", (req: Request, res: Response, next: NextFunction) => {
    if (req.method === "DELETE") {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const itemPath = url.searchParams.get("path");
      if (!itemPath) {
        res.statusCode = 400;
        res.end("No path specified");
        return;
      }

      const fullPath = path.join(projectPath, itemPath);

      if (!fullPath.startsWith(projectPath)) {
        res.statusCode = 403;
        res.end("Access denied");
        return;
      }

      try {
        if (fs.statSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true }));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }
    next();
  });

  // Rename/move file
  middlewares.use("/api/rename", (req: Request, res: Response, next: NextFunction) => {
    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk: string) => (body += chunk));
      req.on("end", () => {
        try {
          const { oldPath, newPath }: { oldPath: string, newPath: string } = JSON.parse(body);
          const fullOldPath = path.join(projectPath, oldPath);
          const fullNewPath = path.join(projectPath, newPath);

          if (
            !fullOldPath.startsWith(projectPath) ||
            !fullNewPath.startsWith(projectPath)
          ) {
            res.statusCode = 403;
            res.end("Access denied");
            return;
          }

          // Create target directory if needed
          const newDir = path.dirname(fullNewPath);
          if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
          }

          fs.renameSync(fullOldPath, fullNewPath);

          res.setHeader("Content-Type", "application/json");
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
}