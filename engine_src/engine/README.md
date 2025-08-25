# VN Engine App Layer Z-Index Guide

This folder contains the core visual novel display components, stacked using z-index for proper layering. Use this as a reference for adding or modifying layers.

**Z-Index Order (bottom to top):**

| Component           | z-index | Purpose                                 |
| ------------------- | ------- | --------------------------------------- |
| Background.vue      | 0       | Main background image                   |
| LocationOverlay.vue | 10      | Location navigation overlay             |
| ActionOverlay.vue   | 10      | Action overlay (same deep LeftAlign)    |
| Drawing.vue         | 20      | Drawable event layer (characters, etc.) |
| Foreground.vue      | 30      | Foreground CGs, special art             |
| Dialogue.vue        | 40      | Dialogue text box                       |
| Choice.vue          | 50      | Choices/menus (always on top)           |
| Custom.vue          | 60      | Custom Empty for Anything               |
| MainMenu.vue        | 80      | Main menu                               |
| SaveLoadMenu.vue    | 90      | SaveLoad menu                           |

- Always keep this order for a consistent VN experience.
- Add new overlays (e.g., inventory, menu) above or below as needed, but document them here.
