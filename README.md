# VueVN - Visual Novel Engine

VueVN is a modern visual novel engine powered by Vue 3 and TypeScript that combines narrative storytelling with interactive sandbox exploration.

## Features

### Core Engine
- **Dual-Phase Architecture**: Simulation + playback for perfect save/load and history
- **Natural TypeScript**: Write events with async/await - no special syntax needed
- **Text-by-Text History**: Navigate back/forward through dialogue like Ren'Py
- **Project Isolation**: Each visual novel is a separate, self-contained project

### Sandbox Mode
- **Interactive Locations**: Click-to-navigate location system with circular UI
- **Time-Based Actions**: Wait 1 hour, Sleep until morning, with time progression
- **Dynamic Backgrounds**: Location backgrounds that change based on time/conditions
- **Action System**: Context-sensitive actions that appear based on location and game state

### Advanced Systems
- **Event-Driven Narrative**: Events trigger automatically based on conditions
- **Location Management**: Locations with accessibility conditions and time restrictions
- **State Management**: Comprehensive game state with time, flags, and player tracking
- **Extensible Architecture**: Override any engine component through generated imports

## Quick Start

```bash
# Install dependencies
npm install

# Create a new visual novel project
npm run add-project my-novel

# Start development server with hot-reload
npm run dev my-novel

# Build for production
npm run build my-novel

# Type checking
npm run check
```

## Architecture

The engine uses a **dual-phase architecture**:

1. **Simulation Phase**: Your events execute to generate action sequences
2. **Playback Phase**: Actions replay with user interaction and state management

This enables perfect save/load, history navigation, and natural TypeScript development.

## Project Structure

```
projects/my-novel/
├── config.json          # Project configuration
├── events/              # Event TypeScript files organized by location/narrative
├── locations/           # Location definitions with backgrounds and conditions
├── actions/             # Custom actions (Wait, Sleep, etc.)
├── assets/             # Images, sounds, and media
├── stores/             # Custom game state management
├── components/         # Custom Vue components
├── types/              # TypeScript type definitions
└── runtime/            # Custom runtime extensions (LocationLinker, etc.)
```

## Development Guide

### Events
Events are the core narrative units that drive story progression:

```typescript
import type { VNEvent } from '@/generate/types';
import { bedroom } from '@/generate/locations';

const afterIntro: VNEvent = {
  id: 'after-intro',
  name: 'After Introduction',
  foreground: 'assets/images/background/bedroom/morning.png', // Auto-set when event starts
  conditions: (state) => state.location_id === bedroom.id,
  unlocked: (state) => state.flags.introSeen,
  locked: (state) => state.flags.introAct,
  
  async execute(engine, state) {
    await engine.showText('You find yourself in your cozy bedroom.');
    await engine.showText('Sunlight streams through the window.');
    
    await engine.showChoices([
      { text: 'Explore the room', branch: 'explore_room' },
      { text: 'Check your phone', branch: 'check_phone' }
    ]);
  },

  branches: {
    explore_room: {
      async execute(engine, state) {
        state.flags.introAct = true;
        await engine.showText("You look around your bedroom carefully.");
        await engine.showText("You notice some interesting books on your shelf.");
      }
    }
  }
};
```

### Locations
Define interactive locations with dynamic backgrounds and accessibility:

```typescript
import type { Location } from '@/generate/types';

export const bedroom: Location = {
  id: "bedroom",
  name: "Bedroom",
  baseBackground: "assets/images/background/bedroom/default.png",
  timeBackgrounds: [
    {
      check: (state) => state.gameTime.hour >= 6 && state.gameTime.hour < 12,
      value: "assets/images/background/bedroom/morning.png"
    },
    {
      check: (state) => state.gameTime.hour >= 18,
      value: "assets/images/background/bedroom/evening.png"
    }
  ],
  accessibleLocations: ["hallway", "bathroom"],
  unlocked: () => true,
  accessErrors: []
};
```

### Actions
Create time-based and contextual actions:

```typescript
import { TimeHelper } from '@/generate/runtime';
import type { Action } from '@/generate/types';
import { bedroom } from '@/generate/locations';

const sleep: Action = {
    id: "sleep",
    name: "Sleep",
    unlocked: (state) => TimeHelper.canSleep(state.gameTime) && state.location_id == bedroom.id,
    execute: (state) => TimeHelper.sleep(state.gameTime),
};
```

## Game Flow

VueVN operates in two distinct modes:

### 1. Event Mode (Narrative)
- **Foreground images** overlay the scene during story events
- Events execute automatically based on conditions
- Linear dialogue with choices and branches
- Perfect save/load and history navigation

### 2. Sandbox Mode (Exploration)  
- **Background images** show location atmosphere
- Interactive circular UI for locations (bottom-right) and actions (bottom-left)
- Time progression system with day/night cycles
- Context-sensitive actions based on location and time

The engine seamlessly transitions between modes based on available events and user interaction.

## Key Features in Action

- **Time System**: Game time progresses with actions like "Wait 1H" or "Sleep until morning"
- **Location Navigation**: Click circular buttons to move between unlocked locations
- **Dynamic UI**: Available actions and locations update automatically based on game state
- **Event Triggering**: Story events appear automatically when conditions are met
- **Visual Layering**: Background (location) + Foreground (events) create rich visual storytelling

## Current Status

✅ **Sandbox Mode**: Fully functional location navigation and time system  
✅ **Event System**: Dynamic event triggering with foreground auto-setting  
✅ **Action System**: Context-aware actions with engine loop integration  
✅ **Build System**: Production builds work (120KB optimized output)  
⚠️ **Type Safety**: Some TypeScript errors in UI components (non-blocking)  

## Development

See `CLAUDE.md` for comprehensive development guidance, architectural decisions, and build procedures.

This project showcases modern web development patterns including TypeScript generics, Vue 3 Composition API, reactive state management, and AI-assisted development workflows.