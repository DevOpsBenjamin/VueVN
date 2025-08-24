# Event Validator for Non-Simulatable Events

## Problem Statement

The dual-phase engine requires events to be fully simulatable - meaning we can pre-calculate all states and UI changes by running the event's TypeScript on state copies. However, some event patterns break this assumption and create **non-simulatable events**.

## Examples of Non-Simulatable Patterns

### 1. User Input with Post-Input Logic
```typescript
// BAD - Non-simulatable
const userName = await engine.askUserName("What's your name?");
state.player.name = userName;  // Simulation uses placeholder
await engine.showText(`Hello ${userName}!`); // Always shows placeholder
```

### 2. External API Calls
```typescript
// BAD - Non-simulatable  
const weather = await engine.fetchWeather();
await engine.showText(`Today is ${weather}`); // Can't predict weather
```

### 3. Random Events with Post-Logic
```typescript
// BAD - Non-simulatable
const random = Math.random();
if (random > 0.5) {
  state.luck = 'good';
} else {
  state.luck = 'bad';
}
await engine.showText(`Your luck is ${state.luck}`); // Different each simulation
```

## Proposed Event Validator System

### Validation Rules

#### Rule 1: No Logic After User Input
- **Detection**: AST parsing for code after `await engine.ask*()` calls
- **Error**: "Event contains logic after user input - use jump_to instead"

#### Rule 2: No External Dependencies
- **Detection**: Calls to non-engine APIs, file system, network
- **Error**: "Event contains external dependencies - move to custom logic"

#### Rule 3: Deterministic State Changes  
- **Detection**: `Math.random()`, `Date.now()`, etc. without seeding
- **Error**: "Event contains non-deterministic operations"

#### Rule 4: No Async Without Engine
- **Detection**: `await` calls not on engine methods
- **Error**: "Event contains non-engine async operations"

### Implementation Approach

#### Static Analysis (Build Time)
```typescript
class EventValidator {
  validateEvent(eventPath: string): ValidationResult {
    const ast = parseTypeScript(eventPath);
    
    return {
      isSimulatable: boolean,
      errors: ValidationError[],
      warnings: ValidationWarning[]
    };
  }
  
  private checkUserInputPatterns(ast: AST): ValidationError[] {
    // Find await engine.ask*() calls
    // Check if code exists after them
    // Suggest jump_to pattern
  }
  
  private checkExternalCalls(ast: AST): ValidationError[] {
    // Find non-engine function calls
    // Check imports for external dependencies
  }
  
  private checkDeterminism(ast: AST): ValidationError[] {
    // Find Math.random(), Date.now(), etc.
    // Suggest moving to custom logic with seeds
  }
}
```

#### Runtime Validation (Development Mode)
```typescript
// In simulation API
async askUserName(prompt: string, options?: {jump_to: string}): Promise<string> {
  if (!options?.jump_to && this.hasCodeAfterCall()) {
    throw new ValidationError(
      "askUserName() requires jump_to option - no code allowed after user input"
    );
  }
  
  // ... rest of implementation
}
```

### Recommended Patterns

#### ✅ Good: User Input with Jump
```typescript
await engine.askUserName("What's your name?", {
  jump_to: 'greet_user',
  saveAs: 'player.name'
});
// No code after input - event ends here
```

#### ✅ Good: External Data in Custom Logic
```typescript
await engine.runCustomLogic('fetch_weather', {location: 'Paris'});
// Custom logic handles API, caches result, returns immediately on replay
```

#### ✅ Good: Seeded Randomness  
```typescript
// Move to custom logic with deterministic seeds
await engine.runCustomLogic('random_event', {seed: state.player.id});
```

### Developer Experience

#### CLI Integration
```bash
npm run validate-events
# ✓ intro.ts - Simulatable
# ✗ character_creation.ts - Contains logic after user input
# ⚠ random_encounter.ts - Uses Math.random() - consider seeding
```

#### IDE Integration
- **VSCode Extension**: Real-time validation
- **Type Definitions**: Engine methods with JSDoc warnings
- **Linting Rules**: ESLint rules for non-simulatable patterns

#### Error Messages
```
❌ Event Validation Error in character_creation.ts:15

  const name = await engine.askUserName("Enter name:");
  state.player.name = name; // ← Problem: logic after user input
  await engine.showText(`Welcome ${name}!`);

💡 Fix: Use jump_to pattern
  await engine.askUserName("Enter name:", {
    jump_to: 'welcome_player',
    saveAs: 'player.name'  
  });
```

## Benefits

1. **Prevents Runtime Issues**: Catch simulation problems at build time
2. **Enforces Best Practices**: Guide developers toward simulatable patterns
3. **Better Performance**: Ensures all events can be pre-calculated
4. **Debugging Support**: Clear error messages with suggested fixes
5. **Team Consistency**: Everyone follows the same event patterns

## Implementation Priority

1. **Phase 1**: Basic AST parsing for user input patterns
2. **Phase 2**: External dependency detection  
3. **Phase 3**: Runtime validation in development mode
4. **Phase 4**: IDE integration and enhanced error messages
5. **Phase 5**: Advanced patterns (seeded randomness, complex async flows)

This validator would ensure the dual-phase engine's simulation assumptions are never violated, leading to more reliable and predictable VN behavior.