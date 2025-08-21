# VueVN Engine Architecture - Implementation TODO

**Generated:** 2025-01-27  
**Status:** Design Phase - Ready for Implementation  
**Goal:** Create a natural TypeScript VN engine with perfect history/replay like Ren'Py

---

## 🎯 CORE VISION

Create a VN engine where developers write **natural TypeScript code** using engine API calls, while the engine handles all the complex history, save/load, and replay logic behind the scenes.

### Key Principles:
1. **Natural Development:** Developers write normal async/await code with engine API calls
2. **Text-by-Text History:** Go back/forward one text box at a time like Ren'Py
3. **Simulation + Playback:** Engine simulates events first, then plays back with real user interaction
4. **Custom Logic Support:** Mini-games, complex logic - anything developers want
5. **Jump-Only Boundaries:** All event transitions happen through jumps for simplicity
6. **Clean State Management:** Engine handles all complexity, devs just write story logic

---

## 📋 ARCHITECTURE OVERVIEW

### Dual-Phase Execution System

```typescript
// PHASE 1: SIMULATION
// - Run event code in "simulation mode"
// - Record all API calls as actions
// - Handle choices with default/historical values
// - Cache custom logic results
// - Generate complete action sequence

// PHASE 2: PLAYBACK  
// - Execute actions one by one with real user interaction
// - Record state before each action (for go-back)
// - Wait for user input (right click = continue, left click = back)
// - Apply real choice selections
// - Use cached custom logic results
```

### Event Structure

```typescript
// Developer writes this (feels completely natural):
export default {
  id: 'forest_encounter',
  async execute(engine, gameState) {
    await engine.setBackground('forest.jpg');
    await engine.showText('You enter the dark forest...', 'Narrator');
    
    // Custom logic - totally free TypeScript
    if (gameState.flags.hasMap) {
      await engine.showText('Your map shows a hidden path!');
      gameState.flags.foundSecretPath = true;
    }
    
    // Mini-game integration
    if (gameState.flags.needsTimingTest) {
      await engine.runCustomLogic('timingMinigame', {
        difficulty: gameState.player.skill,
        reward: 100
      });
    }
    
    await engine.showText('What do you want to do?', 'Narrator');
    await engine.showChoices([
      { text: 'Follow main path', id: 'main', jump_id: 'forest_main_path' },
      { text: 'Search for secrets', id: 'secret', jump_id: 'forest_secret_search' },
      { text: 'Return to village', id: 'back', jump_id: 'village_entrance' }
    ]);
    
    // Code after showChoices NEVER executes (automatic jump)
  }
}
```

---

## 🏗️ IMPLEMENTATION PLAN

### Phase 1: Core Engine Architecture (Week 1-2)

#### 1.1 Create New Engine Class Structure

**Files to create/modify:**
- `src/engine/runtime/NewEngine.ts` (main engine)
- `src/engine/runtime/EngineAPI.ts` (simulation + playback APIs)
- `src/engine/runtime/types.ts` (update type definitions)

**Core Types:**
```typescript
interface VNAction {
  type: 'showText' | 'setBackground' | 'setForeground' | 'showChoices' | 'jump' | 'runCustomLogic';
  [key: string]: any; // Action-specific properties
}

interface HistoryEntry {
  action: VNAction;
  gameStateBefore: GameState;
  engineStateBefore: EngineState;
  timestamp: number;
  choiceMade?: string;
  customLogicResult?: any;
}

interface EngineState {
  // ... existing properties ...
  history: HistoryEntry[];
  future: HistoryEntry[]; // For go-forward after go-back
  currentActionIndex: number; // Where we are in current event
  isSimulating: boolean; // Flag for simulation mode
  isFastForwarding: boolean; // Flag for load fast-forward
}
```

#### 1.2 Implement Dual-Phase Execution

