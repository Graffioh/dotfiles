---
name: plan-codex
description: Execute Phase 2 planning after research by producing a persistent plan.md implementation artifact. Use when requests ask for a detailed implementation plan, ask to base the plan on actual source files, require file-by-file changes with code snippets, request trade-off analysis, ask for a granular todo checklist with phases/tasks, or ask for planning migrations such as offset-to-cursor pagination.
---

# Plan Codex

Convert reviewed research into an implementation-ready `plan.md` file grounded in the actual codebase.

## Enforce Non-Negotiables

1. Write a persistent markdown artifact (`plan.md`), never only a chat plan.
2. Read relevant source files before proposing changes.
3. Base decisions on current code structure, conventions, and constraints.
4. Include file paths, concrete code snippets, and trade-offs in every substantial plan.
5. Add a detailed todo checklist with phases and individual tasks before implementation starts.
6. Treat the markdown plan as the source of truth, not built-in plan mode.

## Run Phase 2 Planning Workflow

### 1. Define Planning Contract

- Capture feature intent, business outcome, and constraints.
- Capture required artifact path (`plan.md` unless user specifies otherwise).
- Load prior research artifact (`research.md`) when available.
- Confirm assumptions when requirements are underspecified.

### 2. Ground the Plan in Code

- Identify and read the exact files likely to change.
- Trace relevant flows end-to-end (handlers, services, repositories, types, tests, migrations).
- Reconcile findings with existing patterns in the codebase.
- Refuse abstract plans that are not mapped to concrete files.

### 3. Design the Approach

- Propose a primary implementation strategy aligned with current architecture.
- Evaluate at least one meaningful alternative when trade-offs exist.
- Document why the chosen approach fits this codebase better than alternatives.
- Call out compatibility, migration, and rollout strategy.

### 4. Build File-by-File Change Plan

For each file, specify:

- why it changes
- exact change shape (new type/function/endpoint/query/test/migration)
- representative snippet of intended code
- dependencies on other file changes

### 5. Add Granular Todo List

- Add a dedicated "Todo List" section in `plan.md`.
- Break the implementation into phases with explicit task checkboxes.
- Keep tasks granular enough to act as an execution tracker in long sessions.
- During later implementation turns, update checkbox states (`[ ]` -> `[x]`) as tasks are completed.
- Mark this as planning-only output: do not implement during this step.
- Ensure every task maps back to scoped file changes or tests.

### 6. Include Validation Strategy

- Specify test updates by layer (unit/integration/e2e).
- Specify backward-compatibility checks.
- Specify observability or telemetry checks for risky changes.
- Specify rollout and rollback considerations for production-impacting work.

### 7. Write `plan.md`

- Use `references/plan-template.md` as the default output structure.
- Keep snippets realistic and aligned with project style.
- Reference exact file paths and expected API/behavioral diffs.
- Mark unresolved questions and decision gates clearly.

## Apply Scenario-Specific Planning Checks

- Use `references/planning-checklists.md` for source-grounded planning checks.
- For pagination migrations, apply the cursor migration checklist before finalizing.
- For user-provided reference implementations, map concepts to local code; do not copy blindly.
- Apply the todo checklist quality checks before returning the plan.

## Output Requirements

- Detailed explanation of implementation approach.
- Concrete list of files to modify.
- Code snippets that illustrate actual planned changes.
- Detailed todo list with phases and individual tasks (implementation not started yet).
- Considerations, risks, and trade-offs.
- Open questions and explicit assumptions.
