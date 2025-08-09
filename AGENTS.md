# AGENTS

## Scope

These instructions apply to the entire repository.

## Setup & Development

- Use Node.js 22 LTS (match the version used in CI or `.nvmrc` if present).
- Install dependencies with `npm install`.
- Run `npm run build sample` to ensure the project builds without errors before committing.

## Coding Style

- Use [Prettier](https://prettier.io/) for formatting:
  - Format changed files with `npx prettier --write <files>` before committing.
  - Prefer 2-space indentation, single quotes, and trailing semicolons.
- Keep Vue single-file components (`*.vue`) and related JavaScript/TypeScript files inside `src/`.
- Ensure Tailwind classes follow the existing utility-first style.

## Commit Messages

- Use conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, etc.).
- Limit the subject line to 50 characters; wrap body text at 72 characters.

## Pull Requests

- Summarize the changes and how they were tested (e.g., `npm run build sample`).
- Note any relevant issues or tasks.
- Mention if you added or updated any scripts or sub-projects under `projects/`.
