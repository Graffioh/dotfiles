# Execution Checklists

Use these checklists while running Phase 3 implementation.

## Pre-Execution Checklist

- Confirm `plan.md` exists and is approved.
- Confirm plan contains phases and task checkboxes.
- Confirm scope boundaries and non-goals are clear.
- Identify verification commands before first code change.

## Task Execution Checklist

- Pick the next unchecked task from `plan.md`.
- Implement only what that task requires.
- Keep changes aligned with planned files and architecture.
- Update the task checkbox to `[x]` immediately after completion.
- If phase tasks are all done, mark phase as completed.

## Type Safety and Code Hygiene Checklist

- Do not introduce `any` types.
- Do not introduce `unknown` types.
- Prefer existing domain types before creating new ones.
- Add comments/JSDoc only when necessary for non-obvious logic.

## Continuous Verification Checklist

- Run `bunx tsc --noEmit --pretty --incremental` repeatedly while implementing.
- Run `bunx tsc --project tests/tsconfig.json --noEmit --pretty --incremental` repeatedly while implementing.
- Run focused tests for touched behavior throughout the workflow.
- Use `bun run lint` at broader checkpoints and final pass.
- Fix verification failures before moving to later tasks.

## Completion Gate Checklist

- All plan task checkboxes are `[x]`.
- All phases are marked complete in `plan.md`.
- Final typecheck passes.
- Relevant tests/lint checks pass.
- No unfinished planned work remains.
