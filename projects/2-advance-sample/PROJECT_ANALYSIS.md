# 2-Advance-Sample Project: Comprehensive Analysis

## Overview

The 2-advance-sample project demonstrates sophisticated usage of the VueVN engine's location-centric architecture, showcasing complex relationship systems, economic mechanics, and advanced state management patterns. This analysis covers the project's architectural decisions, important implementations, and areas for improvement.

## Project Architecture

### Location-Centric Organization

```
2-advance-sample/
├── global/                    # System-wide resources
│   ├── events/intro.ts       # Entry point event
│   └── images/               # Global UI assets
├── locations/                # Location-specific resources  
│   ├── bedroom/              # Player's private space
│   ├── city/                 # Economic activities (ATM, shops)
│   ├── neighbor_entrance/    # Complex relationship system
│   ├── garden/               # Simple location
│   └── hallway/              # Navigation hub
└── plugins/                  # Engine customizations
    ├── components/           # Custom Vue components  
    ├── engine/Core/         # Engine overrides
    ├── stores/              # State management
    └── types/               # TypeScript definitions
```

### Navigation Graph Architecture

The custom `LocationLinker.ts` implements a clean hub-based navigation system:

```
         [Mother Room]
               |
 [Bedroom]-[Hallway]-[Outside]--[Neighbor Entrance]
                         |   \
                     [Garden][City]
```

**Hub Design:**
- **Hallway**: Indoor navigation hub (bedroom ↔ mother room ↔ outside)
- **Outside**: Neighborhood hub (hallway ↔ garden ↔ city ↔ neighbor)
- **Zone Separation**: House vs Neighborhood with clear boundaries

## Key Implementations

### 1. Advanced State Management

#### GameState Structure
```typescript
export interface GameState {
  player: Player;           // Extended with lust, money, energy, activities
  neighbor: Neighbor;       // Relationship system with scoring
  mother: Mother;          // Family NPC
  location_id: string;     // Current location
  gameTime: GameTime;      // Time progression system
  flags: Record<string, boolean>; // Event progression flags
}
```

#### Creator Pattern
Each NPC uses dedicated creator functions for default values and type safety:
- `playerCreator.ts`: Player with economic and relationship stats
- `neighborCreator.ts`: Neighbor with relationship scoring system
- `motherCreator.ts`: Mother NPC with family-specific attributes
- `timeCreator.ts`: Game time with day/hour progression

### 2. Complex Relationship System

The neighbor relationship system demonstrates advanced game mechanics:

```typescript
// Multi-condition event routing
if (relationStatus === 'close_friend' && (hour > 22 || hour < 6)) {
  await engine.jump('knock-door-lover-late');
} else if (relationStatus === 'close_friend' && lust > 60) {
  await engine.jump('knock-door-lover-lust');
}
```

**Features:**
- **Numeric relationship scores** (0-100) with status thresholds
- **Daily interaction tracking** preventing exploitation
- **Time-sensitive interactions** (different responses by hour)
- **Contextual branching** based on multiple state factors

### 3. Economic System

The ATM implementation showcases realistic economic mechanics:

```typescript
// Bank vs pocket money distinction
if (bankBalance >= amount) {
  gameState.player.bank_balance -= amount;
  gameState.player.pocket_money += amount - 2; // Transaction fee
}
```

**Features:**
- **Transaction fees** and realistic constraints
- **Bank/pocket money separation**
- **Action-triggered events** (using_atm action → use_atm event)

### 4. Dynamic Time-Based Systems

Locations use conditional background switching:

```typescript
// bedroom/info.ts
timeBackgrounds: [
  {
    check: (state) => state.gameTime.hour > 20 || state.gameTime.hour < 5,
    value: "/bedroom/images/background/night.png",
  },
  {
    check: (state) => true,
    value: "/bedroom/images/background/morning.png",
  }
]
```

### 5. Custom UI Components

#### TopBarOverlay.vue
- Real-time game time display
- Multi-character information panels
- Dynamic UI based on game state

#### TimingGame.vue
- Custom minigame with SVG animations
- Event emission for game results
- Integration with narrative flow

