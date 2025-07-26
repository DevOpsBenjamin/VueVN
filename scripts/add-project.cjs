#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get project name from command line
const projectName = process.argv[2];

if (!projectName) {
  console.error('❌ Error: Please provide a project name');
  console.error('Usage: npm run add-project <project-name>');
  process.exit(1);
}

// Validate project name
if (!/^[a-zA-Z0-9-_]+$/.test(projectName)) {
  console.error(
    '❌ Error: Project name should only contain letters, numbers, hyphens and underscores'
  );
  process.exit(1);
}

const projectPath = path.join(__dirname, '..', 'projects', projectName);

// Check if project already exists
if (fs.existsSync(projectPath)) {
  console.error(`❌ Error: Project "${projectName}" already exists`);
  process.exit(1);
}

// Create project structure
console.log(`🚀 Creating project "${projectName}"...`);

// Create directories
const dirs = [
  projectPath,
  path.join(projectPath, 'plugins'),
  path.join(projectPath, 'plugins', 'stores'),
  path.join(projectPath, 'events'),
  path.join(projectPath, 'events', 'start'),
  path.join(projectPath, 'assets'),
  path.join(projectPath, 'assets', 'images'),
  path.join(projectPath, 'assets', 'sounds'),
];

dirs.forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`📁 Created: ${path.relative(process.cwd(), dir)}`);
});

// Create default files

// 1. Project configuration
const configContent = {
  name: projectName,
  version: '1.0.0',
  description: `A VueVN visual novel project`,
  author: '',
  settings: {
    defaultLocation: 'start',
    gameTitle: projectName,
  },
};

fs.writeFileSync(
  path.join(projectPath, 'config.json'),
  JSON.stringify(configContent, null, 2)
);
console.log(`📄 Created: projects/${projectName}/config.json`);

// 2. Custom game state
const gameStateContent = `import { defineStore } from 'pinia';

import { baseGameState } from '@/generate/engine';
const { BASE_GAME_STATE, createNPC } = baseGameState;

const useGameState = defineStore('gameState', {
  state: () => ({
    // 🚨 PROTECTED - Required by engine, do not remove/rename
    ...BASE_GAME_STATE,

    //Sample NPC DEFINITION
    npc_1: createNPC({
      name: 'NPC',
      relation: 0,
      trust: 0,
    }),

    // ✅ SAFE TO MODIFY - Your custom fields below
    myCustomField: '',
    myCustomArray: [],
  }),

  actions: {
    // Your actions
  },
});

export default useGameState;
`;

fs.writeFileSync(
  path.join(projectPath, 'plugins', 'stores', 'gameState.js'),
  gameStateContent
);
console.log(`📄 Created: projects/${projectName}/plugins/stores/gameState.js`);

// 3. Example start event
const startEventContent = `export default {
  id: 'intro',
  name: 'Introduction',
  
  // This event triggers when entering the 'start' location
  conditions: (state) => !state.flags.introSeen,
  
  async execute(engine, state) {
    // Set background
    engine.setBackground('/assets/images/placeholder.jpg');
    
    // Show some text
    await engine.showText('Welcome to ${projectName}!');
    await engine.showText('This is your first event.');
    
    // Show a choice
    const choice = await engine.showChoices([
      { text: "Start the adventure", id: "start" },
      { text: "Learn more", id: "learn" }
    ]);
    
    if (choice === 'learn') {
      await engine.showText('VueVN is a visual novel engine built with Vue 3.');
      await engine.showText('You can create your own stories by adding events and assets.');
    }
    
    // Mark intro as seen
    state.flags.introSeen = true;
    
    // Change location (this will trigger new events)
    state.location = 'chapter1';
  }
};
`;

fs.writeFileSync(
  path.join(projectPath, 'events', 'start', 'intro.js'),
  startEventContent
);
console.log(`📄 Created: projects/${projectName}/events/start/intro.js`);

// 4. README for the project
const readmeContent = `# ${projectName}

A visual novel created with VueVN.

## Project Structure

- \`plugins/\` - Custom components and stores that override the engine defaults
- \`events/\` - Game events organized by location
- \`assets/\` - Images, sounds, and other media files
- \`config.json\` - Project configuration

## Development

\`\`\`bash
# Start development server
npm run dev ${projectName}

# Build for production
npm run build ${projectName}
\`\`\`

## Adding Events

Create new events in \`events/[location]/[event-name].js\`:

\`\`\`javascript
export default {
  id: 'unique_id',
  name: 'Event Name',
  conditions: (state) => true, // When this event should trigger
  async execute(engine, state) {
    // Your event logic here
  }
};
\`\`\`

## Customizing Components

Override any core component by creating a file with the same path in \`plugins/\`:

Example: To customize the main menu, create \`plugins/menu/MainMenu.vue\`.
`;

fs.writeFileSync(path.join(projectPath, 'README.md'), readmeContent);
console.log(`📄 Created: projects/${projectName}/README.md`);

// 5. .gitkeep files for empty directories
fs.writeFileSync(path.join(projectPath, 'assets', 'images', '.gitkeep'), '');
fs.writeFileSync(path.join(projectPath, 'assets', 'sounds', '.gitkeep'), '');

console.log(`\n✅ Project "${projectName}" created successfully!`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Run "npm run dev ${projectName}" to start development`);
console.log(`   2. Edit events in projects/${projectName}/events/`);
console.log(`   3. Add assets to projects/${projectName}/assets/`);
console.log(`   4. Customize components in projects/${projectName}/plugins/`);
