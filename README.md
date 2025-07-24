# VueVN - Visual Novel Engine

A modern visual novel engine built with Vue 3, Vite, and Monaco Editor, featuring a powerful editor and runtime engine.

## Features

- 🎭 Visual Novel runtime engine
- ✍️ Built-in editor with Monaco Editor
- 🎨 Tailwind CSS for styling
- 🚀 Fast development with Vite
- 📦 Component-based architecture
- 🏗️ Project-based workflow

## Tech Stack

- **Frontend Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Code Editor**: Monaco Editor
- **Styling**: Tailwind CSS v3
- **Utilities**: lodash

## Project Structure

```
src/
├── editor/               # Editor components and logic
│   ├── components/       # Reusable editor components
│   ├── docs/            # Documentation
│   ├── stores/          # Editor state management
│   ├── ProjectEditor.vue # Main editor component
│   └── ProjectSelector.vue # Project selection UI
├── engine/              # Core engine implementation
│   ├── core/            # Core engine logic
│   └── plugins/         # Engine plugins
├── generate/            # Game generation logic
├── App.vue              # Root component
└── main.js              # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v16 or later recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start a new project
npm run dev

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development Workflow

The project supports two modes:

1. **Development Mode**: Full editor interface with project selection and editing capabilities
2. **Production Mode**: Runtime-only mode for playing the visual novel

### Key Scripts

- `npm run dev`: Start development server with hot-reload
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run generate`: Generate game files

## Project Configuration

Project configuration files:

- `vite.config.js`: Vite configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS configuration

## License

MIT
