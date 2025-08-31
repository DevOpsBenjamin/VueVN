# Repository Guidelines

## Project Structure & Module Organization
- `engine_src/`: Runtime engine (Vue 3 + TS, Pinia components, stores).
- `editor_src/`: In-browser editor UI.
- `projects/<name>/`: Per-game content (locations, events, texts, assets, plugins). Aliases: use `@generate` for runtime; `@editor` only in editor files. `@engine`/`@project` are internal targets resolved by the generator.
- `generate/`: Codegen helpers used by build/verify.
- `scripts/`: TSX scripts (`dev`, `build`, `verify`, scaffolding, i18n).
- `public/`, `dist/`: Static assets and build outputs.
- Tooling: `vite*.js`, `tailwind.config.js`, `vite-plugins/`.
Example: `projects/2-advance-sample/locations/bedroom/events/try_sleep.ts`.

## Build, Test, and Development Commands
- `npm run dev <project>`: Start editor + engine (Vite dev). Example: `npm run dev 2-advance-sample`.
- `npm run build <project> [/ignore-translations] [/verbose]`: Generate, verify, copy assets, build single-file game (`vite.config.game.js`).
- `npm run verify <project> [/verbose]`: Type-check (vue-tsc) and translation checks.
- `npm run type-check`: TypeScript only.
- `npm run add-project my-novel`: Scaffold from template.
- `npm run export-texts` / `npm run import-texts`: Manage i18n resources.
Note: Node >= 22 required.

## Coding Style & Naming Conventions
- TypeScript strict; 2-space indentation.
- Vue SFC filenames PascalCase (e.g., `SettingsMenu.vue`).
- Content in `projects/` uses snake_case files and feature folders: `locations/<id>/{events,actions,texts}` with `texts/<scope>/<lang>.ts` (e.g., `en.ts`, `fr.ts`).
- Variables/functions camelCase; classes/enums PascalCase; constants UPPER_SNAKE.
- Imports (MANDATORY): use `@generate` for all runtime code; do not import `@engine` or `@project` directly. `@editor` is allowed only under `editor_src`.

## Overrides & Auto-Plugin Model
- Resolution via `@generate`: the generator auto-resolves each import to `@project` if a matching path exists, otherwise falls back to `@engine`.
- Example import (runtime): `import { Game } from '@generate/components'`.
- Component override: place `projects/2-advance-sample/plugins/components/menu/TopBarOverlay.vue` to override `engine_src/components/menu/TopBarOverlay.vue`.
- Store override: implement under `projects/<name>/plugins/stores/`. A base game state override is mandatory (see `projects/2-advance-sample/plugins/stores/gameState.ts`).
- Tailwind: keep utility classes readable and grouped; extract repeated sets into small components.

## Testing Guidelines
- No unit test framework yet. Use:
  - `npm run verify <project>` to block on TS and i18n issues.
  - Manual testing in dev; reproduce, record, and attach screenshots.
- Name repro events descriptively under `projects/<name>/.../events` and clean up after merging.

## Commit & Pull Request Guidelines
- Prefer Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`. Scope when useful: `feat(engine): ...`, `fix(projects/2-advance-sample): ...`.
- PRs include: purpose, summary, affected project(s), steps to verify (`npm run dev <project>`), and screenshots for UI changes. Link issues.

## Security & Configuration Tips
- Don’t hardcode project names; rely on `VUEVN_PROJECT` env set by scripts.
- Keep large binaries under `projects/<name>/assets/`; avoid committing unnecessary files.
