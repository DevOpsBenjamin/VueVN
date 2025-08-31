# Custom Actions: Simulation, Execution, and Mini‑Game Design

This document describes how to expose a safe, deterministic `runCustom(args: CustomArgs) => Promise<any>` API to users, how the engine should simulate and then execute custom logic, and how to build a blocking mini‑game that pauses the story until it resolves.

## Goals
- Let content authors run arbitrary logic (UI, timers, physics, animations) without forking engine flow control.
- Keep the engine deterministic, replayable, and save/load safe via simulation → playback.
- Provide a first‑class way to block the narrative loop (e.g., mini‑game) and resume cleanly on completion.

## API Surface
- Engine API (available in events/branches):
  - `await engine.runCustom(args: CustomArgs): Promise<any>`
- CustomArgs is a serializable object (seed, difficulty, payload). It must be JSON‑serializable.

Example usage in an event:
```ts
await engine.showText('You found a locked chest.');
const outcome = await engine.runCustom({ id: 'lockpick', seed: 1234, difficulty: 'hard' });
if (outcome?.success) {
  await engine.showText('Click! It opened.');
} else {
  await engine.showText('The pick broke.');
}
```

## Simulation → Playback Model
The engine always performs two phases per event step:
- Simulation (SimulateRunner): builds a reversible history of actions, using a copy of game/engine state.
- Playback (ActionExecutor): replays actions, handles user input, renders UI.

For custom actions:
- Simulation:
  - `SimulateRunner.runCustom(args)` pushes a `RUN_CUSTOM` action into history and ends the current step.
  - No mini‑game logic runs here. Optionally, simulation can compute a deterministic “expected outcome” from `args.seed` if the author wants fixed outcomes on replay.
- Playback:
  - `ActionExecutor.handleCustomAction` (see below) reads the recorded `args`, renders the custom UI, and awaits its resolution.

## Execution Lifecycle (Playback)
1. ActionExecutor sees `RUN_CUSTOM`.
2. It calls the global Custom Registry with `args.id` to obtain a handler.
3. It mounts a Vue overlay component (or calls a non‑visual task) and passes in:
   - `args`
   - a `resolveBranch(branchId: string)` function
   - a `reject(error)` function
4. Engine UI is paused (navigation waits are disabled except for the custom overlay).
5. When the overlay calls `resolveBranch('some-branch')`, the engine enqueues a `JUMP` action with that `branch_id`.
6. Playback simulates the target branch like a normal choice jump; the current event does not continue execution afterwards.
7. Overlay unmounts; input listeners re‑enable normal navigation.

Handler signature example:
```ts
interface CustomBranchHandler {
  // Optional pure simulation preview (not required)
  simulate?: (args: CustomArgs) => { preview?: any };
  // Required execution logic — returns a disposer/cleanup function
  execute: (ctx: {
    args: CustomArgs;
    resolveBranch: (branchId: string) => void;
    reject: (err?: any) => void;
  }) => () => void;
}
```

## Determinism & Seeding
- If custom logic is stochastic, authors should pass a `seed` in `args` and use a deterministic RNG.
- The simulation phase should never rely on wall clock or ambient randomness.
- If authors need a predetermined outcome (e.g., scripted success), compute it from `args` (or store an explicit value in `args`).

## Save/Load Safety
- `RUN_CUSTOM` action stores:
  - `args` (serializable) and full state snapshots (as with other actions).
- On reload, if a custom action is in progress, the playback re‑mounts the overlay with the same `args`.
- Overlays must be idempotent: mounting twice with the same props should not break.

## Error Handling & Timeouts
- Overlays should time out (optional) and call `reject(new Error('timeout'))` to prevent deadlocks.
- ActionExecutor catches rejections; in debug mode it can surface a dialog and allow skipping.
- Always clear overlays in finally blocks.

## Blocking Mini‑Game: Example Blueprint
Goal: block the engine until the player finishes a quick reaction mini‑game.

1) Register the handler
```ts
// custom/registry.ts
import { register } from './registry';
register('reaction', {
  execute: ({ args, resolveBranch }) => {
    // mount a Vue component in an overlay root
    const app = mountOverlay(ReactionGame, {
      seed: args.seed,
      difficulty: args.difficulty,
      onDone: (result: { success: boolean; score: number }) => {
        resolveBranch(result.success ? 'success' : 'failure');
        app.unmount();
      },
    });
    // return disposer in case engine needs to cancel
    return () => app.unmount();
  },
});
```

2) The Vue component
```vue
<template>
  <div class="fixed inset-0 bg-black/70 grid place-items-center z-50">
    <!-- mini‑game UI; on finish emits onDone -->
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ seed:number; difficulty:string; onDone:(r:any)=>void }>();
// deterministic RNG from seed
// run game loop; when finished:
// props.onDone({ success: true, score: 42 });
</script>
```

3) Event usage
```ts
await engine.runCustom({ id: 'reaction', seed: 9876, difficulty: 'normal' });
// No result handling — the engine jumps into the chosen branch:
// branches: { success: {...}, failure: {...} }
```

## Simulation Stub
- `SimulateRunner.runCustom(args)` records the action and ends the step; no UI and no blocking.
- If authors want to preview outcomes in the editor, the registry may implement `simulate(args)` to compute a preview for the editor, never for the engine.

## UI/Overlay Integration
- Overlays should live in a dedicated z‑layer above engine UI.
- While a custom overlay is active:
  - disable engine navigation (continue/back/choices)
  - prevent HMR state loss (hot overlays should remount cleanly)
- When resolved, restore engine state and continue the loop.

## Registration & Discovery
- Provide a central registry module:
```ts
const map = new Map<string, CustomHandler>();
export function register(id: string, h: CustomHandler) { map.set(id, h); }
export function get(id: string) { return map.get(id); }
```
- ActionExecutor looks up `get(args.id)`; if missing, fail fast in debug builds.

## Security & Boundaries
- Custom handlers run in the same JS context: do not allow arbitrary DOM querying outside the overlay root.
- Require serializable `args`; do not pass functions or circular data.
- Keep handlers pure UI/logic; game state mutations should happen via returned result, not directly inside the overlay.

## Summary
- `runCustom` is recorded in history and replayed deterministically.
- Mini‑games block the engine by mounting an overlay and resolving a promise; the engine loop waits naturally.
- With seeds and serializable args, replays and save/load remain stable. Overlays must unmount cleanly on resolve/reject.