#### Character Info Panels
- Detailed relationship progression visualization
- Dynamic status updates
- Modular design for different NPCs

## Engine Feature Demonstrations

### 1. Plugin Architecture Excellence

**Engine Component Override:**
```typescript
// plugins/engine/Core/LocationLinker.ts
class LocationLinker {
  static initLocationLinks(locationManager: LocationManager): void {
    locationManager.link(hallway, [bedroom, mother_room, outside]);
    locationManager.link(outside, [hallway, neighbor_entrance, garden, city]);
  }
}
```

**Store Extensions:**
- Project-specific stores alongside engine stores
- Clean separation of concerns
- Type-safe store integration

### 2. Advanced Event Patterns

#### Router Events
Single events that route to different outcomes based on complex conditions:
```typescript
// neighbor_entrance/events/knock_door/knock_door_main.ts
// Routes to different relationship scenarios
```

#### Hierarchical Organization
Events organized in context-specific subdirectories:
```
knock_door/
├── knock_door_main.ts     # Router event
└── relation/              # Context-specific variants
    ├── friend.ts
    ├── lover.ts
    └── stranger.ts
```

### 3. Dual-Phase Architecture Usage

Events like timing challenges demonstrate the engine's dual-phase system:
- **Simulation phase**: Event execution sets up the minigame
- **Playback phase**: User interacts with custom components
- **Seamless integration** between narrative and interactive elements

## Most Important Architectural Patterns

### 1. Clean Action-Event Coordination
```typescript
// Action sets flag
const using_atm: Action = {
  execute: (state) => state.flags.using_atm = true,
};

// Event checks flag
const useATM: VNEvent = {
  conditions: (state) => state.flags.using_atm === true,
}
```

### 2. Type-Safe Plugin Extensions
```typescript
// Generated imports for extensibility
import { Engine } from '@generate/engine';
import type { GameState } from '@generate/types';
```

### 3. Location-Centric Resource Loading
- Automatic asset loading per location
- Clean separation of location-specific vs global resources
- Dynamic background switching based on game state

## Areas for Improvement

### 1. Asset Pipeline Issues
Many locations use placeholder backgrounds (`/global/images/menu.png`):
- `city/info.ts`
- `neighbor_entrance/info.ts`
- `garden/info.ts`

**Recommendation:** Complete asset pipeline with proper location-specific backgrounds.

### 2. Custom Logic Integration
The timing_event.ts has incomplete custom logic integration:
```typescript
// Commented out implementation
// await engine.runCustomLogic('timingMinigame', { 
//   difficulty: 2,
//   context: 'alarm_clock' 
// });
```

**Recommendation:** Complete custom logic API integration.

### 3. Type Definition Consistency
Some type extensions referenced in UI components are not properly defined in the type system.

**Recommendation:** Ensure all UI-referenced properties are properly typed.

### 4. Documentation Language Consistency
Some events contain mixed French/English comments.

**Recommendation:** Standardize documentation language.

## Engine Enhancement Opportunities

### 1. Asset Management System
The placeholder usage suggests need for:
- Automatic asset validation
- Development-time asset placeholders
- Asset pipeline tooling

### 2. Custom Logic API
The incomplete timing minigame suggests:
- Standardized custom component integration
- Event-component communication patterns
- Minigame framework

### 3. Relationship System Utilities
The complex relationship logic could benefit from:
- Built-in relationship scoring utilities
- Standard relationship status calculations
- Relationship progression helpers

## Conclusion

The 2-advance-sample project excellently demonstrates VueVN's capabilities for complex visual novels. It showcases sophisticated relationship systems, economic mechanics, and custom UI integration while maintaining clean architecture and type safety.

**Strengths:**
- Advanced plugin system usage
- Complex state management patterns
- Excellent UI customization examples
- Clean location-centric architecture

**Priority Fixes:**
- Complete asset pipeline
- Finish custom logic integration
- Standardize type definitions
- Asset management improvements

This project serves as an excellent reference implementation for advanced VueVN engine usage and highlights areas where the engine could be enhanced to better support complex game mechanics.