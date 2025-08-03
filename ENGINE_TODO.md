# VueVN Engine To-Do List

This document tracks the main tasks and priorities for getting the core engine working and ready for use. The focus is on the engine itself, with the `sample` project as the main test/reference implementation.

## Engine Core (Highest Priority)

- [ ] **Fix engine runtime loading and event execution**
  - [ ] Ensure events load dynamically from the correct project folder
  - [ ] Validate event structure and error handling
  - [ ] Support hot-reload for all event and plugin files
- [ ] **Implement save/load system**
  - [ ] Serializable game state (Pinia store)
  - [ ] Multiple save slots
- [ ] **Expand engine API**
  - [ ] Add support for background images, music, and sound
  - [ ] Add transitions and effects (fade, etc.)
  - [ ] Expose all API methods to events (showText, showChoices, setVar, etc.)
- [ ] **Improve error handling and debugging**
  - [ ] Show clear errors for bad events or plugin code
  - [ ] Add developer/debug mode UI

## Editor & Developer Experience

- [ ] Monaco Editor: autocompletion for engine API
- [ ] Code templates for new events
- [ ] Syntax highlighting for event patterns
- [ ] State inspector and live preview

## Sample Project

- [ ] Expand `sample` with more events and locations
- [ ] Use as main regression test for engine changes

## General

- [ ] Write developer documentation for engine/event/plugin authoring
- [ ] Regularly test production builds
- [ ] Keep assets and code organized

---

**Note:**

- Do not modify `engine/core/` directly; use plugins for overrides.
