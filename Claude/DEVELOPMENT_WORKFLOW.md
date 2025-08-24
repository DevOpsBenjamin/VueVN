# Development Workflow for Claude Code

## Commit Strategy

### Small Incremental Commits
- **One file change per commit** when possible
- Commit even if code doesn't compile (iteration process)
- Push frequently so human can monitor progress
- Clear commit messages explaining each change

### Commit Message Format
```
feat: add NewEngine.ts with basic structure
fix: resolve TypeScript compilation error in NewEngine
refactor: update VNAction type definitions
```

### When to Request Human Interaction

Create `Claude/HUMAN_REQUEST.md` when:
- Stuck and can't proceed without feedback
- Need clarification on requirements
- Ready for human testing of implemented features
- Significant milestone reached

### Before Finishing
- Run `npm run build sample` to test compilation
- Fix any build errors with solving commits
- Push all changes for review

### Example Workflow
1. Read `Claude/ENGINE_ARCHITECTURE_TODO.md`
2. Implement one component at a time
3. Commit each file change individually
4. Push after every few commits
5. Create HUMAN_REQUEST.md when stuck or ready for testing

## Current Focus
Implementing dual-phase engine architecture as defined in `Claude/ENGINE_ARCHITECTURE_TODO.md`.