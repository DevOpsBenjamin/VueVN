# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VueVN is a visual novel engine built with Vue 3, TypeScript, and Vite that provides a natural TypeScript development experience with perfect save/load and history functionality like Ren'Py.

**Current Status:** ✅ **Dual-Phase Engine Complete**  
The engine architecture redesign has been successfully implemented:
- ✅ Dual-phase execution (simulation + playback)
- ✅ Text-by-text go back/forward history (50 entries max)
- ✅ Natural TypeScript event development with EngineAPIForEvents
- ✅ Perfect save/load with mid-event support and fast-forward replay
- ✅ Custom logic integration with minigame support
- ✅ All imports using @/generate/runtime for extensibility

## 📋 Development Workflow

### Read This First
**New Claude instances should read `Claude/DEVELOPMENT_WORKFLOW.md`** for detailed development procedures, commit strategies, and testing protocols.

### Key Design Principles
1. **Natural Development**: Developers write normal async/await TypeScript code
2. **Simulation + Playback**: Engine simulates events first, then plays back with user interaction
3. **Perfect History**: Text-by-text go back like Ren'Py (50 entries max)
4. **Custom Logic Support**: Mini-games and complex code exit event flow via jumps
5. **Jump-Only Boundaries**: All event transitions happen through jumps for simplicity
6. **🚨 CRITICAL: Import Strategy for Extensibility**
   - **ALWAYS** use `@/generate/runtime` imports in engine files
   - **NEVER** use relative imports (`./`, `../`) in engine code
   - This preserves plugin capability - users can customize any engine component through `generate/runtime` without core import conflicts

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

### Engine Architecture (CURRENT IMPLEMENTATION)
- **Engine** (`src/engine/runtime/Engine.ts`): Dual-phase execution with simulation + playback
- **EngineAPIForEvents**: Natural async/await API for event development
- **History System**: Text-by-text navigation with 50-entry limit and state snapshots
- **Save/Load**: Mid-event saves with fast-forward replay capability

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

## 🚨 Critical Architectural Rules

### Import Strategy for Plugin System
**MANDATORY RULE**: All engine files MUST use `@/generate/runtime` imports instead of relative imports.

```typescript
// ✅ CORRECT - Allows user customization
import { Engine, CustomLogicRegistry } from '@/generate/runtime';

// ❌ WRONG - Prevents user customization  
import Engine from './Engine';
import { CustomLogicRegistry } from './CustomLogicRegistry';
```

**Why this matters:**
- Users can override any engine component by customizing `src/generate/runtime.ts`
- Core engine won't import original versions when user provides custom ones
- Enables true plugin/extension capability without import conflicts
- Maintains clean separation between core and user-customizable parts

### Documentation Organization
- **`Claude/`**: All Claude Code documentation and architectural plans
- **`Claude/DEVELOPMENT_WORKFLOW.md`**: Development procedures and commit strategies
- **`Claude/PROJECT_REPORT.md`**: Comprehensive codebase analysis and current state
- **`Claude/CLAUDE.md`**: This overview document for new Claude instances

## 🎯 Current State & Next Steps

### Core Engine Status
- ✅ **Dual-phase execution complete** - Engine now uses simulation + playback
- ✅ **History system working** - Full go back/forward with state restoration
- ✅ **Save/load updated** - Mid-event saves with fast-forward replay
- ✅ **Testing infrastructure** - 3 test events: after-intro, choice-event, timing-event
- ✅ **Minigame integration** - TimingGame.vue component with engine state management
- ✅ **Import architecture** - All using @/generate/runtime for extensibility

### Available for Development
- Monaco editor autocompletion for engine API
- IDE tools for event validation and testing
- Advanced debugging and profiling tools
- Additional minigame types and custom logic
- Project management and deployment tools

## Development Commands

```bash
# Install dependencies
npm install

# Create a new project
npm run add-project <project-name>

# Start development server (with debug delays)
npm run dev <project-name>

# Build a project for production
npm run build <project-name>
```

## Architecture Files (Current Implementation)

### Core Files
- `src/engine/runtime/Engine.ts`: Current engine (with debug delays)
- `src/engine/runtime/EngineAPI.ts`: Current event API
- `scripts/generate.cts`: Build system that generates TypeScript modules
- `projects/sample/`: Test project for development

### Key Concepts
- **Project Isolation**: Each VN is completely separate in `projects/`
- **Code Generation**: TypeScript files generated from project structure
- **Environment Variable**: `VUEVN_PROJECT` controls active project
- **Asset Serving**: Vite serves project-specific assets during development

### Event Development (Current)
Events use the new EngineAPIForEvents interface for natural async/await development:
```typescript
export default {
  id: 'event_id',
  name: 'Event Name',
  async execute(engine: EngineAPIForEvents, gameState: GameState) {
    await engine.showText('Hello world!', 'Narrator');
    await engine.setBackground('/assets/images/background/room.png');
    
    const choice = await engine.showChoices([
      { text: 'Continue', id: 'continue', jump_id: 'next_event' },
      { text: 'Go back', id: 'back', jump_id: 'previous_event' }
    ]);
    
    // Custom logic example
    if (gameState.flags.hasMinigame) {
      const result = await engine.runCustomLogic('timingMinigame', { difficulty: 2 });
      gameState.player.money += result.reward;
    }
    
    await engine.jump('next_event');
  }
}
```

### Sample Project Usage
The `sample` project serves as both:
- Example for developers using VueVN
- Test project for engine development and feature validation

## Runtime Requirements
- Node.js >= 22.0.0
- Valid `config.json` in each project
- TypeScript compilation through Vite build system