**Key Methods:**
```typescript
class NewEngine {
  // Main event processor
  async processEvent(event: VNEvent): Promise<void> {
    // Phase 1: Simulation
    const actionSequence = await this.simulateEvent(event);
    
    // Phase 2: Playback
    await this.playbackActions(actionSequence);
  }
  
  // Simulation phase - records actions without user interaction
  private async simulateEvent(event: VNEvent): Promise<VNAction[]> {
    const actions: VNAction[] = [];
    const simulationAPI = this.createSimulationAPI(actions);
    
    try {
      await event.execute(simulationAPI, this.gameState);
    } catch (jumpInterrupt) {
      // Expected - showChoices throws jump interrupt
    }
    
    return actions;
  }
  
  // Playback phase - real execution with user interaction
  private async playbackActions(actions: VNAction[]): Promise<void> {
    for (let i = this.currentActionIndex; i < actions.length; i++) {
      this.recordHistory(actions[i]); // Save state before action
      await this.executeAction(actions[i]); // Execute with real user interaction
      this.currentActionIndex = i + 1;
    }
  }
}
```

#### 1.3 Create Simulation API

**Purpose:** Records actions without real execution
```typescript
private createSimulationAPI(actions: VNAction[]): EngineAPI {
  return {
    async showText(text: string, from?: string): Promise<void> {
      actions.push({ type: 'showText', text, from });
      // No waiting in simulation
    },
    
    async showChoices(choices: Choice[]): Promise<string> {
      actions.push({ type: 'showChoices', choices });
      
      // Use historical choice if replaying, otherwise first choice
      const choiceId = this.getHistoricalChoice() || choices[0].id;
      const choice = choices.find(c => c.id === choiceId);
      
      if (choice?.jump_id) {
        actions.push({ type: 'jump', eventId: choice.jump_id });
        throw new JumpInterrupt(choice.jump_id); // Stop simulation here
      }
      
      return choiceId;
    },
    
    async runCustomLogic(logicId: string, args: any): Promise<any> {
      actions.push({ type: 'runCustomLogic', logicId, args });
      // Return cached result if available, otherwise default
      return this.getCachedCustomLogicResult(logicId, args) || {};
    }
  };
}
```

#### 1.4 Create Playback API

**Purpose:** Real execution with user interaction
```typescript
private async executeAction(action: VNAction): Promise<void> {
  switch (action.type) {
    case 'showText':
      this.engineState.dialogue = { text: action.text, from: action.from };
      await this.waitForContinue(); // Wait for right-click/space
      break;
      
    case 'showChoices':
      this.engineState.choices = action.choices;
      const choiceId = await this.waitForChoice(); // Wait for user selection
      this.recordChoiceInHistory(choiceId);
      break;
      
    case 'runCustomLogic':
      const result = await this.executeCustomLogic(action.logicId, action.args);
      this.cacheCustomLogicResult(action.logicId, result);
      break;
      
    case 'jump':
      this.jumpToEvent(action.eventId);
      throw new JumpInterrupt(); // Exit current event
      break;
  }
}
```

### Phase 2: History System (Week 2-3)

#### 2.1 Implement Text-by-Text Go Back

**Requirements:**
- Go back one text box at a time
- Can go back before choices
- Restore exact state (UI + game state)
- Support up to 50 history entries (configurable)

```typescript
class NewEngine {
  async goBack(): Promise<void> {
    if (this.engineState.history.length === 0) return;
    
    // Move current state to future stack for go-forward
    this.engineState.future.push(this.createCurrentStateSnapshot());
    
    // Restore previous state
    const lastEntry = this.engineState.history.pop();
    this.restoreStateFromHistory(lastEntry);
    
    // If we went back to middle of event, resume from that point
    if (this.engineState.currentEvent && this.engineState.currentActionIndex > 0) {
      await this.resumeEventFromCurrentIndex();
    }
  }
  
  async goForward(): Promise<void> {
    if (this.engineState.future.length === 0) return;
    
    const nextEntry = this.engineState.future.pop();
    
    // Re-execute the action that was undone
    await this.executeAction(nextEntry.action);
    
    // For custom logic, use cached result instead of re-running
    if (nextEntry.customLogicResult) {
      this.restoreCustomLogicResult(nextEntry.customLogicResult);
    }
  }
  
  private recordHistory(action: VNAction): void {
    // Clear future when new action taken (no more go-forward)
    this.engineState.future = [];
    
    // Create snapshot of current state
    const entry: HistoryEntry = {
      action,
      gameStateBefore: JSON.parse(JSON.stringify(this.gameState)),
      engineStateBefore: JSON.parse(JSON.stringify(this.engineState)),
      timestamp: Date.now()
    };
    
    this.engineState.history.push(entry);
    
    // Limit history size for performance
    if (this.engineState.history.length > 50) {
      this.engineState.history.shift(); // Remove oldest
    }
  }
}
```

