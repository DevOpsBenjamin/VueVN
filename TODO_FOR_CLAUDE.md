# TODO List for Future Claude Instances

**Generated:** 2025-01-27  
**Status:** Ready for Implementation  
**Priority Order:** Critical → High → Medium → Low

This document provides a prioritized action plan for future Claude Code instances working on the VueVN project. Tasks are ordered by urgency and impact.

---

## 🔥 CRITICAL PRIORITY - Must Do First

### 1. Remove Debug Delays (IMMEDIATE - 10 minutes)
**Status:** 🔴 BLOCKING ALL GAMEPLAY  
**File:** `src/engine/runtime/Engine.ts:171`  
**Issue:** Hard-coded 20-second delay makes engine unusable

**Action:**
```typescript
// DELETE THIS LINE:
await new Promise((resolve) => setTimeout(resolve, 20000));
```

**Testing:**
1. Run `npm run dev sample`
2. Click through events - should progress immediately
3. Verify no 20-second waits between events

**Success Criteria:** Events advance immediately on user input

---

### 2. Fix Awaiter Resolution System (2-3 days)
**Status:** 🔴 CRITICAL - Events hang indefinitely  
**Files:** `src/engine/runtime/Engine.ts`, `src/engine/runtime/EngineAPI.ts`

**Problems:**
- Events hang waiting for user input that never resolves
- Inconsistent promise cleanup
- No timeout mechanisms

**Actions:**
1. **Audit awaiter usage:**
   ```bash
   grep -r "awaiterResult" src/engine/
   ```
2. **Add timeout mechanisms:**
   ```typescript
   // Add to Engine.ts
   private setupInputTimeout(timeoutMs: number = 30000): void {
     setTimeout(() => {
       if (this.awaiterResult) {
         console.warn('Input timeout, auto-resolving');
         this.resolveAwaiter('timeout');
       }
     }, timeoutMs);
   }
   ```
3. **Ensure cleanup in all error paths**
4. **Add error handling for failed input resolution**

**Testing:**
1. Play through multiple events without hanging
2. Test choice selection resolves properly
3. Verify escape/menu interruption works
4. Test rapid clicking doesn't break awaiter state

**Success Criteria:** No event hanging, all user inputs resolve properly

---

### 3. Stabilize Save/Load System (1 week)
**Status:** 🔴 CRITICAL - Save corruption and failures  
**Files:** `src/engine/runtime/EngineSave.ts`, `src/engine/runtime/Engine.ts`

**Problems:**
- `startEventReplay` function has critical bugs
- State restoration incomplete
- Race conditions during save/load
- Memory corruption issues

**Actions:**
1. **Fix startEventReplay implementation:**
   - Review current implementation
   - Fix state restoration logic
   - Add proper error handling
2. **Add state validation:**
   ```typescript
   private validateGameState(state: GameState): boolean {
     // Validate required properties exist
     // Check for state corruption
     // Verify event consistency
   }
   ```
3. **Implement atomic save operations:**
   - Prevent partial saves
   - Add rollback on save failure
   - Test rapid save/load cycles
4. **Add error recovery:**
   - Detect corrupted saves
   - Provide fallback mechanisms
   - Clear invalid state

**Testing:**
1. Save at various game points and load successfully
2. Test rapid save/load cycles
3. Verify state consistency after load
4. Test edge cases (save during events, choices, etc.)

**Success Criteria:** Reliable save/load with no state corruption

---

## 🟡 HIGH PRIORITY - Next Steps

### 4. Add Basic Testing Framework (1-2 weeks)
**Status:** 🟡 No tests exist - high regression risk

**Actions:**
1. **Install Vitest:**
   ```bash
   npm install -D vitest @vue/test-utils jsdom
   ```
2. **Create test structure:**
   ```
   tests/
   ├── unit/
   │   ├── engine/
   │   └── editor/
   └── integration/
   ```
3. **Write critical tests:**
   - Engine initialization
   - Event execution
   - Save/load functionality
   - User input handling
4. **Set up CI pipeline**

**Files to create:**
- `vitest.config.ts`
- `tests/unit/engine/Engine.test.ts`
- `tests/integration/SaveLoad.test.ts`

**Success Criteria:** Basic test coverage for core functionality

---

### 5. Improve Error Handling (1 week)
**Status:** 🟡 Poor error messages and no error boundaries

