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

# Start development server for a project (with hot-reload and file watching)
npm run dev <project-name>

# Build a project for production
npm run build <project-name>

# Type checking
npm run check
```

## Key Architecture

### Project System
- Individual visual novels stored in `projects/` directory
- Each project has `config.json`, events, assets, and components
- `VUEVN_PROJECT` environment variable determines active project
- Projects are isolated but share the same engine runtime

### Dual-Phase Engine
- **Simulation Phase**: Events execute to generate action sequences
- **Playback Phase**: Actions replay with user interaction
- **Manager-Based**: Engine delegates to specialized managers (HistoryManager, ActionExecutor, etc.)
- **Natural Development**: Standard async/await TypeScript code for events

### Code Generation System
- Build system generates TypeScript files from project data using `scripts/generate.cts`
- Generated files in `src/generate/` provide type-safe access to project resources
- Automatic generation during development with file watching

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

## Testing and Current Issues

**Build Status:** ✅ Production builds succeed (120.89 kB output)  
**Type Status:** ⚠️ TypeScript errors in UI components (build still works)

No formal test suite - testing done via `sample` project with test events:
- `after-intro.ts`: Basic text and background testing
- `choice-event.ts`: Choice navigation testing  
- `timing-event.ts`: Minigame and custom logic testing
- `intro.ts`: Basic narrative flow

**Known Issues:**
- TypeScript errors in SaveLoadMenu.vue, Game.vue, and other UI components
- Engine core functionality works despite UI type errors
- `npm run check` fails but `npm run build` succeeds

## Runtime Requirements

- Node.js >= 22.0.0
- Valid `config.json` in each project
- `VUEVN_PROJECT` environment variable must be set for all operations