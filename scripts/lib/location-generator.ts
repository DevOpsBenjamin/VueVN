import fs from 'fs';
import path from 'path';

const verbose: boolean = process.env.VUEVN_VERBOSE! == 'true';
// Generic function to generate resource files (actions, events, etc.) for locations or global
export async function generateResourceFile(
  projectName: string,
  projectPath: string,
  locationName: string,
  locationGeneratePath: string,
  resourceType: string,
  emoji: string,
  typeName: string,
  isGlobal: boolean = false
) {
  const resourcePath = path.join(
    projectPath,
    isGlobal ? 'global' : 'locations',
    isGlobal ? resourceType : `${locationName}/${resourceType}`
  );

  let resourceRelPaths: string[] = [];
  let imports = '';
  let resourceListItems = '';

  // Helper: recursively collect .ts files relative to resourcePath
  function walk(dir: string, base: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const results: string[] = [];
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...walk(full, base));
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        const rel = path.relative(base, full).replace(/\\/g, '/');
        results.push(rel.replace(/\.ts$/, ''));
      }
    }
    return results;
  }

  // Check if resource folder exists and get resource files
  if (fs.existsSync(resourcePath)) {
    resourceRelPaths = walk(resourcePath, resourcePath);

    if (resourceRelPaths.length > 0) {
      // Check for invalid filenames with dashes
      const invalidFiles = resourceRelPaths.filter((rel) => path.basename(rel).includes('-'));
      if (invalidFiles.length > 0) {
        const locationPath = isGlobal ? 'global' : locationName;
        console.error(
          `❌ Error: Invalid filenames with dashes found in ${locationPath}/${resourceType}:`
        );
        invalidFiles.forEach((rel) => console.error(`  - ${rel}.ts`));
        console.error(
          'Please rename files to use underscores instead of dashes for valid TypeScript identifiers.'
        );
        process.exit(1);
      }

      const locationPath = isGlobal ? 'global' : locationName;
      if (verbose) {
        console.log(
          `${emoji} Found ${
            resourceRelPaths.length
          } ${resourceType} in ${locationPath}: ${resourceRelPaths.join(', ')}`
        );
      }

      // Generate imports with @project alias
      const importPath = isGlobal
        ? `@project/global/${resourceType}`
        : `@project/locations/${locationName}/${resourceType}`;

      // Build unique import identifiers and map entries
      const usedNames = new Set<string>();
      const items: string[] = [];
      const pathItems: string[] = [];
      const importLines: string[] = [];

      for (const rel of resourceRelPaths) {
        const baseName = path.basename(rel);
        // propose identifier
        let ident = baseName.replace(/[^a-zA-Z0-9_]/g, '_');
        if (/^[0-9]/.test(ident)) ident = '_' + ident;
        if (usedNames.has(ident)) {
          // disambiguate with rel path
          const alt = rel.replace(/[^a-zA-Z0-9_]/g, '_');
          ident = /^[0-9]/.test(alt) ? '_' + alt : alt;
        }
        usedNames.add(ident);
        importLines.push(`import ${ident} from '${importPath}/${rel}';`);
        // Use identifier as key to guarantee uniqueness across nested files
        items.push(`  "${ident}": ${ident}`);
        pathItems.push(`  "${ident}": "${rel}"`);
      }

      imports = importLines.join('\n');
      resourceListItems = items.join(',\n');
      // Stash path mapping for later footer generation
      if (resourceType === 'events') {
        (global as any).__GEN_EVENTS_PATH_ITEMS__ = pathItems;
      } else if (resourceType === 'actions') {
        (global as any).__GEN_ACTIONS_PATH_ITEMS__ = pathItems;
      }
    } else {
      const locationPath = isGlobal ? 'global' : locationName;
      if (verbose) {
        console.log(
          `📝 No ${resourceType} files found in ${locationPath}/${resourceType} - creating empty ${resourceType}`
        );
      }
    }
  } else {
    const locationPath = isGlobal ? 'global' : locationName;
    if (verbose) {
      console.log(
        `📝 No ${resourceType} folder found for ${locationPath} - creating empty ${resourceType}`
      );
    }
  }

  const locationDisplayName = isGlobal
    ? 'global location'
    : `location: ${locationName}`;
  // Optional paths footer
  let extraFooter = '';
  if (resourceType === 'events') {
    const items: string[] | undefined = (global as any).__GEN_EVENTS_PATH_ITEMS__;
    if (items && items.length > 0) {
      extraFooter += `\n\nexport const eventsPaths: Record<string, string> = {\n${items.join(',\n')}\n};\n`;
    }
  } else if (resourceType === 'actions') {
    const items: string[] | undefined = (global as any).__GEN_ACTIONS_PATH_ITEMS__;
    if (items && items.length > 0) {
      extraFooter += `\n\nexport const actionsPaths: Record<string, string> = {\n${items.join(',\n')}\n};\n`;
    }
  }

  const resourceFileContent = `// Generated ${resourceType} for ${locationDisplayName}
import type { ${typeName} } from '@generate/types';
${imports ? '\n' + imports + '\n' : ''}
export const ${resourceType}List: Record<string, ${typeName}> = {${
    resourceListItems ? '\n' + resourceListItems + '\n' : ''
  }};

export default ${resourceType}List;
${extraFooter}
`;

  const resourceFilePath = path.join(
    locationGeneratePath,
    `${resourceType}.ts`
  );
  fs.writeFileSync(resourceFilePath, resourceFileContent);
}

