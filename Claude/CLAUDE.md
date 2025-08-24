# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VueVN is a visual novel engine built with Vue 3, TypeScript, and Vite that provides a natural TypeScript development experience with perfect save/load and history functionality like Ren'Py.

**Current Status:** ✅ **Dual-Phase Engine Implemented**  
The engine architecture redesign has been implemented with functional core engine:
- ✅ Dual-phase execution (simulation + playback)
- ✅ Text-by-text go back/forward history (50 entries max)
- ✅ Natural TypeScript event development with EngineAPIForEvents
- ✅ Perfect save/load with mid-event support and fast-forward replay
- ✅ Custom logic integration with minigame support
- ✅ All imports using @/generate/runtime for extensibility
- ⚠️ Some TypeScript errors in UI components (build still succeeds)

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
   - **ALWAYS** use `@/generate/types` imports for TypeScript interfaces
   - **NEVER** use relative imports (`./`, `../`) in engine code
   - This preserves plugin capability - users can customize any engine component or type through generated imports without core import conflicts

7. **🚨 CRITICAL: File Size and Separation of Concerns**
   - **NEVER** create files larger than 200-300 lines
   - **ALWAYS** split functionality into focused, single-responsibility classes/managers
   - **PREFER** composition over large monolithic classes
   - When a class has multiple responsibilities, immediately refactor into separate managers
   - Example: Engine.ts should orchestrate managers, not implement all functionality itself
   - **Rule of thumb**: If a file needs more than 5-6 different method categories, split it

## Key Architecture

### Project System
- Individual visual novels are stored as separate projects in `projects/`
- Each project has its own `config.json`, events, locations, NPCs, and assets
- The `VUEVN_PROJECT` environment variable determines which project is active
- Projects are isolated but share the same engine runtime

### Code Generation System
- The build system generates TypeScript files from project data using `scripts/generate.cts`
- Generated files are placed in `src/generate/` and provide type-safe access to project resources
- Generation happens automatically during development and before builds
- **Types Generation**: `generate-types-index.cts` creates `src/generate/types.ts` with TypeScript interfaces
- **Runtime Generation**: Creates component imports, events, stores, and engine modules
- **Project Override Support**: Projects can override any engine type by placing custom versions in `projects/{name}/types/`

### Engine Architecture (CURRENT IMPLEMENTATION)
- **Engine** (`src/engine/runtime/Engine.ts`): Dual-phase execution with simulation + playback, manager-based architecture
- **Manager System**: Separated concerns into focused managers:
  - **HistoryManager**: Text-by-text navigation with 50-entry limit
  - **ActionExecutor**: Executes VNActions with custom logic support  
  - **WaitManager**: Handles user input waiting and navigation interrupts
  - **NavigationManager**: Manages go back/forward with state restoration
  - **EventManager**: Loads and manages VNEvents
  - **InputManager**: Handles keyboard shortcuts and user interaction
- **EngineAPIForEvents**: Natural async/await API for event development (via SimulateRunner)
- **Save/Load**: Mid-event saves with fast-forward replay capability
- **State Management**: Pinia stores with strict TypeScript interfaces for engine and game state

### State Management with Pinia
- **Store Pattern**: Use Options API with typed state functions for type safety
- **Interface Compliance**: All stores must implement their corresponding TypeScript interfaces
- **Type Generation**: Store interfaces are generated from `src/engine/types/` with project override support

```typescript
// Recommended Pinia store pattern
export const useEngineState = defineStore('engineState', {
  state: (): EngineState => ({
    background: null,
    dialogue: null,
    // ... all interface properties required
  }),
  actions: {
    resetState(): void {
      // Actions typed separately from state
    },
  },
});
```

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

# Start development server for a project (with debug delays and file watching)
npm run dev <project-name>

