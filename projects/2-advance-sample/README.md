# Sample VueVN Project

A demonstration visual novel showcasing all VueVN engine features including dual-phase execution, history navigation, save/load, and custom minigames.

## Project Structure

- `events/` - TypeScript event files organized by location
- `assets/` - Images, sounds, and media files
- `stores/` - Custom game state management
- `components/` - Project-specific Vue components
- `config.json` - Project configuration

## Test Events

This sample includes comprehensive testing events:

1. **`events/start/intro.ts`**: Basic narrative flow and introduction
2. **`events/bedroom/after-intro.ts`**: State manipulation and dialogue
3. **`events/bedroom/choice-event.ts`**: Choice navigation and conditional logic
4. **`events/bedroom/timing-event.ts`**: Custom minigame integration
5. Various location-based events demonstrating the complete engine feature set

## Development

```bash
# Start development server
npm run dev sample

# Build for production
npm run build sample
```

## Engine Features Demonstrated

- **Dual-Phase Architecture**: Events simulate first, then play back
- **History Navigation**: Text-by-text go back/forward (Left/Right arrows)
- **Save/Load System**: Mid-event saves with fast-forward replay
- **Custom Logic**: TimingGame.vue minigame integrated seamlessly
- **Natural TypeScript**: Standard async/await event development

## Navigation Controls

- **Left Click/Arrow**: Go back in history
- **Right Click/Arrow**: Continue/advance dialogue
- **Shift + Right Arrow**: Go forward in history
- **Escape**: Open main menu

## Adding New Events

Create new events in `events/[location]/[event-name].ts`:

```typescript
export default {
  id: 'unique_id',
  name: 'Event Name',
  async execute(engine, gameState) {
    await engine.showText('Hello world!', 'Character');
    await engine.setBackground('/assets/images/bg.png');
    
    const choice = await engine.showChoices([
      { text: 'Option 1', jump_id: 'event1' },
      { text: 'Option 2', jump_id: 'event2' }
    ]);
    
    await engine.jump(choice.jump_id);
  }
};
```

## Customizing the Engine

Override any core component by creating a file in your project with the same path as in the engine.

Example: To customize the main menu, create `menu/MainMenu.vue`.