// Function to generate actions.ts file for a location or global
export async function generateActionsFile(
  projectName: string,
  projectPath: string,
  locationName: string,
  locationGeneratePath: string,
  isGlobal: boolean = false
) {
  return generateResourceFile(
    projectName,
    projectPath,
    locationName,
    locationGeneratePath,
    'actions',
    '🎯',
    'VNAction',
    isGlobal
  );
}

// Function to generate events.ts file for a location or global
export async function generateEventsFile(
  projectName: string,
  projectPath: string,
  locationName: string,
  locationGeneratePath: string,
  isGlobal: boolean = false
) {
  return generateResourceFile(
    projectName,
    projectPath,
    locationName,
    locationGeneratePath,
    'events',
    '🎭',
    'VNEvent',
    isGlobal
  );
}

// Function to generate index.ts file for a location
export async function generateLocationIndex(
  projectName: string,
  projectPath: string,
  locationName: string,
  locationGeneratePath: string
) {
  const infoPath = path.join(projectPath, 'locations', locationName, 'info.ts');

  // Check if info.ts exists
  if (!fs.existsSync(infoPath)) {
    console.error(
      `❌ Error: Missing info.ts file for location: ${locationName}`
    );
    console.error(`Expected path: ${infoPath}`);
    console.error(
      'Each location must have an info.ts file defining its metadata.'
    );
    process.exit(1);
  }

  const locationIndexContent = `// Generated index for location: ${locationName}
import type { LocationData } from '@generate/types';
import info from '@project/locations/${locationName}/info';
import { actionsList, actionsPaths } from './actions';
import { eventsList, eventsPaths } from './events';

const ${locationName}: LocationData = {
  id: "${locationName}",
  info,
  actions: actionsList,
  actionsPaths: actionsPaths,
  events: eventsList,
  eventsPaths: eventsPaths,
  accessibles: {}
};

export default ${locationName};
`;

  const locationIndexPath = path.join(locationGeneratePath, 'index.ts');
  fs.writeFileSync(locationIndexPath, locationIndexContent);
}

// Function to generate index.ts file for global
export async function generateGlobalIndex(
  projectName: string,
  projectPath: string,
  locationGeneratePath: string
) {
  const globalIndexContent = `// Generated index for global location
import type { LocationData } from '@generate/types';
import { actionsList, actionsPaths } from './actions';
import { eventsList, eventsPaths } from './events';

const global: LocationData = {
  id: "global",
  actions: actionsList,
  actionsPaths: actionsPaths,
  events: eventsList,
  eventsPaths: eventsPaths,
  accessibles: {}
};

export default global;
`;

  const globalIndexPath = path.join(locationGeneratePath, 'index.ts');
  fs.writeFileSync(globalIndexPath, globalIndexContent);
}
