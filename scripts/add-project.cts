#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Get project name from command line
const projectName: string | undefined = process.argv[2];

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

const projectPath: string = path.join(__dirname, '..', 'projects', projectName);

// Check if project already exists
if (fs.existsSync(projectPath)) {
  console.error(`❌ Error: Project "${projectName}" already exists`);
  process.exit(1);
}

// Create project structure
console.log(`🚀 Creating project "${projectName}"...`);

// Create directories
const dirs: string[] = [
  projectPath,
  path.join(projectPath, 'events'),
  path.join(projectPath, 'events', 'start'),
  path.join(projectPath, 'events', 'bedroom'),
  path.join(projectPath, 'assets'),
  path.join(projectPath, 'assets', 'images'),
  path.join(projectPath, 'assets', 'sounds'),
  path.join(projectPath, 'stores'),
  path.join(projectPath, 'npcs'),
  path.join(projectPath, 'locations'),
];

dirs.forEach((dir: string) => {
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

// 2. Example start event
const startEventContent: string = `export default {
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
    state.location = 'bedroom';
  }
};
`;

fs.writeFileSync(
  path.join(projectPath, 'events', 'start', 'intro.js'),
  startEventContent
);
console.log(`📄 Created: projects/${projectName}/events/start/intro.js`);

// 3. Example bedroom event
const bedroomEventContent: string = `export default {
  id: 'wake_up',
  name: 'Wake Up',

  conditions: (state) => state.location === 'bedroom' && !state.flags.wokeUp,

  async execute(engine, state) {
    await engine.showText('You wake up in your bedroom.');
    state.flags.wokeUp = true;
  },
};
`;

fs.writeFileSync(
  path.join(projectPath, 'events', 'bedroom', 'wake-up.js'),
  bedroomEventContent
);
console.log(`📄 Created: projects/${projectName}/events/bedroom/wake-up.js`);

// 4. Sample NPC
const sampleNPCContent: string = `import { baseGameState } from '@/generate/stores';
const { createNPC } = baseGameState;

const npc_1 = createNPC({
  name: 'NPC 1',
  relation: 0,
  trust: 0,
  // LONG as heck definition continues here...
});

export default npc_1;
`;

fs.writeFileSync(path.join(projectPath, 'npcs', 'npc_1.js'), sampleNPCContent);
console.log(`📄 Created: projects/${projectName}/npcs/npc_1.js`);

// 5. Base game state with sample NPC
const gameStateContent: string = `import { defineStore } from 'pinia';

import { baseGameState } from '@/generate/stores';
import { npc_1 } from '@/generate/npcs';
const { BASE_GAME_STATE } = baseGameState;

const useGameState = defineStore('gameState', {
  state: () => ({
    // 🚨 PROTECTED - Required by engine, do not remove/rename
    ...BASE_GAME_STATE,

    //Sample EXTERNAL NPC
    npc_1,

    // ✅ SAFE TO MODIFY - Your custom fields below
    myCustomField: '',
    myCustomArray: [],
  }),

  actions: {
    resetGame() {
      // Reset all base fields
      Object.assign(this, {
        ...BASE_GAME_STATE,
        npc_1,
        myCustomField: '',
        myCustomArray: [],
      });
    },
    // Your other actions
  },
});

export default useGameState;
`;

fs.writeFileSync(
  path.join(projectPath, 'stores', 'gameState.js'),
  gameStateContent
);
console.log(`📄 Created: projects/${projectName}/stores/gameState.js`);

// 5. README for the project
const readmeContent: string = `# ${projectName}

A visual novel created with VueVN.

## Project Structure

- 
- 
- 
- 

This sample includes an intro event in 
 a follow-up event
 and a sample NPC defined in 

## Development



## Adding Events

Create new events in 


## Customizing the Engine

Override any core component by creating a file in your project with the same path as in the engine.

Example: To customize the main menu, create 
`;

fs.writeFileSync(
  path.join(projectPath, 'README.md'),
  readmeContent
);
console.log(`📄 Created: projects/${projectName}/README.md`);

// 5. .gitkeep files for empty directories
fs.writeFileSync(path.join(projectPath, 'assets', 'images', '.gitkeep'), '');
fs.writeFileSync(path.join(projectPath, 'assets', 'sounds', '.gitkeep'), '');

console.log(`
✅ Project "${projectName}" created successfully!`);
console.log(`
📝 Next steps:`);
console.log(`   1. Run 