#### 2.2 User Input Handling

**Left click = Go back, Right click = Continue**
```typescript
private initializeInputHandlers(): void {
  window.addEventListener('click', (e) => {
    if (this.engineState.state !== 'RUNNING') return;
    
    if (e.clientX < window.innerWidth / 2) {
      // Left side - go back
      this.goBack();
    } else {
      // Right side - continue
      this.resolveCurrentAwaiter('continue');
    }
  });
  
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') this.goBack();
    if (e.key === 'ArrowRight' || e.key === ' ') this.resolveCurrentAwaiter('continue');
  });
}
```

### Phase 3: Custom Logic System (Week 3-4)

#### 3.1 Custom Logic Registry

**Purpose:** Handle mini-games and custom code that exits events
```typescript
class CustomLogicRegistry {
  private static registry = new Map<string, CustomLogicFunction>();
  
  static register(id: string, logic: CustomLogicFunction): void {
    this.registry.set(id, logic);
  }
  
  static get(id: string): CustomLogicFunction | undefined {
    return this.registry.get(id);
  }
}

type CustomLogicFunction = (args: any, gameState: GameState) => Promise<any>;

// Engine integration
class NewEngine {
  async executeCustomLogic(logicId: string, args: any): Promise<any> {
    const logicFunction = CustomLogicRegistry.get(logicId);
    if (!logicFunction) {
      throw new Error(`Custom logic '${logicId}' not found`);
    }
    
    // Execute custom logic - this exits event context
    const result = await logicFunction(args, this.gameState);
    
    // After custom logic finishes, engine loop will look for new events
    this.engineState.currentEvent = null;
    this.engineState.currentActionIndex = 0;
    
    return result;
  }
}
```

#### 3.2 Create Timing Minigame Example

**Requirement:** Circle with green/orange/red zones, click to stop, get bonus/malus for money

**Files to create:**
- `src/minigames/TimingGame.vue` (UI component)
- `src/minigames/TimingGameLogic.ts` (game logic)

```typescript
// TimingGameLogic.ts
export class TimingGame {
  private angle: number = 0;
  private speed: number = 2;
  private isRunning: boolean = true;
  private zones = {
    green: { start: 70, end: 110, bonus: 1.5 },
    orange: { start: 50, end: 70, bonus: 1.0 },
    red: { start: 0, end: 50, bonus: 0.5 }
  };
  
  constructor(private difficulty: number, private baseReward: number) {
    this.speed = 2 + (difficulty * 0.5);
  }
  
  async play(): Promise<{ bonus: number, zone: string, reward: number }> {
    return new Promise((resolve) => {
      const gameLoop = setInterval(() => {
        if (!this.isRunning) return;
        
        this.angle = (this.angle + this.speed) % 360;
      }, 16); // 60fps
      
      // Listen for user click
      const clickHandler = () => {
        this.isRunning = false;
        clearInterval(gameLoop);
        
        const result = this.calculateResult();
        document.removeEventListener('click', clickHandler);
        resolve(result);
      };
      
      document.addEventListener('click', clickHandler);
    });
  }
  
  private calculateResult(): { bonus: number, zone: string, reward: number } {
    let zone = 'red';
    let bonus = 0.5;
    
    for (const [zoneName, zoneData] of Object.entries(this.zones)) {
      if (this.angle >= zoneData.start && this.angle <= zoneData.end) {
        zone = zoneName;
        bonus = zoneData.bonus;
        break;
      }
    }
    
    const reward = Math.floor(this.baseReward * bonus);
    return { bonus, zone, reward };
  }
}

// Register the minigame
CustomLogicRegistry.register('timingMinigame', async (args, gameState) => {
  const game = new TimingGame(args.difficulty, args.reward);
  const result = await game.play();
  
  // Update game state based on result
  gameState.player.money += result.reward;
  gameState.flags.lastMinigameResult = result;
  
  return result;
});
```

### Phase 4: Save/Load System (Week 4-5)

#### 4.1 Enhanced Save/Load with Mid-Event Support

