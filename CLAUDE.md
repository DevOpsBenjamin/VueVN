# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VueVN is a visual novel engine built with Vue 3, TypeScript, and Vite. It consists of two main parts:
- **Engine**: The runtime that executes visual novel games
- **Editor**: A development environment with Monaco editor for creating and editing visual novels

## Key Architecture

### Project System
- Individual visual novels are stored as separate projects in `projects/`
- Each project has its own `config.json`, events, locations, NPCs, and assets
- The `VUEVN_PROJECT` environment variable determines which project is active
- Projects are isolated but share the same engine runtime

### Code Generation
- The build system generates TypeScript files from project data using `scripts/generate.cts`
- Generated files are placed in `src/generate/` and provide type-safe access to project resources
- Generation happens automatically during development and before builds

### Engine Architecture
- **Engine Core** (`src/engine/runtime/Engine.ts`): Main game loop and state management
- **Engine API** (`src/engine/runtime/EngineAPI.ts`): API for visual novel events (showText, showChoices, etc.)
- **Engine Events** (`src/engine/runtime/EngineEvents.ts`): Event system and execution logic
- **Engine State**: Reactive state management using Pinia stores

### Editor Architecture
- **ProjectEditor.vue**: Main editor interface with file explorer, Monaco editor, and live preview
- **Components**: Specialized UI components for project management and state inspection
- **Monaco Integration**: Custom TypeScript language service for project-specific types

## Development Commands

### Core Development
```bash
# Install dependencies
npm install

# Create a new project
npm run add-project <project-name>

# Start development server for a project
npm run dev <project-name>

# Build a project for production
npm run build <project-name>
```

### Project Structure
- **Development**: Uses `scripts/dev.cts` which runs generation and Vite concurrently
- **Build**: Uses `scripts/build.cts` which generates files, builds with Vite, and copies assets
- **Generation**: Automatically creates TypeScript interfaces and imports from project data

## Important Files

### Configuration
- `vite.config.js`: Configures project-specific asset serving and aliases
- `tsconfig.json`: TypeScript configuration with path mapping for `@/*` imports
- `projects/[name]/config.json`: Per-project configuration and settings

### Scripts
- `scripts/generate.cts`: Generates TypeScript files from project data
- `scripts/copy-assets.cts`: Handles asset copying during build
- `scripts/add-project.cts`: Creates new project scaffolding

### Runtime Requirements
- Node.js >= 22.0.0
- Projects must have a valid `config.json` with `name`, `settings.defaultLocation`, and `settings.gameTitle`
- Events are TypeScript modules that export default functions with specific signatures

## Project-Specific Development

When working with a specific project:
1. Ensure the project exists in `projects/[name]/`
2. Use the project name as an argument to dev/build commands
3. Generated files in `src/generate/` will be specific to the active project
4. Assets are served from `projects/[name]/assets/` during development

## TypeScript Integration

The project uses extensive code generation to provide type safety:
- Event types are generated from project structure
- Location and NPC types are auto-generated
- The Monaco editor provides IntelliSense for project-specific APIs

## Engine API

Visual novel events use these key APIs:
- `engine.setBackground(imagePath)`: Set background image
- `engine.setForeground(imagePath)`: Set foreground image  
- `await engine.showText(text, from)`: Display dialogue
- `await engine.showChoices(choices)`: Show choice menu
- `engine.saveGame(slot, name)`: Save game state
- `await engine.loadGame(slot)`: Load game state

## Testing and Quality

The project uses:
- TypeScript strict mode for type safety
- Generated types ensure runtime/compile-time consistency
- Hot reloading during development via Vite
- Asset validation through the generation system