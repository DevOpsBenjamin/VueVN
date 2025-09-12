# 2-Advance Dating Sample — Rework Plan

This plan refactors the dating storyline to use text files consistently, enforce a clear progression, and rely only on choices + text + branch jumps (no runCustom). Work proceeds in phases so we can iterate safely and keep a playable demo at each step.

## Objectives
- Narrative: coherent, progressive dating flow (stranger → acquaintance → friend → close_friend), with daily limits and variety.
- Technical: texts in per-scope files; branch-only routing (await engine.showText + engine.showChoices + branch jumps); correct unlock/lock/conditions.
- Authoring: predictable structure per location/scope with minimal boilerplate; translations easy to maintain.

## Constraints
- No runCustom; only choices/text/jump-in-branch.
- Use generated texts (`@generate/texts`) everywhere.
- Keep compatibility with EventManager cache (unlocked/locked/conditions semantics).

## Current State (high level)
- neighbor_entrance: knock-door router + multiple relation/time branches.
- cafe: talk_barista with relation/day gating.
- global intro, plus some additional morning/evening events.
- Translations exist for en/fr; generator now supports all languages and nested scopes.

## Systems & State
- Relation: enum states (stranger, acquaintance, friend, close_friend) + numeric relation (0–100).
- Daily flags: hasInteractedToday per NPC; used to gate repeat events.
- Money/time/energy: used sparingly to pace days.

## Proposed Progression (milestones)
1) Day 0 intro (global): establishes player + neighbor + cafe.
2) Early knocks (neighbor_entrance/knock_door/*): stranger → acquaintance.
3) First talk at cafe (cafe/talk_barista/*): acquaintance path + daily cap.
4) Choice arcs (date invitations): friend path branches with success/failure.
5) Close friend arcs: deeper choices, small gifts, optional mini‑events.

## Event Inventory & Scopes (target organization)
- neighbor_entrance/texts/knock_door/{en,fr,...}.ts
- cafe/texts/talk_barista/{en,fr,...}.ts
- Optionally nested scopes for sub‑arcs: e.g. talk_barista/evening, knock_door/late.

## Refactor Tasks
- Replace literals with texts: for every await engine.showText, map to a key in the nearest scope.
- Branch routing only: where code conditionally calls engine.jump('<id>'), keep it intra‑event (branch ids); cross‑event changes should happen via flags + cache on the next loop.
- Unlock/lock rules:
  - unlocked: relation/daily/time gates to expose a branch set.
  - conditions: real‑time (hour/day), daily caps, energy/money guardrails.
  - locked: one‑shot scenes as needed (e.g., first intro).
- Choices: ensure every user decision returns to the loop with meaningful state changes (relation++, flags, time shift).

## Translations (i18n)
- Nested scopes per file; generator emits all langs. Keys should be short and semantic (e.g., stranger_door_slightly, invite_success).
- Fill missing keys (EN baseline), then FR; keep generator as the single source for UI checks.

## QA & Validation
- Per‑arc walkthroughs: stranger → acquaintance, acquaintance → friend, friend → close_friend.
- Daily cap tests: repeated entry the same day picks appropriate “already interacted today” branch.
- Language check: Dashboard “Text Keys” and “Missing Translations” align with Texts tab.
- Save/load mid‑arc and post‑event; resume correctly.

## Milestones
- M1 Audit: file listing, current branches, missing texts, relation gates.
- M2 Text pass: replace literals in neighbor_entrance + cafe; fix missing keys.
- M3 Flow pass: normalize unlock/lock/conditions; ensure no cross‑event jumps.
- M4 Polish: choice wording, relation deltas, time shifts; FR/EN parity.
- M5 QA: walkthroughs + fixes; final read‑through.

## Work Log & Notes (to iterate)
- [ ] M1: Collect current scopes/branches; flag missing texts.
- [ ] M2: Text migration PR (neighbor_entrance, cafe).
- [ ] M3: Branch map diagrams for each event (router → branches).
- [ ] M4: Final translation pass.
- [ ] M5: QA checklist outcomes.

---

This plan will be updated as we make progress and refine the branching maps.
