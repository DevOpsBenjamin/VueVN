import fs from 'fs';
import path from 'path';

const verbose: boolean = process.env.VUEVN_VERBOSE! == 'true';

// Normalize path separators to always use forward slashes for imports
function normalizeImportPath(pathString: string): string {
  return pathString.replace(/\\/g, '/');
}

export interface GeneratorConfig {
  resourceType: string; // e.g., 'types', 'components', 'stores', 'enums', 'engine'
  emoji: string; // e.g., '🔧', '🎯', '🏪'
  fileExtension: string; // e.g., '.ts', '.vue'
  exportType: 'named' | 'type'; // 'named' for regular exports, 'type' for type exports
}

// Function to recursively get all files with specified extension in a directory
function getAllFiles(
  dir: string,
  fileExtension: string,
  basePath: string = ''
): string[] {
  if (!fs.existsSync(dir)) return [];

  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = basePath
      ? path.join(basePath, entry.name)
      : entry.name;

    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, fileExtension, relativePath));
    } else if (entry.isFile()) {
      if (entry.name.endsWith(fileExtension)) {
        const nameWithoutExt = normalizeImportPath(relativePath).replace(
          new RegExp(`\\${fileExtension}$`),
          ''
        );
        files.push(nameWithoutExt);
      } else {
        if (verbose) {
          console.warn(
            `⚠️  Warning: Invalid file found in ${dir}: ${relativePath} - skipping`
          );
        }
      }
    }
  }

  return files;
}

export async function generateDifferentialExports(
  config: GeneratorConfig
): Promise<void> {
  const projectName: string = process.env.VUEVN_PROJECT!;

  const projectPath = path.join(process.cwd(), 'projects', projectName);
  const engineResourcePath = path.join(
    process.cwd(),
    'engine_src',
    config.resourceType
  );
  const projectResourcePath = path.join(
    projectPath,
    'plugins',
    config.resourceType
  );
  const generatePath = path.join(process.cwd(), 'generate');

  if (verbose) {
    console.log(
      `🏗️  Generating ${config.resourceType} for project: ${projectName}`
    );
  }

  try {
    // Create generate directory if it doesn't exist
    if (!fs.existsSync(generatePath)) {
      fs.mkdirSync(generatePath, { recursive: true });
      console.log('📁 Created generate directory');
    }

    // Get all engine resources
    const engineResources = getAllFiles(
      engineResourcePath,
      config.fileExtension
    );

    if (verbose) {
      console.log(
        `🔧 Found ${engineResources.length} engine ${
          config.resourceType
        }: ${engineResources.join(', ')}`
      );
    }

    // Get all project resources
    const projectResources = getAllFiles(
      projectResourcePath,
      config.fileExtension
    );
    if (verbose) {
      if (projectResources.length > 0) {
        console.log(
          `🎯 Found ${projectResources.length} project ${
            config.resourceType
          }: ${projectResources.join(', ')}`
        );
      } else {
        console.log(
          `📝 No project ${config.resourceType} found - using engine ${config.resourceType} only`
        );
      }
    }

    // Create differential resource map (project resources override engine resources)
    const allResources = new Set([...engineResources, ...projectResources]);
    const resourceSourceMap = new Map<string, 'engine' | 'project'>();

    // First add engine resources
    for (const resource of engineResources) {
      resourceSourceMap.set(resource, 'engine');
    }

    // Then project resources (overriding engine ones if they exist)
    for (const resource of projectResources) {
      if (verbose) {
        if (resourceSourceMap.has(resource)) {
          console.log(
            `🔄 Project overrides engine ${config.resourceType.slice(
              0,
              -1
            )}: ${resource}`
          );
        } else {
          console.log(
            `➕ Project adds new ${config.resourceType.slice(
              0,
              -1
            )}: ${resource}`
          );
        }
      }
      resourceSourceMap.set(resource, 'project');
    }

    // Generate content based on export type
    let fileContent: string;

    if (config.exportType === 'type') {
      // Generate type exports
      const imports = Array.from(allResources)
        .sort()
        .map((resourceName) => {
          const source = resourceSourceMap.get(resourceName);
          const importPath =
            source === 'project'
              ? `@project/plugins/${config.resourceType}/${resourceName}`
              : `@engine/${config.resourceType}/${resourceName}`;

          const resourceBaseName = path.basename(resourceName);
          return `export type { ${resourceBaseName} } from '${importPath}';`;
        })
        .join('\n');

      fileContent = `// Generated ${
        config.resourceType
      } index - differential ${config.resourceType.slice(0, -1)} system
// Engine ${config.resourceType} with project overrides and additions

${imports}
`;
    } else {
      // Generate named exports
      const imports = Array.from(allResources)
        .sort()
        .map((resourceName) => {
          const source = resourceSourceMap.get(resourceName);
          // Only add extension for non-.ts files (like .vue)
          const extension =
            config.fileExtension === '.ts' ? '' : config.fileExtension;
          const importPath =
            source === 'project'
              ? `@project/plugins/${config.resourceType}/${resourceName}${extension}`
              : `@engine/${config.resourceType}/${resourceName}${extension}`;

          const resourceBaseName = path.basename(resourceName);
          return `import ${resourceBaseName} from '${importPath}';`;
        })
        .join('\n');

      const exports = Array.from(allResources)
        .sort()
        .map((resourceName) => {
          const resourceBaseName = path.basename(resourceName);
          return `  ${resourceBaseName}`;
        })
        .join(',\n');

      fileContent = `// Generated ${
        config.resourceType
      } index - differential ${config.resourceType.slice(0, -1)} system
// Engine ${config.resourceType} with project overrides and additions

${imports}

export {
${exports}
};
`;
    }

    const outputFilePath = path.join(generatePath, `${config.resourceType}.ts`);
    fs.writeFileSync(outputFilePath, fileContent);

    if (verbose) {
      console.log(`📄 Created generate/${config.resourceType}.ts`);
      console.log(
        `✅ ${
          config.resourceType.charAt(0).toUpperCase() +
          config.resourceType.slice(1)
        } generation complete`
      );
    }
  } catch (error: any) {
    console.error(
      `❌ ${
        config.resourceType.charAt(0).toUpperCase() +
        config.resourceType.slice(1)
      } generation failed:`,
      error.message
    );
    process.exit(1);
  }
}
