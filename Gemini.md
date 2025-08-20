# Gemini's Notes for VueVN

This document contains my understanding of the VueVN project, including its architecture, key components, and development workflow. I will use this information to help improve the project, fix bugs, and add new features.

## Project Overview

VueVN is a visual novel engine built with Vue 3, Vite, and Tailwind CSS. It provides a complete solution for creating, editing, and playing visual novels. The engine is designed to be highly extensible, allowing developers to customize and override core components to fit their needs.

**Key Technologies:**

*   **Vue 3:** The core framework for building the user interface.
*   **Vite:** The build tool and development server.
*   **Tailwind CSS:** The CSS framework for styling the application.
*   **Pinia:** The state management library for Vue.js.
*   **Monaco Editor:** The code editor used in the project editor.

## Architecture

The project is divided into three main parts:

1.  **Engine:** The core of the visual novel engine, responsible for running the game, managing state, and handling events.
2.  **Editor:** A web-based editor for creating and modifying visual novel projects. It includes a file explorer, a code editor, and a state inspector.
3.  **Projects:** Each visual novel is a separate project with its own assets, events, and configuration.

### Engine

The engine is located in the `src/engine` directory and consists of the following components:

*   **Runtime:** The core of the engine, responsible for running the game loop, executing events, and managing the game state.
*   **Components:** A set of Vue components that make up the game's user interface, such as the dialogue box, choices menu, and background.
*   **Stores:** Pinia stores for managing the engine and game state.

### Editor

The editor is located in the `src/editor` directory and provides a complete development environment for creating visual novels. It includes:

*   **Project Explorer:** A file explorer for navigating the project's files.
*   **Monaco Editor:** A code editor for writing events and scripts.
*   **State Inspector:** A tool for inspecting and modifying the game and engine state in real-time.

### Projects

Each visual novel is a separate project located in the `projects` directory. Each project has the following structure:

*   **assets:** Images, sounds, and other media files.
*   **events:** Game events organized by location.
*   **stores:** Custom game state overrides.
*   **config.json:** Project configuration.

## Key Components

*   **`Engine.ts`:** The main class for the visual novel engine. It manages the game loop, event execution, and state.
*   **`ProjectEditor.vue`:** The main component for the project editor. It combines the file explorer, code editor, and state inspector into a single interface.
*   **`Game.vue`:** The main component for the game itself. It loads the engine and all the necessary components to run the visual novel.
*   **`generate.cjs`:** A set of scripts for generating index files for components, engine modules, and events. This allows for dynamic loading of project-specific files.

## Development Workflow

To set up the development environment, you need to have Node.js 22 or higher installed. Then, follow these steps:

1.  Install the dependencies: `npm install`
2.  Create a new project: `npm run add-project my-novel`
3.  Start the development server: `npm run dev my-novel`
4.  Build the project for production: `npm run build my-novel`

## TODOs and Future Improvements

Based on the `ENGINE_TODO.md` file and my analysis of the code, here are some potential improvements:

*   **Engine Core:**
    *   Implement a robust save/load system with multiple save slots.
    *   Expand the engine API with support for background music, sound effects, and transitions.
    *   Improve error handling and debugging with a developer/debug mode UI.
*   **Editor & Developer Experience:**
    *   Add autocompletion for the engine API in the Monaco Editor.
    *   Provide code templates for new events.
    *   Implement syntax highlighting for event patterns.
*   **General:**
    *   Write comprehensive developer documentation for the engine, events, and plugin authoring.
    *   Create a more extensive sample project to showcase the engine's features.
