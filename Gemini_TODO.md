# Gemini's Detailed VueVN TODO List

**Objective:** To systematically refactor and enhance the VueVN framework. This plan is designed to be executed sequentially by an AI agent. Each task is broken down into specific, verifiable steps.

---

## Phase 1: Codebase Stabilization & Refactoring

*Goal: Create a stable, fully-typed foundation and replace the temporary `dev_src` backend.*

- [x] **Task 1.1: Full TypeScript Conversion**
  - [x] Convert `scripts/add-project.cjs` to `scripts/add-project.cts`.
  - [x] Convert `scripts/build.cjs` to `scripts/build.cts`.
  - [x] Convert `scripts/copy-assets.cjs` to `scripts/copy-assets.cts`.
  - [x] Convert `scripts/dev.cjs` to `scripts/dev.cts`.
  - [x] Convert `scripts/generate.cjs` to `scripts/generate.cts`.
  - [x] Convert `scripts/generate-components-index.cjs` to `scripts/generate-components-index.cts`.
  - [x] Convert `scripts/generate-engine-index.cjs` to `scripts/generate-engine-index.cts`.
  - [x] Convert `scripts/generate-events-index.cjs` to `scripts/generate-events-index.cts`.
  - [x] Convert `dev_src/index.js` to `dev_src/index.ts`.
  - [x] Convert `dev_src/routes/assets.js` to `dev_src/routes/assets.ts`.
  - [x] Convert `dev_src/routes/files.js` to `dev_src/routes/files.ts`.
  - [x] Convert `dev_src/routes/project.js` to `dev_src/routes/project.ts`.
  - [x] Convert `dev_src/routes/state.js` to `dev_src/routes/state.ts`.
  - [x] Convert `src/editor/stores/editorState.js` to `src/editor/stores/editorState.ts`.
  - [x] Convert `src/editor/utils/monacoLoader.js` to `src/editor/utils/monacoLoader.ts`.
  - [x] Convert `src/editor/docs/EventTemplates.js` to `src/editor/docs/EventTemplates.ts`.
  - [x] Update all `require` and `module.exports` syntax in the converted `.cts` files to ES Modules syntax (`import`/`export`).
  - [x] Add types for all function parameters and return values in the newly converted files.
  - [x] Run `npm run build sample` to ensure all conversions and typing were successful. (Fixed import typo in `dev_src/index.ts`)

- [x] **Task 1.2: Deprecate `dev_src` with a Vite Plugin**
  - [x] Create a new directory: `vite-plugins`.
  - [x] Create a new file: `vite-plugins/api.ts`.
  - [x] In `vite-plugins/api.ts`, create a new Vite plugin. This plugin will use the `configureServer` hook to replicate the API endpoints from `dev_src` (e.g., for listing files, reading content, creating files).
  - [x] Update `vite.config.js` to use this new local plugin instead of the `dev_src` setup.
  - [x] Delete the `dev_src` directory entirely.
  - [x] Run `npm run add=project sample_build` `npm run build sample_build`to verify all conversion is ok.

- [ ] **Task 1.3: Implement Editor-Game Communication Channel**
  - [ ] Create a new utility file `src/editor/utils/communication.ts`.
  - [ ] In this file, export a `BroadcastChannel` instance named `editorChannel`.
  - [ ] In `StateEditorPanel.vue`, instead of using `fetch` to an API, use `editorChannel.postMessage()` to send state update events.
  - [ ] In `engine/runtime/Engine.ts`, listen for messages on the `editorChannel` and update the Pinia state accordingly when a message is received from the editor.

---

## Phase 2: Editor Enhancements

*Goal: Implement the core features of the integrated development environment.*

- [ ] **Task 2.1: Monaco Editor Autocompletion**
  - [ ] In `editor/components/MonacoEditor.vue`, read the content of the engine's type definition files (e.g., `src/engine/runtime/EngineAPI.ts`, `src/engine/runtime/types.ts`) as raw strings.
  - [ ] Use `monaco.languages.typescript.typescriptDefaults.addExtraLib()` to add these type definitions to the Monaco editor instance.
  - [ ] Verify that autocompletion for methods like `engine.showText(...)` works when editing an event file.

- [ ] **Task 2.2: Event Condition Bypass**
  - [ ] Add a "Bypass Conditions" toggle button to `ProjectEditor.vue`.
  - [ ] When toggled on, use the `editorChannel` to post a message to the game, e.g., `{ type: 'SET_DEBUG_FLAG', payload: { bypassConditions: true } }`.
  - [ ] In the `engineState` store, add a new `debugFlags` property.
  - [ ] In `engine/runtime/EngineEvents.ts`, modify the `getEvents` function to check for `engineState.debugFlags.bypassConditions`. If true, it should treat all events as if their `conditions` returned true.

---

## Phase 3: Internationalization (i18n)

*Goal: Integrate a flexible i18n system for both the editor and game content.*

- [ ] **Task 3.1: Integrate `vue-i18n`**
  - [ ] Install `vue-i18n` using npm: `npm install vue-i18n`.
  - [ ] Create a new setup file `src/i18n.ts` to configure and export the i18n instance.
  - [ ] Update `src/main.ts` to use the new i18n instance.

- [ ] **Task 3.2: Translate Editor UI**
  - [ ] Create language resource files, e.g., `src/locales/en.json`, `src/locales/fr.json`.
  - [ ] Replace all static text in the editor components (`ProjectEditor.vue`, `MonacoEditor.vue`, etc.) with `t('key')` calls from `vue-i18n`.

- [ ] **Task 3.3: Translate Game Content**
  - [ ] Add a `language` property to the `gameState` store.
  - [ ] Modify the `engine.showText` and `engine.showChoices` methods. They should now accept a translation key (e.g., `intro.welcome_text`).
  - [ ] Inside these methods, use the `i18n` instance to look up the translated string for the `gameState.language`.
  - [ ] Add a language switcher UI to the `MainMenu.vue` component.