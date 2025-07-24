# VueVN Core Engine

This directory contains the core functionality of the VueVN Visual Novel Engine. These are the default implementations that provide the base functionality.

## Important Note

⚠️ **DO NOT MODIFY FILES IN THIS DIRECTORY** ⚠️

These files serve as the default implementation and may be overwritten during updates. Instead, use the plugin system to extend or override any functionality.

## How to Customize

1. Copy any file you want to modify from `core/` to `plugins/` while maintaining the same directory structure
2. Make your modifications in the plugin version of the file
3. The build system will automatically prioritize plugin versions over core versions

## Available Components

- `app/` - Core application components (Engine, Game, etc.)
- `menu/` - Menu system components
- `stores/` - State management
- `utils/` - Utility functions and helpers

For more information about extending the engine, see the [Plugins Documentation](../plugins/README.md).