```typescript
interface SaveData {
  gameState: GameState;
  engineState: EngineState;
  history: HistoryEntry[];
  customLogicCache: Record<string, any>;
  metadata: {
    timestamp: string;
    location: string;
    eventId?: string;
    actionIndex?: number;
  };
}

class NewEngine {
  saveGame(slot: string, name?: string): void {
    const saveData: SaveData = {
      gameState: JSON.parse(JSON.stringify(this.gameState)),
      engineState: JSON.parse(JSON.stringify(this.engineState)),
      history: this.engineState.history,
      customLogicCache: this.customLogicCache,
      metadata: {
        timestamp: new Date().toISOString(),
        location: this.gameState.location,
        eventId: this.engineState.currentEvent,
        actionIndex: this.engineState.currentActionIndex,
        name: name || `Save ${slot}`
      }
    };
    
    localStorage.setItem(`VueVN_Save_${slot}`, JSON.stringify(saveData));
  }
  
  async loadGame(slot: string): Promise<void> {
    const raw = localStorage.getItem(`VueVN_Save_${slot}`);
    if (!raw) throw new Error('Save not found');
    
    const saveData: SaveData = JSON.parse(raw);
    
    // Restore state
    this.gameState = saveData.gameState;
    this.engineState = saveData.engineState;
    this.customLogicCache = saveData.customLogicCache;
    
    // If saved mid-event, fast-forward to that point
    if (saveData.metadata.eventId && saveData.metadata.actionIndex > 0) {
      await this.fastForwardToAction(
        saveData.metadata.eventId, 
        saveData.metadata.actionIndex
      );
    }
  }
  
  private async fastForwardToAction(eventId: string, targetIndex: number): Promise<void> {
    const event = this.getEvent(eventId);
    const actions = await this.simulateEvent(event);
    
    this.engineState.isFastForwarding = true;
    
    // Execute actions up to target index using cached data
    for (let i = 0; i < targetIndex; i++) {
      await this.executeActionFastForward(actions[i]);
    }
    
    this.engineState.isFastForwarding = false;
    this.engineState.currentActionIndex = targetIndex;
  }
}
```

### Phase 5: UI Enhancements (Week 5-6)

#### 5.1 Fast-Forward Indicator

**Create component:** `src/engine/core/FastForwardIndicator.vue`
```vue
<template>
  <div v-if="engineState.isFastForwarding" class="fast-forward-indicator">
    <div class="loading-spinner"></div>
    <span>Fast-forwarding to save point...</span>
  </div>
</template>

<script setup>
import { engineState } from '@/generate/stores';
</script>

<style scoped>
.fast-forward-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
```

#### 5.2 History Debug Panel (Development Only)

**Create component:** `src/editor/components/HistoryDebugPanel.vue`
```vue
<template>
  <div class="history-debug" v-if="isDevelopment">
    <h3>History Debug</h3>
    <div class="history-actions">
      <button @click="goBack" :disabled="!canGoBack">← Back</button>
      <button @click="goForward" :disabled="!canGoForward">Forward →</button>
    </div>
    <div class="history-list">
      <div 
        v-for="(entry, index) in engineState.history" 
        :key="index"
        class="history-entry"
        :class="{ active: index === engineState.history.length - 1 }"
      >
        {{ entry.action.type }}: {{ getActionSummary(entry.action) }}
      </div>
    </div>
  </div>
</template>
```

---

## 🎮 TESTING STRATEGY

### Test the Engine with Sample Project

**Use the existing `sample` project as the test bed:**

1. **Create test events that use all features:**
   - Text display with different speakers
   - Background changes
   - Complex branching choices
   - Custom mini-game integration
   - State manipulation

2. **Test save/load scenarios:**
   - Save before choice, load, make different choice
   - Save mid-event, load, continue normally
   - Save after mini-game, load, verify state preserved

3. **Test history navigation:**
   - Go back through multiple text boxes
   - Go back before choices, make different selection
   - Go forward after going back
   - History limits (51+ actions)

### Example Test Event

**Create:** `projects/sample/events/test/engine_test.ts`
```typescript
export default {
  id: 'engine_test',
  async execute(engine, gameState) {
    await engine.setBackground('assets/images/background/intro/hall.png');
    await engine.showText('Welcome to the engine test!', 'System');
    
    // Test state manipulation
    gameState.flags.testStarted = true;
    await engine.showText('Test flag set. Current money: ' + gameState.player.money, 'System');
    
    // Test mini-game
    await engine.showText('Time for a timing test!', 'System');
    await engine.runCustomLogic('timingMinigame', {
      difficulty: 1,
      reward: 50
    });
    
    await engine.showText('Mini-game complete! New money: ' + gameState.player.money, 'System');
    
    // Test choices with jumps
    await engine.showText('Choose your next test:', 'System');
    await engine.showChoices([
      { text: 'Test save/load', id: 'save_test', jump_id: 'save_load_test' },
      { text: 'Test history', id: 'history_test', jump_id: 'history_navigation_test' },
      { text: 'Return to main', id: 'main', jump_id: 'start_intro' }
    ]);
  }
}
```

