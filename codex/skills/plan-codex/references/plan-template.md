# Plan Template (`plan.md`)

Use this structure for implementation-ready planning artifacts.

## 1. Goal

- Feature:
- Business outcome:
- Scope:
- Non-goals:

## 2. Current State (Code-Grounded)

- Relevant files reviewed:
- Existing flow summary:
- Constraints from current implementation:

## 3. Proposed Approach

- Primary approach:
- Why this approach fits current architecture:
- Alternative considered:
- Trade-offs:

## 4. Detailed Todo List (Do Not Implement Yet)

Create a granular execution checklist grouped by phase.

### Phase 1: [Name]

- [ ] Task 1
- [ ] Task 2

### Phase 2: [Name]

- [ ] Task 1
- [ ] Task 2

Checklist requirements:

- Include all phases required to complete the plan.
- Keep tasks specific enough to mark progress precisely.
- Map tasks to files, tests, or migrations where relevant.
- During implementation, mark completed items as `[x]` to reflect live progress.
- Do not start implementation while producing this plan.

## 5. File-by-File Changes

For each file:

### `path/to/file.ts`

- Purpose of change:
- Planned edits:
- Key snippet:

```ts
// Example planned change
```

## 6. API / Contract Changes

- Request changes:
- Response changes:
- Backward compatibility strategy:

## 7. Data and Storage Changes

- Schema/index/migration changes:
- Backfill strategy (if needed):
- Operational risk:

## 8. Testing Plan

- Unit tests:
- Integration tests:
- End-to-end tests:
- Edge cases and failure-path tests:

## 9. Rollout and Observability

- Rollout strategy:
- Metrics/logs to monitor:
- Rollback strategy:

## 10. Risks and Trade-Offs

- Risk 1:
- Risk 2:
- Decision trade-offs:

## 11. Open Questions

- Question 1:
- Question 2:
