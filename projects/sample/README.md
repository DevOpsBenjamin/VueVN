# sample

A visual novel created with VueVN.

## Project Structure

- `events/` - Game events organized by location
- `assets/` - Images, sounds, and other media files
- `stores/` - Custom game state overrides (NPCs, flags, etc.)
- `config.json` - Project configuration

This sample includes an intro event in `events/start/intro.js`, a follow-up event
in `events/bedroom/wake-up.js`, and a sample NPC defined in
`stores/baseGameState.js`.

## Development

```bash
# Start development server
npm run dev sample

# Build for production
npm run build sample
```

## Adding Events

Create new events in `events/[location]/[event-name].js`:

```javascript
export default {
  id: 'unique_id',
  name: 'Event Name',
  conditions: (state) => true, // When this event should trigger
  async execute(engine, state) {
    // Your event logic here
  }
};
```

## Customizing the Engine

Override any core component by creating a file in your project with the same path as in the engine.

Example: To customize the main menu, create `menu/MainMenu.vue`.