---

## 🔧 IMPLEMENTATION CHECKLIST

### Core Engine (Priority 1)
- [ ] Create `NewEngine.ts` with dual-phase execution
- [ ] Implement simulation API that records actions
- [ ] Implement playback API with real user interaction
- [ ] Add support for showText, setBackground, showChoices, jump
- [ ] Handle automatic jumps after choices
- [ ] Add basic error handling and logging

### History System (Priority 2)  
- [ ] Implement history recording before each action
- [ ] Add goBack() function with state restoration
- [ ] Add goForward() function with cached results
- [ ] Limit history to 50 entries for performance
- [ ] Support mid-event go back/forward

### Custom Logic (Priority 3)
- [ ] Create CustomLogicRegistry system
- [ ] Implement runCustomLogic action type
- [ ] Create TimingGame minigame example
- [ ] Add custom logic result caching
- [ ] Ensure mini-games exit event context properly

### Save/Load (Priority 4)
- [ ] Enhanced saveGame with mid-event support
- [ ] Enhanced loadGame with fast-forward
- [ ] Custom logic cache preservation
- [ ] Save metadata (location, event, action index)
- [ ] Fast-forward UI indicator during load

### Testing & Polish (Priority 5)
- [ ] Create comprehensive test events in sample project
- [ ] Add history debug panel for development
- [ ] Performance optimization (memory management)
- [ ] Error handling and edge cases
- [ ] Documentation and code comments

### Integration (Priority 6)
- [ ] Replace old Engine.ts with NewEngine.ts
- [ ] Update all imports and references
- [ ] Remove debug delays (once engine is stable)
- [ ] Update CLAUDE.md with new architecture
- [ ] Create developer guide for custom logic

---

## 🎯 SUCCESS CRITERIA

### Functional Requirements
- [ ] Events execute naturally with TypeScript API calls
- [ ] Text-by-text go back/forward works perfectly
- [ ] Save/load anywhere, including mid-event
- [ ] Custom mini-games integrate seamlessly
- [ ] Choice selections automatically jump to new events
- [ ] No code executes after showChoices calls

### Performance Requirements
- [ ] History limited to 50 entries maximum
- [ ] Fast-forward completes within 2 seconds for typical saves
- [ ] Memory usage stable during extended gameplay
- [ ] No memory leaks in custom logic execution

### Developer Experience
- [ ] Writing events feels natural and intuitive
- [ ] Custom logic integration is straightforward
- [ ] Error messages are clear and helpful
- [ ] Debug tools provide useful information

---

## 🚨 CRITICAL NOTES FOR IMPLEMENTATION

1. **Jump Behavior:** Code after `showChoices` MUST never execute - throw interrupt immediately
2. **State Snapshots:** Always snapshot BEFORE action execution, not after
3. **Custom Logic:** Must exit event context - set currentEvent to null
4. **Fast-Forward:** Use cached results for custom logic, don't re-run mini-games
5. **History Limits:** Enforce 50-entry limit to prevent memory issues
6. **Error Handling:** Wrap all async operations in try-catch blocks
7. **Performance:** Use JSON.parse(JSON.stringify()) for deep cloning (simple but works)

---

## 📝 NOTES FOR NEXT CLAUDE INSTANCE

This architecture provides the **natural TypeScript development experience** requested while solving the complex history/save/load problem. The key insight is the **dual-phase execution**: simulate first to understand the full event flow, then play back with real user interaction.

The timing mini-game example demonstrates how custom logic can be cleanly integrated - developers just call `engine.runCustomLogic()` and the engine handles all the complexity of caching results for history navigation.

Focus on getting the **core dual-phase execution** working first, then add the history system, then custom logic. Each piece builds on the previous one.

Remember: The goal is to make it feel like **magic** for developers - they write simple async/await code and get perfect save/load/history for free.