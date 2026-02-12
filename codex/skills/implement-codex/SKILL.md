---
name: implement-codex
description: Execute Phase 3 implementation from an approved plan artifact (usually plan.md). Use when requests say "implement it all," require finishing all planned tasks/phases without pausing, require live plan progress updates, require strict typing with no any/unknown, require minimal code comments/JSDoc, and require continuous typecheck while implementing.
---

# Implement Codex

Execute the approved plan to completion and keep `plan.md` as the live source of truth for progress.

## Enforce Non-Negotiables

1. Implement everything in the plan, not a subset.
2. Mark completed tasks/phases in `plan.md` as work is finished.
3. Do not stop until all planned tasks/phases are completed, unless blocked by a hard constraint.
4. Avoid unnecessary comments or JSDoc.
5. Do not introduce `any` or `unknown` types.
6. Continuously run typecheck during implementation, not only at the end.

## Run Phase 3 Implementation Workflow

### 1. Load Execution Scope

- Read `plan.md` and extract all phases/tasks in order.
- Confirm unchecked work items before coding.
- Treat the plan as an execution contract.

### 2. Execute Tasks Mechanically

- Implement tasks in planned order unless dependency constraints require reordering.
- Keep edits aligned with planned file changes.
- If a real-world mismatch requires plan changes, update `plan.md` first, then implement.

### 3. Update Plan Progress Continuously

- After finishing each task, update its checkbox in `plan.md` (`[ ]` -> `[x]`).
- When all tasks in a phase are complete, mark the phase complete in the plan.
- Never defer progress updates to the very end.

### 4. Enforce Code Hygiene and Typing

- Keep code clean and readable without unnecessary comments/JSDoc.
- Use specific existing types or create explicit types when needed.
- Reject shortcuts that rely on `any` or `unknown`.

### 5. Run Continuous Verification

- Run application typecheck repeatedly during execution:
  - `bunx tsc --noEmit --pretty --incremental`
  - `bunx tsc --project tests/tsconfig.json --noEmit --pretty --incremental`
- For broader validation checkpoints, run `bun run lint`.
- Run targeted tests for touched behavior throughout execution, not only at completion.

### 6. Close Only When Done

- Verify all plan tasks/phases are marked completed.
- Run final verification (`typecheck` and relevant tests/lint checks).
- Ensure no partial plan items remain.

## Apply Execution Checklists

- Use `references/execution-checklists.md` to enforce completeness and quality gates.
- Use `references/progress-update-format.md` for consistent plan progress updates.

## Output Requirements

- Completed implementation for all plan tasks/phases.
- Updated `plan.md` with completed checkboxes and phase status.
- No newly introduced `any` or `unknown` types.
- Verification evidence from continuous and final checks.
