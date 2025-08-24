# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VueVN is a visual novel engine built with Vue 3, TypeScript, and Vite that provides a natural TypeScript development experience with perfect save/load and history functionality like Ren'Py.

**Current Status:** ✅ **Dual-Phase Engine Implemented** - The engine architecture redesign has been implemented with dual-phase execution, history navigation, and TypeScript event development. Some TypeScript errors remain in UI components but core engine functionality is working.

## Essential Development Commands

```bash
# Install dependencies
npm install

# Create a new project
npm run add-project <project-name>

# Update project template (copies latest engine files to projects)
npm run update-template

# Start development server for a project (with hot-reload and file watching)
npm run dev <project-name>

# Build a project for production
npm run build <project-name>

# Type checking (may fail but builds still work)
npm run check
```

## Key Architecture

### Project System
- Individual visual novels stored in `projects/` directory
- Each project has `config.json`, events, assets, components, stores, types
- `VUEVN_PROJECT` environment variable determines active project
- Projects are isolated but share the same engine runtime
- Project structure: `events/`, `assets/`, `components/`, `stores/`, `types/`, `locations/`, `npcs/`

### Dual-Phase Engine Architecture
- **Simulation Phase**: Events execute to generate action sequences
- **Playback Phase**: Actions replay with user interaction
- **Manager-Based**: Engine delegates to specialized managers:
  - `HistoryManager`: Save/load and text-by-text navigation
  - `ActionExecutor`: Action playback and state management  
  - `EventManager`: Event execution and jumping
  - `NavigationManager`: Menu and UI state management
  - `InputManager`: User input handling
  - `SimulateRunner`: Event simulation orchestration
- **Natural Development**: Standard async/await TypeScript code for events

### Code Generation System
- Build system generates TypeScript files from project data using `scripts/generate.cts`
- Generated files in `src/generate/` provide type-safe access to project resources
- Automatic generation during development with file watching
- Individual generators: `generate-types-index.cts`, `generate-events-index.cts`, `generate-components-index.cts`, `generate-engine-index.cts`
- Generates: runtime exports, type definitions, event registrations, component registrations

## 🚨 Critical Import Rules

**MANDATORY**: All engine files MUST use generated imports for extensibility:

```typescript
// ✅ CORRECT - Allows user customization
import { Engine } from '@/generate/runtime';
import type { EngineState } from '@/generate/types';

// ❌ WRONG - Prevents user customization  
import Engine from './Engine';
```

This preserves plugin capability - users can override any engine component through generated imports.

## Architecture Requirements

- **File Size Limit**: Keep files under 200-300 lines
- **Separation of Concerns**: Use focused, single-responsibility managers
- **Manager Pattern**: Engine.ts orchestrates, doesn't implement functionality
- **Type Safety**: All stores implement generated TypeScript interfaces

## 📋 Comprehensive Documentation

**For detailed development procedures, architectural decisions, and current project status, see:**
- `Claude/CLAUDE.md` - Complete development guide
- `Claude/DEVELOPMENT_WORKFLOW.md` - Development procedures and commit strategies
- `Claude/PROJECT_REPORT.md` - Comprehensive codebase analysis

## Development Workflow

### Testing Strategy
No formal test suite - testing done via `sample` project with test events:
- `projects/sample/events/start/intro.ts`: Basic narrative flow
- `projects/sample/events/bedroom/morning/after-intro.ts`: Text and background testing
- `projects/sample/events/bedroom/choice-event.ts`: Choice navigation testing  
- `projects/sample/events/bedroom/timing-event.ts`: Minigame and custom logic testing

### Build System Architecture
- `scripts/dev.cts`: Development server with hot-reload and file watching
- `scripts/build.cts`: Production builds with Vite single-file plugin
- `scripts/generate.cts`: Master code generation orchestrator
- `scripts/copy-assets.cts`: Asset handling during builds
- All scripts require `VUEVN_PROJECT` environment variable

### Current Status
**Build Status:** ✅ Production builds succeed (120.89 kB output)  
**Type Status:** ⚠️ TypeScript errors in UI components (build still works)

**Known Issues:**
- TypeScript errors in SaveLoadMenu.vue, Game.vue, and other UI components
- Engine core functionality works despite UI type errors
- `npm run check` fails but `npm run build` succeeds

## Runtime Requirements

- Node.js >= 22.0.0
- Valid `config.json` in each project
- `VUEVN_PROJECT` environment variable must be set for all operations