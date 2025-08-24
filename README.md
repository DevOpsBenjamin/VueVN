# VueVN - Visual Novel Engine

VueVN is a modern visual novel engine powered by Vue 3 and TypeScript that provides natural development experience with Ren'Py-like functionality.

## Features

- **Dual-Phase Engine**: Simulation + playback architecture for perfect save/load
- **Natural TypeScript**: Write events with normal async/await code  
- **Text-by-Text History**: Go back/forward through dialogue like Ren'Py
- **Project Isolation**: Each visual novel is a separate project
- **Extensible Architecture**: Override any engine component through generated imports
- **Custom Logic Support**: Minigames and complex interactions integrated seamlessly

## Quick Start

```bash
# Install dependencies
npm install

# Create a new visual novel project
npm run add-project my-novel

# Start development server with hot-reload
npm run dev my-novel

# Build for production
npm run build my-novel

# Type checking
npm run check
```

## Architecture

The engine uses a **dual-phase architecture**:

1. **Simulation Phase**: Your events execute to generate action sequences
2. **Playback Phase**: Actions replay with user interaction and state management

This enables perfect save/load, history navigation, and natural TypeScript development.

## Project Structure

```
projects/my-novel/
├── config.json          # Project configuration
├── events/              # Event TypeScript files organized by location
├── assets/             # Images, sounds, and media
├── stores/             # Custom game state management
└── components/         # Custom Vue components
```

## Event Development

Write events using natural TypeScript with the EngineAPIForEvents:

```typescript
export default {
  id: 'intro',
  name: 'Introduction',
  async execute(engine, gameState) {
    await engine.showText('Welcome to my novel!', 'Narrator');
    await engine.setBackground('/assets/images/room.png');
    
    const choice = await engine.showChoices([
      { text: 'Continue story', jump_id: 'chapter1' },
      { text: 'Visit settings', jump_id: 'settings' }
    ]);
    
    await engine.jump(choice.jump_id);
  }
}
```

## Current Status

✅ **Core Engine**: Fully functional dual-phase architecture  
✅ **Build System**: Production builds work (120KB optimized output)  
⚠️ **Type Safety**: Some TypeScript errors in UI components (non-blocking)  

See `CLAUDE.md` for detailed development guidance and architectural documentation.

## Development

This project demonstrates modern web development with AI assistance, showcasing TypeScript, Vue 3, and advanced state management patterns.