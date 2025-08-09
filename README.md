# VueVN - Visual Novel Engine

A modern visual novel engine built with Vue 3, Vite, and Monaco Editor, featuring a powerful editor and runtime engine with per-project isolation.

## Features

- 🎭 Visual Novel runtime engine
- ✍️ Built-in editor with Monaco Editor (development only)
- 🎨 Tailwind CSS for styling
- 🚀 Fast development with Vite
- 📦 Component-based architecture
- 🏗️ Project-based workflow with complete isolation
- 🔌 Plugin system for customization per project

## Tech Stack

- **Frontend Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Code Editor**: Monaco Editor (dev only)
- **Styling**: Tailwind CSS v3
- **Utilities**: lodash

## Project Structure

```
src/
├── editor/               # Editor components (dev only)
│   ├── components/       # Reusable editor components
│   ├── docs/            # Documentation
│   └── stores/          # Editor state management
├── engine/
│   └── core/            # Core engine logic (never modify)
├── generate/            # Auto-generated files (project-specific)
├── App.vue              # Root component
└── main.js              # Application entry point

projects/                # All VN projects
└── [project-name]/
    ├── events/          # Game events by location
    │   └── [location]/
    │       └── event.js
    ├── assets/          # Images, sounds, etc.
    ├── stores/          # Custom game state (optional)
    ├── menu/            # Custom menus (optional)
    └── config.json      # Project configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or later recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Creating a New Project

```bash
# Create a new VN project
npm run add-project my-visual-novel
```

This will create the complete project structure in `projects/my-visual-novel/`.

### Development Workflow

```bash
# Start development server for a specific project
npm run dev my-visual-novel

# The editor will be available in development mode
# Hot-reload is enabled for all project files
```

### Building for Production

```bash
# Build project for production (editor excluded)
npm run build my-visual-novel

# Preview the production build
npm run preview
```

The production build will only include the game runtime, making it lightweight and optimized.

## Project Development

### Plugin System

The plugin system allows you to override any core component. Simply create a file in your project with the same path structure as in `engine/core/`.

Priority: `projects/[name] > engine/core/`

Example - Custom game state:

```javascript
// projects/my-game/stores/gameState.js
import { defineStore } from 'pinia';

export default defineStore('gameState', {
  state: () => ({
    player: {
      name: '',
      health: 100,
      inventory: [],
    },
    chapter: 1,
    flags: {},
  }),
});
```

### Events System

Events are organized by location in the `events/` directory:

```javascript
// projects/my-game/events/bedroom/wake-up.js
export default {
  id: 'wake_up',
  name: 'Wake Up Event',
  conditions: (state) => state.chapter === 1 && !state.flags.wokeUp,
  async execute(engine, state) {
    await engine.showText('You slowly open your eyes...');
    state.flags.wokeUp = true;
  },
};
```

## Commands Summary

- `npm install` - Install dependencies
- `npm run add-project [name]` - Create a new VN project
- `npm run dev [project]` - Start development with editor
- `npm run build [project]` - Build for production (game only)
- `npm run preview` - Preview production build

## Best Practices

1. **Never modify files in `engine/core/`** - Use the plugin system instead
2. **Keep assets organized** in your project's `assets/` directory
3. **Test production builds** regularly to ensure everything works without the editor
4. **Document your events** with clear conditions and effects

## License

MIT