# Build a project for production
npm run build <project-name>
```

### Project Structure & Build System
- **Development**: Uses `scripts/dev.cts` which runs TypeScript generation and Vite concurrently with file watching
- **Build**: Uses `scripts/build.cts` which generates files, builds with Vite, and copies project assets to dist
- **Generation**: `scripts/generate.cts` orchestrates all generation scripts and watches for file changes during development
- **Asset Serving**: Vite serves project-specific assets from `projects/{name}/assets/` at `/assets/` during development

## 🚨 Critical Architectural Rules

### Import Strategy for Plugin System
**MANDATORY RULES**: 
1. All engine files MUST use `@/generate/runtime` imports for components
2. All type definitions MUST use `@/generate/types` imports for interfaces

```typescript
// ✅ CORRECT - Allows user customization
import { Engine, CustomLogicRegistry } from '@/generate/runtime';
import type { EngineState, Dialogue } from '@/generate/types';

// ❌ WRONG - Prevents user customization  
import Engine from './Engine';
import { CustomLogicRegistry } from './CustomLogicRegistry';
import type EngineState from './types/EngineState';
import type Dialogue from './types/Dialogue';
```

**Why this matters:**
- Users can override any engine component or type by placing custom versions in their project
- Core engine won't import original versions when user provides overrides
- Enables true plugin/extension capability without import conflicts
- Projects can customize interfaces (e.g., add `avatar` field to `Dialogue` interface)
- Type generation system automatically prioritizes project types over engine defaults

## 🤖 Coordinator Architecture

**Main Claude acts as COORDINATOR only** - delegates all specialized tasks to sub-agents defined in `.claude/agents/`. See individual agent files for detailed capabilities and usage patterns.

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

## Testing and Quality Assurance

**Build Status:** ✅ Production builds succeed (120.89 kB optimized output)  
**Type Status:** ⚠️ TypeScript errors in UI components (`npm run check` fails)  
**Engine Status:** ✅ Core engine functionality working correctly

The project has no formal test suite. Testing is done manually using the `sample` project which includes test events:
- `after-intro.ts`: Basic text and background testing
- `choice-event.ts`: Choice navigation testing  
- `timing-event.ts`: Minigame and custom logic testing
- `intro.ts`: Basic narrative flow

**Current Issues (Non-blocking):**
- TypeScript errors in SaveLoadMenu.vue, Game.vue, Main.vue, and Foreground.vue
- Some type mismatches in Pinia store usage
- Engine core works correctly despite UI type errors

**Immediate Fix Priorities:**
1. Fix GameState type mismatch in Game.vue
2. Fix SaveLoadMenu.vue array indexing and window type issues
3. Add proper type declarations for Vue components

## Architecture Files (Current Implementation)

### Core Runtime Files
- `src/engine/runtime/Engine.ts`: Main engine orchestrator (with debug delays in development)
- `src/engine/runtime/HistoryManager.ts`: Go back/forward navigation with state snapshots
- `src/engine/runtime/ActionExecutor.ts`: VNAction execution with custom logic support
- `src/engine/runtime/NavigationManager.ts`: State restoration and navigation coordination  
- `src/engine/runtime/WaitManager.ts`: User input waiting and promise management
- `src/engine/runtime/SimulateRunner.ts`: Event simulation API for dual-phase execution
- `scripts/generate.cts`: Build system orchestrator for TypeScript generation
- `projects/sample/`: Complete test project demonstrating all engine features

### Key Concepts
- **Project Isolation**: Each VN is completely separate in `projects/` with own config, assets, and code
- **Code Generation**: TypeScript files auto-generated from project structure with hot-reload during development  
- **Environment Variable**: `VUEVN_PROJECT` controls active project for all operations
- **Asset Serving**: Vite middleware serves project-specific assets from `projects/{name}/assets/` at `/assets/` URL

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
- Valid `config.json` in each project (see `projects/sample/config.json` for reference)
- TypeScript compilation through Vite build system
- Environment variable `VUEVN_PROJECT` must be set for all operations

## Important Notes for Development
- **Debug Delays**: The current Engine.ts includes debug delays (20-second sleeps) for development debugging
- **File Watching**: Development server automatically regenerates TypeScript files when engine or project files change
- **Manager Architecture**: Engine delegates all responsibilities to focused managers - avoid adding functionality directly to Engine.ts
- **Custom Logic**: Minigames and complex interactions should use the CustomRegistry system and exit event flow via jumps