**Actions:**
1. **Add try-catch blocks around critical operations:**
   ```typescript
   try {
     await this.handleEvent(event);
   } catch (error) {
     console.error(`Event ${event.id} failed:`, error);
     this.handleEventError(error, event);
   }
   ```
2. **Create Vue error boundaries:**
   ```vue
   <!-- ErrorBoundary.vue -->
   <template>
     <div v-if="hasError" class="error-boundary">
       <h2>Something went wrong</h2>
       <pre>{{ errorMessage }}</pre>
       <button @click="retry">Retry</button>
     </div>
     <slot v-else />
   </template>
   ```
3. **Add helpful developer error messages:**
   - Event validation errors
   - File operation failures
   - State corruption detection
4. **Implement error logging system**

**Success Criteria:** Clear error messages, graceful failure handling

---

### 6. Memory Management (1 week)
**Status:** 🟡 Memory leaks during extended gameplay

**Problems:**
- Event cache grows unbounded
- State history accumulates without limits
- No cleanup for completed events

**Actions:**
1. **Implement event cache cleanup:**
   ```typescript
   private cleanupEventCache(): void {
     // Remove events from completed locations
     // Limit cache size
     // Clear unused event references
   }
   ```
2. **Add history limits:**
   ```typescript
   private addToHistory(entry: GameHistoryEntry): void {
     this.engineState.history.push(entry);
     if (this.engineState.history.length > MAX_HISTORY_SIZE) {
       this.engineState.history.shift(); // Remove oldest
     }
   }
   ```
3. **Monitor memory usage:**
   - Add memory tracking
   - Log memory growth warnings
   - Implement periodic cleanup

**Testing:**
- Run extended gameplay sessions
- Monitor memory usage over time
- Verify no memory leaks in browser dev tools

**Success Criteria:** Stable memory usage during long gameplay

---

## 🔵 MEDIUM PRIORITY - Improvements

### 7. Monaco Editor Enhancements (1-2 weeks)
**Status:** 🔵 Basic editor works, missing advanced features

**Actions:**
1. **Add engine API autocompletion:**
   ```typescript
   // Add to monacoLoader.ts
   import { EngineAPI } from '@/engine/runtime/EngineAPI';
   
   monaco.languages.typescript.typescriptDefaults.addExtraLib(`
     declare const engine: typeof EngineAPI;
   `, 'engine-api.d.ts');
   ```
2. **Implement event validation:**
   - Syntax checking
   - Structure validation
   - Type checking for event properties
3. **Add code templates:**
   - Basic event template
   - Choice event template
   - Complex branching template
4. **Improve syntax highlighting**

**Files:** `src/editor/components/MonacoEditor.vue`, `src/editor/utils/monacoLoader.ts`

**Success Criteria:** Professional IDE experience for event development

---

### 8. Performance Optimization (2 weeks)
**Status:** 🔵 Works but not optimized for large projects

**Actions:**
1. **Implement code splitting:**
   ```typescript
   // Use dynamic imports
   const event = await import(`../events/${eventId}.ts`);
   ```
2. **Add lazy loading for assets:**
   - Load images on demand
   - Preload critical assets
   - Implement asset caching
3. **Optimize bundle size:**
   - Tree shaking configuration
   - Remove unused dependencies
   - Split vendor bundles
4. **Add performance monitoring:**
   - Event execution timing
   - Asset loading metrics
   - Memory usage tracking

**Files:** `vite.config.js`, build scripts, engine components

**Success Criteria:** Fast loading and smooth performance for large projects

---

### 9. Security Improvements (1 week)
**Status:** 🔵 Basic security, needs hardening

**Actions:**
1. **Add input sanitization:**
   ```typescript
   private sanitizeText(text: string): string {
     return text.replace(/<script[^>]*>.*?<\/script>/gi, '')
               .replace(/javascript:/gi, '')
               .replace(/on\w+=/gi, '');
   }
   ```
2. **Implement path validation:**
   - Prevent directory traversal
   - Validate file extensions
   - Restrict access to project directories
3. **Secure localStorage:**
   - Encrypt sensitive data
   - Validate saved data
   - Implement data integrity checks
4. **Add CSP headers for XSS protection**

**Success Criteria:** No security vulnerabilities in common attack vectors

---

## 🔵 LOW PRIORITY - Future Enhancements

### 10. Audio System Completion
**Time:** 2-3 weeks  
- Complete audio implementation
- Add background music support
- Sound effect system
- Audio controls and settings

