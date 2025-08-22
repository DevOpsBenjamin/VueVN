# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VueVN is a visual novel engine built with Vue 3, TypeScript, and Vite that provides a natural TypeScript development experience with perfect save/load and history functionality like Ren'Py.

**Current Status:** 🔄 **Architecture Redesign Phase**  
The project is undergoing a major engine architecture redesign to implement:
- Dual-phase execution (simulation + playback)
- Text-by-text go back/forward history
- Natural TypeScript event development
- Perfect save/load with mid-event support

## 🎯 Current Focus

### Primary Objective
Implement the new engine architecture documented in `Claude/ENGINE_ARCHITECTURE_TODO.md`. This is the **top priority** - all other features are secondary until this core engine redesign is complete.

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

### Engine Architecture (LEGACY - BEING REDESIGNED)
- **Current Engine** (`src/engine/runtime/Engine.ts`): Contains 20-second debug delays (intentional)
- **Target Architecture**: Dual-phase execution with simulation + playback
- **New Implementation**: Will be `src/engine/runtime/NewEngine.ts` (see ENGINE_ARCHITECTURE_TODO.md)

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

### Debug Delays Are Intentional
The current engine has **20-second delays** in the game loop (`src/engine/runtime/Engine.ts:171`). These are **intentional debugging mechanisms** to prevent infinite event loops during development, NOT bugs to be fixed. They should remain until the new engine architecture is implemented and proven stable.

### Documentation Organization
- **`Claude/`**: All Claude Code documentation and architectural plans
- **`Claude/ENGINE_ARCHITECTURE_TODO.md`**: Complete implementation roadmap for new engine
- **`Claude/PROJECT_REPORT.md`**: Comprehensive codebase analysis
- **`Claude/TODO_FOR_CLAUDE.md`**: Prioritized action items (may be outdated by ENGINE_ARCHITECTURE_TODO.md)

## 🎯 Next Steps for Future Claude Instances

### Immediate Priority
1. **Read `Claude/ENGINE_ARCHITECTURE_TODO.md`** - Complete implementation guide
2. **Implement dual-phase engine** - This is the core architectural change needed
3. **Test with sample project** - Use existing sample as test bed

### Future Features (Lower Priority)
- Monaco editor autocompletion for engine API
- IDE tools for event validation and testing
- Advanced debugging and profiling tools
- Plugin architecture and extensibility

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
Events are TypeScript modules with `execute` functions:
```typescript
export default {
  id: 'event_id',
  name: 'Event Name',
  async execute(engine, gameState) {
    await engine.showText('Hello world!');
    // ... event logic
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