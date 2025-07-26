# sample

A visual novel created with VueVN.

## Project Structure

- `plugins/` - Custom components and stores that override the engine defaults
- `events/` - Game events organized by location
- `assets/` - Images, sounds, and other media files
- `config.json` - Project configuration

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

## Customizing Components

Override any core component by creating a file with the same path in `plugins/`:

Example: To customize the main menu, create `plugins/menu/MainMenu.vue`.
