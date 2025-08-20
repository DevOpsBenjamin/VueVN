# VueVN Development Plan

This document outlines the strategic plan for developing the VueVN framework, focusing on creating a stable, feature-rich editor and a solid foundation before completing the engine's runtime logic.

---

### Guiding Principles

1.  **Stabilize First:** The highest priority is to create a robust, maintainable, and fully typed codebase.
2.  **Editor-Driven Development:** The developer experience is paramount. The integrated editor is the core feature that will set VueVN apart.
3.  **Decouple and Modularize:** Remove dependencies on global objects (`window`) and tightly coupled modules (`dev_src`) in favor of modern, idiomatic solutions (Vite plugins, standard browser APIs).

---

## Phase 1: Codebase Stabilization & Refactoring

**Objective:** Create a stable, fully-typed foundation and replace the temporary `dev_src` backend with a more robust Vite-integrated solution.

1.  **Full TypeScript Conversion:** Convert all remaining JavaScript files (`.js`, `.cjs`) throughout the project (`scripts`, `editor`, etc.) to their TypeScript counterparts (`.ts`, `.cts`). This will enforce type safety and improve code quality.

2.  **Refactor Build & Dev Scripts:** Clean up the `scripts` directory. Ensure all scripts are typed and robust. The logic for copying assets will be properly separated into its own script.

3.  **Deprecate `dev_src`:** The entire `dev_src` directory will be removed and replaced with two superior solutions:
    *   **Vite API Plugin:** A custom Vite plugin will be created to handle all file system and asset-related API requests (`/api/files`, `/api/assets`, etc.) directly within the Vite dev server. This is the standard, idiomatic way to handle such tasks in a Vite project.
    *   **Editor-Game Communication Channel:** The state-syncing API will be replaced with a `BroadcastChannel`. This standard browser API allows the editor window and the game preview window to communicate directly and in real-time, eliminating the need for a server-side state cache and ensuring perfect synchronization.

## Phase 2: Editor Enhancements

**Objective:** Implement the core features of the integrated development environment (IDE).

1.  **Monaco Editor Autocompletion:** The editor will be enhanced to provide full autocompletion for the Engine's API. This will be achieved by dynamically loading the engine's TypeScript type definition files into the Monaco instance, providing an experience similar to a native IDE.

2.  **Asset Manager UI:** A new Vue component will be built to serve as a visual asset manager. It will use the new Vite API Plugin to list, preview, and select images and sounds for use in events.

3.  **Event Test-Running:** A "Bypass Conditions & Run" button will be added to the editor. This will use the `BroadcastChannel` to send a command to the game preview, telling it to execute the currently edited event immediately, regardless of its in-game conditions. This is crucial for rapid testing and iteration.

## Phase 3: Internationalization (i18n)

**Objective:** Integrate a flexible i18n system for both the editor and the game content.

1.  **Integrate `vue-i18n`:** This library will be added to manage translations.

2.  **Editor UI Translation:** All static text in the editor interface will be moved into language resource files (e.g., `en.json`, `fr.json`), allowing the editor itself to be multilingual.

3.  **Game Content Translation:** The engine's core functions (`showText`, `showChoices`) will be modified to accept translation keys instead of literal strings. The engine will then use `vue-i18n` to display the correct text based on the player's selected language. A language switcher will be added to the game's menu.

## Phase 4: Engine Runtime Development

**Objective:** Complete the core engine functionality on the now-stable foundation.

1.  **Implement the Game Loop:** With the foundation set, the `setTimeout` placeholder will be removed from the engine's game loop and the final, interactive event processing logic will be implemented.

2.  **Finalize Core Features:** The save/load system, drawable events, and location navigation will be completed and tested thoroughly.