### 11. Animation Support
**Time:** 2-3 weeks  
- Character animations
- Scene transitions
- Effect animations
- Timeline-based animation system

### 12. Plugin Architecture
**Time:** 3-4 weeks  
- Plugin API design
- Plugin loading system
- Extension points for engine
- Plugin marketplace integration

### 13. Localization System
**Time:** 2-3 weeks  
- Multi-language support
- Translation management
- Dynamic language switching
- RTL text support

### 14. Advanced Editor Features
**Time:** 4-6 weeks  
- Visual scripting interface
- Advanced debugging tools
- Performance profiling
- Asset management UI

### 15. Production Features
**Time:** 6-8 weeks  
- Game distribution system
- Cloud save integration
- Mobile optimization
- Analytics and telemetry

---

## Implementation Guidelines

### Before Starting Any Task:

1. **Read Documentation:**
   - `CLAUDE.md` - Project overview and architecture
   - `PROJECT_REPORT.md` - Current state analysis
   - Relevant `*.md` files for context

2. **Set Up Environment:**
   ```bash
   npm install
   npm run dev sample  # Test basic functionality
   npm run build sample  # Test build process
   ```

3. **Create Feature Branch:**
   ```bash
   git checkout -b fix/critical-engine-delays
   # or
   git checkout -b feat/add-testing-framework
   ```

### Testing Protocol:

1. **Basic Functionality Test:**
   - Events play from start to finish
   - User input advances gameplay
   - No hanging or infinite loops

2. **Save/Load Test:**
   - Save at multiple points
   - Load saves successfully
   - State remains consistent

3. **Editor Test:**
   - File operations work
   - Live preview functions
   - Monaco editor responsive

4. **Build Test:**
   - Production build completes
   - Built game functions properly
   - No build errors or warnings

### Git Workflow:

1. **Commit Messages:** Use conventional commits
   ```
   fix: remove debug delays from game loop
   feat: add timeout mechanism for user input
   test: add unit tests for engine core functions
   ```

2. **Commit Frequently:** Small, focused commits

3. **Test Before Committing:**
   ```bash
   npm run build sample  # Ensure build works
   # Manual test of changed functionality
   ```

### Error Handling Pattern:

```typescript
try {
  // Risky operation
  await someAsyncOperation();
} catch (error) {
  console.error('Operation failed:', error);
  // Graceful degradation
  // User notification
  // Recovery mechanism
  throw new EngineError('User-friendly message', error);
}
```

### Debugging Tips:

1. **Use Browser Dev Tools:**
   - Console for runtime errors
   - Network tab for asset loading
   - Memory tab for leak detection

2. **Add Strategic Logging:**
   ```typescript
   console.debug(`Event ${eventId} starting`);
   console.debug(`User input received:`, input);
   console.debug(`State transition:`, oldState, newState);
   ```

3. **Test Edge Cases:**
   - Rapid user input
   - Network failures
   - Corrupted data
   - Large projects

---

## Quick Reference

### Critical Files:
- `src/engine/runtime/Engine.ts` - Main engine loop
- `src/engine/runtime/EngineAPI.ts` - Event API
- `src/engine/runtime/EngineSave.ts` - Save/load system
- `src/editor/components/MonacoEditor.vue` - Code editor
- `vite.config.js` - Build configuration

### Common Commands:
```bash
npm run dev sample          # Start development server
npm run build sample        # Build for production
npm run add-project mynovel # Create new project
npm install                 # Install dependencies
```

### Emergency Fixes:
1. **Game not starting:** Check console for errors, verify project exists
2. **Events hanging:** Look for awaiter resolution issues
3. **Save/load broken:** Check localStorage, clear if corrupted
4. **Build failing:** Check for TypeScript errors, missing dependencies

---

## Success Metrics

### Critical Priority Success:
- [ ] Game plays without 20-second delays
- [ ] Events advance on user input
- [ ] Save/load works reliably
- [ ] No event hanging or infinite loops

### High Priority Success:
- [ ] Basic test coverage (>50% core functions)
- [ ] Clear error messages for common issues
- [ ] Stable memory usage during gameplay
- [ ] Graceful error handling

### Medium Priority Success:
- [ ] Monaco autocompletion works
- [ ] Performance optimized for large projects
- [ ] Security vulnerabilities addressed
- [ ] Professional development experience

Remember: **Fix critical issues first before adding new features.** The engine must be functional before it can be enhanced.