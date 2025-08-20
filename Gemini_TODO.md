# Gemini's VueVN TODO List

This is a prioritized list of tasks to fix critical issues, complete the core engine, and improve the overall framework to make it "VN Ready".

---

## P0: Critical Engine Fixes

*These tasks address fundamental issues preventing the engine from running correctly.*

- [ ] **Fix the Game Loop:** The main game loop in `engine/runtime/Engine.ts` currently uses a `setTimeout` placeholder. This needs to be replaced with a proper, continuous loop that checks for and executes events, or waits for user input when no events are available.
- [ ] **Decouple Engine from `window`:** The engine instance is currently accessed globally via `window.__VN_ENGINE__` in components like `SaveLoadMenu.vue`. This should be refactored. The engine instance should be managed through Pinia actions or another dependency injection method to avoid global scope pollution.
- [ ] **Fix Dev Server State Sync:** The `dev_src` API keeps its own state snapshot, which is completely disconnected from the client's live Pinia state. This will not work for live editing. This should be re-architected, possibly using WebSockets or `postMessage` to communicate directly between the editor and the running game instance.

---

## P1: Core Framework Features

*The minimal feature set required for the framework to be considered a usable Visual Novel engine.*

- [ ] **Implement a Robust Awaiter System:** The `resolveAwaiter` mechanism is a good start but must be fully integrated. The game loop must properly pause when the engine is awaiting input (e.g., for `showText` or `showChoices`) and only resume when input is received.
- [ ] **Complete Save/Load Functionality:** The UI exists, but the save/load logic needs to be hardened. The `startEventReplay` function must be able to reliably restore the exact game and UI state, including any active dialogue or choices.
- [ ] **Implement Drawable Events:** The `Drawing.vue` layer is currently a placeholder. The engine needs a system to render and manage drawable events (e.g., character sprites, on-screen objects) and allow user interaction with them.
- [ ] **Location and Navigation:** Implement the logic for the `LocationOverlay.vue` to show possible navigation options and allow the player to move between locations, which in turn will trigger new events.
- [ ] **In-Game Error Overlay:** Replace all `window.alert()` calls for error handling with a non-blocking, in-game overlay. This will prevent the entire application from freezing on an event script error.

---

## P2: Editor & Developer Experience

*Improvements to make creating content easier and more efficient.*

- [ ] **Monaco Editor Autocompletion:** Implement autocompletion for the `engine` API methods (`showText`, `setBackground`, etc.) within the editor. This is a massive quality-of-life improvement for event scripting.
- [ ] **Isolate Event Testing:** Add a "Run This Event" button in the editor to allow developers to test a single event in isolation without having to play through the entire game to trigger its conditions.
- [ ] **Refactor Project Scaffolding:** Extract the large, hardcoded file templates in `scripts/add-project.cjs` into separate `.template` files to make the scaffolding script cleaner and easier to manage.

---

## P3: Code Quality & Refactoring

*Tasks to improve the long-term health and maintainability of the codebase.*

- [ ] **Increase Type Safety:** Convert remaining JavaScript files to TypeScript (e.g., in `dev_src/`, `editor/stores/`, `editor/utils/`) and eliminate usages of `any` where possible.
- [ ] **Separate Asset Copying Logic:** The asset copying logic is currently inside `scripts/build.cjs`. Move this logic to the (currently empty) `scripts/copy-assets.cjs` script to improve separation of concerns.
- [ ] **Centralize State Actions:** Instead of components directly patching state (`engineState.$patch(...)`), they should call actions on the stores. This makes state changes more predictable and easier to debug.
