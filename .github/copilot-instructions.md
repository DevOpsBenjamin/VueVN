# Interactive Fiction Engine - Copilot Instructions

## Project Context
We are building a code-first interactive fiction engine inspired by Ren'Py but for the web. The system uses event-driven architecture instead of flowcharts, with events organized by location and triggered by conditions.

## Technology Stack
- Vue 3 with Composition API and `<script setup>` syntax
- Pinia for state management
- Monaco Editor for code editing
- Vite for build and hot module replacement
- JavaScript (no TypeScript in prototype phase)

## Code Standards

### Vue Components
- Always use `<script setup>` syntax for Vue components
- Use `ref()` and `reactive()` from Vue for reactive state
- Prefer functional components with Composition API
- Keep components under 200 lines
- Use PascalCase for component names

### JavaScript Patterns
- Use ES6+ modules with `export default`
- Prefer `const` over `let`, avoid `var`
- Use async/await for asynchronous operations
- Use destructuring for cleaner code
- Always handle errors in async functions

### Event Structure
Events must follow this exact pattern:
```javascript
export default {
  id: 'unique_event_id',
  name: 'Human Readable Name',
  conditions: (state) => boolean,
  async execute(engine, state) { /* logic */ }
}
```

### Engine API Methods
The engine object provides these methods:
- `engine.showText(text)` - Display text with continue button
- `engine.showChoices(choices)` - Show choice menu
- `engine.setBackground(imagePath)` - Change background image
- `engine.setVar(path, value)` - Update state using lodash path notation

### File Organization
- Components in `src/components/` with subfolders by feature
- Game events in `public/game/events/[location]/[event].js`
- Stores in `src/stores/` using Pinia pattern
- Templates in `src/templates/`

### State Management
- Use Pinia stores for all application state
- Game state separate from editor state
- State should be serializable for save/load functionality
- Use reactive patterns, avoid direct mutations

### Monaco Editor Integration
- Provide code templates for new events
- Include autocompletion for engine API
- Enable hot reload on save
- Syntax highlighting for game-specific patterns

### Development Workflow
- Always ask for confirmation before major changes
- Implement features incrementally
- Prioritize hot reload and developer experience
- Keep the prototype simple and extensible

## Common Patterns

### Loading Events
```javascript
const eventModule = await import(`/game/events/${location}/${eventId}.js`)
const event = eventModule.default
```

### Condition Evaluation
```javascript
if (event.conditions && !event.conditions(state)) {
  return false // Event not available
}
```

### Choice Handling
```javascript
const choice = await engine.showChoices([
  { text: "Option 1", id: "option1" },
  { text: "Option 2", id: "option2" }
])
```

## Important Notes
- This is a prototype - keep it simple
- Focus on developer experience over optimization
- Everything should be hot-reloadable
- No build steps required for game content
- Events are just JavaScript modules

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

Ce projet est un moteur de fiction interactive Vue 3 + Vite + Monaco Editor + Pinia + Tailwind v3. Priorité à la modularité, au hot reload et à l'autocomplétion via JSDoc. Les events sont des modules JS reloadables à chaud.