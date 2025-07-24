# VueVN Plugins

This directory is for customizing and extending the VueVN Engine. Any file placed here with the same path structure as in the `core/` directory will automatically override the core implementation.

## How Plugins Work

The build system merges files from `core/` and `plugins/` directories, with plugin files taking precedence. This allows you to:

1. Override any core component by creating a file with the same path in the plugins directory
2. Extend functionality by importing and wrapping core components
3. Add new features that integrate with the existing system

## Creating a Plugin

1. **Start with a copy of the core file** you want to modify:
   ```
   cp src/engine/core/menu/MainMenu.vue src/engine/plugins/menu/MainMenu.vue
   ```

2. **Make your modifications** to the plugin version

3. **The build system will automatically** use your plugin version instead of the core version

## Advanced Usage

### Partial Overrides
You can override specific methods or components while keeping the rest of the core functionality:

```javascript
// In your plugin file
import { OriginalComponent } from '../../../core/original/path';

export default {
  ...OriginalComponent,
  // Override specific methods or computed properties
  methods: {
    ...OriginalComponent.methods,
    customMethod() {
      // Your custom implementation
    }
  }
}
```

### Adding New Features
Create new files in the plugins directory to add features without modifying core:

```
plugins/
  features/
    MyNewFeature.vue
    myNewUtil.js
```

## Best Practices

1. Always maintain the same file and directory structure as core when overriding
2. Document your plugin's purpose and any required setup
3. Test your plugins after engine updates to ensure compatibility
4. Keep plugin-specific code isolated in the plugins directory

## Plugin Priority

If multiple plugins override the same file, the last one loaded takes precedence. The loading order is determined alphabetically by filename.